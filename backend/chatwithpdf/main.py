from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
from PyPDF2 import PdfReader
from langchain.text_splitter import RecursiveCharacterTextSplitter
import os
from fastapi.responses import HTMLResponse
from langchain_google_genai import GoogleGenerativeAIEmbeddings
import google.generativeai as genai
from langchain_community.vectorstores import FAISS
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.chains.question_answering import load_qa_chain
from langchain.prompts import PromptTemplate
from dotenv import load_dotenv
import io

load_dotenv()
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

genai.configure(api_key=GOOGLE_API_KEY)

app = FastAPI(title="Research Bot API", description="API for the Research Bot application")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"],  
)

class QuestionRequest(BaseModel):
    question: str

def get_pdf_text(pdf_file):
    text = ""
    try:
        pdf_reader = PdfReader(pdf_file)
        for page in pdf_reader.pages:
            text += page.extract_text()
        return text
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error processing PDF: {str(e)}")

def get_text_chunks(text):
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=10000, chunk_overlap=1000)
    chunks = text_splitter.split_text(text)
    return chunks

def get_vector_store(text_chunks, session_id):
    embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
    vector_store = FAISS.from_texts(text_chunks, embedding=embeddings)
    
    os.makedirs("faiss_indexes", exist_ok=True)
    vector_store.save_local(f"faiss_indexes/faiss_index_{session_id}")
    return "Vector store created successfully"

def get_conversational_chain():
    prompt_template = """
    Answer the question as detailed as possible from the provided context. If the answer is not in
    the provided context, use your knowledge and answer from that.

    Context:
    {context}?

    Question:
    {question}

    Answer:
    """

    model = ChatGoogleGenerativeAI(model="gemini-2.0-pro-exp-02-05", temperature=0.3)
    prompt = PromptTemplate(template=prompt_template, input_variables=["context", "question"])
    chain = load_qa_chain(model, chain_type="stuff", prompt=prompt)
    return chain

def get_ai_response(user_question, session_id):
    try:
        embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
        new_db = FAISS.load_local(f"faiss_indexes/faiss_index_{session_id}", embeddings, allow_dangerous_deserialization=True)
        docs = new_db.similarity_search(user_question)
        chain = get_conversational_chain()
        response = chain(
            {"input_documents": docs, "question": user_question},
            return_only_outputs=True
        )
        return response['output_text']
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating response: {str(e)}")

from fastapi.responses import HTMLResponse

@app.get("/", response_class=HTMLResponse)
async def root():
    """Root endpoint that returns basic API information with HTML formatting"""
    return """
    <html>
        <head>
            <title>Research Bot API</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 20px;
                    line-height: 1.6;
                }
                h1 {
                    color: #2a5298;
                }
                .endpoint {
                    background: #f5f5f5;
                    padding: 15px;
                    border-radius: 5px;
                    margin-bottom: 20px;
                }
                .features {
                    display: flex;
                    justify-content: space-between;
                    flex-wrap: wrap;
                }
                .feature {
                    width: 48%;
                    margin-bottom: 10px;
                    background: #e8f0fe;
                    padding: 10px;
                    border-radius: 5px;
                }
                code {
                    background: #e0e0e0;
                    padding: 2px 5px;
                    border-radius: 3px;
                }
            </style>
        </head>
        <body>
            <h1>Research Bot API</h1>
            <p>Your AI-powered research paper companion API. Upload PDFs and ask questions to get detailed insights.</p>

            <h2>API Endpoints</h2>
            <div class="endpoint">
                <h3>POST /upload/{session_id}</h3>
                <p>Upload a research paper PDF for processing and analysis.</p>
                <p><strong>Required:</strong> PDF file and unique session ID</p>
            </div>

            <div class="endpoint">
                <h3>POST /ask/{session_id}</h3>
                <p>Ask questions about previously uploaded research papers.</p>
                <p><strong>Required:</strong> Question text and matching session ID</p>
            </div>

            <div class="endpoint">
                <h3>GET /health</h3>
                <p>Check if the API is operational.</p>
            </div>

            <h2>Key Features</h2>
            <div class="features">
                <div class="feature">📚 PDF Text Extraction</div>
                <div class="feature">🔍 Vector-based Document Retrieval</div>
                <div class="feature">🤖 AI-powered Question Answering</div>
                <div class="feature">💬 Natural Language Processing</div>
            </div>

            <h2>Getting Started</h2>
            <p>1. Upload your research paper using the upload endpoint</p>
            <p>2. Use the same session ID to ask questions about the paper</p>
            <p>3. Receive detailed AI-generated answers based on the paper content</p>

            <p>For complete API documentation, visit <code>/docs</code> or <code>/redoc</code></p>
        </body>
    </html>
    """
@app.post("/upload/{session_id}")
async def upload_files(session_id: str, file: UploadFile = File(...)):
    """
    Upload and process PDF files
    """
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    
    try:
        contents = await file.read()
        pdf_file = io.BytesIO(contents)
        
        raw_text = get_pdf_text(pdf_file)
        text_chunks = get_text_chunks(raw_text)
        result = get_vector_store(text_chunks, session_id)
        
        return {"message": "PDF processed and indexed successfully", "result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")

@app.post("/ask/{session_id}")
async def ask_question(session_id: str, request: QuestionRequest):
    """
    Ask a question about the uploaded PDFs
    """
    try:
        response = get_ai_response(request.question, session_id)
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating response: {str(e)}")

@app.get("/health")
async def health_check():
    """
    Health check endpoint
    """
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="localhost", port=8000, reload=True)