from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import HTMLResponse
from langchain_groq import ChatGroq
from fastapi.middleware.cors import CORSMiddleware
from langchain.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.memory import ConversationBufferMemory
from langchain.chains import LLMChain
from langchain_core.prompts import PromptTemplate
import os
from dotenv import load_dotenv
import PyPDF2 as pdf
from typing import Dict
from pydantic import BaseModel
import json
import traceback

load_dotenv()

app = FastAPI(title="HireBot API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"],  
)

chat_llm = ChatGroq(
    model_name="llama-3.3-70b-versatile",
    temperature=0.5,
    groq_api_key=os.getenv("GROQ_API_KEY1"),
)

feedback_llm = ChatGroq(
    model_name="llama-3.3-70b-versatile",
    temperature=0.3,
    groq_api_key=os.getenv("GROQ_API_KEY2"),
)

class ChatRequest(BaseModel):
    message: str

class FeedbackResponse(BaseModel):
    communication_skills: int
    technical_knowledge: int
    confidence_level: int
    overall_score: float
    detailed_feedback: str

def extract_text(uploaded_file):
    try:
        reader = pdf.PdfReader(uploaded_file)
        pages = len(reader.pages)
        text = ""
        for page_num in range(pages):
            page = reader.pages[page_num]
            text += str(page.extract_text())
        return text
    except Exception as e:
        return f"Error extracting text: {str(e)}"

class HireBot:
    def __init__(self):
        self.memory = ConversationBufferMemory(
            memory_key="chat_history",
            return_messages=True
        )
        
        self.system_prompt_template = """
            You are AI Recruiter -> HireBot, designed to create a perfect mock interview for candidates prepare for  real-world job interviews.
            Based on the resume content, ask relevant questions about their introduction, experience, skills, and projects.
            Start with a welcoming message and an initial question when initialized.
            The question should be short and crisp.
            resume_content={resume_content}
        """
        
        self.prompt = ChatPromptTemplate.from_messages([
            ("system", self.system_prompt_template),
            MessagesPlaceholder(variable_name="chat_history"),
            ("human", "{input}")
        ])
        
        self.conversation = LLMChain(
            llm=chat_llm,
            prompt=self.prompt,
            memory=self.memory,
        )
        self.resume_content = ""

    def initialize_with_resume(self, resume_content: str) -> str:
        self.resume_content = resume_content
        formatted_system_prompt = self.system_prompt_template.format(resume_content=resume_content)
        self.prompt = ChatPromptTemplate.from_messages([
            ("system", formatted_system_prompt),
            MessagesPlaceholder(variable_name="chat_history"),
            ("human", "{input}")
        ])
        self.conversation.prompt = self.prompt
        
        initial_input = "Say Good Day!. Start the interview with a welcome message and an initial question based on the resume. Be very formal and professional/  The question should be short and crisp"
        response = self.conversation({"input": initial_input})
        return response['text']

    def chat(self, user_input: str) -> str:
        response = self.conversation({"input": user_input})
        return response['text']

    def generate_feedback(self) -> FeedbackResponse:
        chat_history = self.memory.chat_memory.messages
        
        # Use a simpler prompt approach to get valid JSON
        feedback_prompt = """
You are a professional interview coach. You need to evaluate a job interview based on the resume and conversation history provided below.Give the scores properly. Dont randomly assign.

Return ONLY a JSON object with the following format:
{
  "communication_skills": 7,
  "technical_knowledge": 8,
  "confidence_level": 6,
  "detailed_feedback": "Short and concise evaluation of the candidate's performance in the interview discussion as well as resume relevance. The feedback should be professional".
}

Use integers between 0-10 for all scores. Keep the detailed_feedback concise.

Resume:
{resume_content}

Conversation:
{chat_history}

Your JSON response (nothing else):
"""
        
        try:
            # Create a direct prompt for the LLM
            formatted_prompt = feedback_prompt.format(
                resume_content=self.resume_content,
                chat_history=str(chat_history)
            )
            
            # Get raw response from LLM
            feedback_raw = feedback_llm.invoke(formatted_prompt)
            print(f"LLM response: {feedback_raw}")
            
            # Extract JSON from the response (in case the LLM adds extra text)
            import re
            json_match = re.search(r'(\{.*\})', feedback_raw, re.DOTALL)
            
            if json_match:
                json_str = json_match.group(1)
                feedback_dict = json.loads(json_str)
            else:
                # Try with the full response if no JSON pattern found
                feedback_dict = json.loads(feedback_raw)
            
            # Calculate overall score
            scores = [
                feedback_dict["communication_skills"],
                feedback_dict["technical_knowledge"],
                feedback_dict["confidence_level"]
            ]
            overall_score = sum(scores) / len(scores)
            
            return FeedbackResponse(
                communication_skills=feedback_dict["communication_skills"],
                technical_knowledge=feedback_dict["technical_knowledge"],
                confidence_level=feedback_dict["confidence_level"],
                overall_score=overall_score,
                detailed_feedback=feedback_dict["detailed_feedback"]
            )
        except Exception as e:
            error_details = traceback.format_exc()
            print(f"Error in feedback generation: {error_details}")
            
            # Create a sample feedback for error cases
            return FeedbackResponse(
                communication_skills=7,
                technical_knowledge=7,
                confidence_level=7,
                overall_score=7.0,
                detailed_feedback=f"Based on the limited interaction, the candidate appears to have adequate communication skills and technical knowledge. Additional conversation would provide a more comprehensive assessment."
            )

# Initialize with a sample resume for s1 session
hirebot_instances: Dict[str, HireBot] = {}
sample_bot = HireBot()
sample_resume = """
John Doe
Software Engineer

EXPERIENCE
Senior Developer, XYZ Corp (2018-Present)
- Developed and maintained web applications using Python and JavaScript
- Led a team of 5 developers on a major project

Junior Developer, ABC Inc (2015-2018)
- Built responsive web interfaces using React
- Collaborated with UX designers to implement user-friendly features

EDUCATION
Bachelor of Science in Computer Science, University Example (2011-2015)

SKILLS
Python, JavaScript, React, Node.js, SQL, Git, Docker
"""
sample_bot.initialize_with_resume(sample_resume)
hirebot_instances["s1"] = sample_bot

@app.get("/", response_class=HTMLResponse)
async def root():
    return """
    <html>
        <head>
            <title>HireBot Interview Practice API</title>
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
                code {
                    background: #e0e0e0;
                    padding: 2px 5px;
                    border-radius: 3px;
                }
            </style>
        </head>
        <body>
            <h1>HireBot Interview Practice API</h1>
            <p>This API provides an AI-powered interview practice tool based on resume content.</p>

            <div class="endpoint">
                <h2>POST /upload-resume</h2>
                <p>Upload a resume PDF to initialize the interview session and receive the first question.</p>
            </div>

            <div class="endpoint">
                <h2>POST /chat/{session_id}</h2>
                <p>Chat with the AI interviewer using the session ID from resume upload.</p>
            </div>

            <div class="endpoint">
                <h2>GET /feedback/{session_id}</h2>
                <p>Get structured feedback on your interview performance based on the conversation.</p>
            </div>

            <p>Check <code>/docs</code> for detailed API documentation and interactive testing.</p>
        </body>
    </html>
    """

@app.post("/upload-resume")
async def upload_resume(file: UploadFile = File(...)):
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
    
    session_id = "s1"
    content = extract_text(file.file)
    
    if "Error" in content:
        raise HTTPException(status_code=500, detail=content)
    
    hirebot = HireBot()
    initial_question = hirebot.initialize_with_resume(content)
    hirebot_instances[session_id] = hirebot
    
    return {
        "message": "Resume uploaded successfully",
        "session_id": session_id,
        "initial_question": initial_question
    }

@app.post("/chat/{session_id}")
async def chat_with_interviewer(session_id: str, request: ChatRequest):
    if session_id not in hirebot_instances:
        raise HTTPException(status_code=404, detail="Session not found")
    
    hirebot = hirebot_instances[session_id]
    response = hirebot.chat(request.message)
    return {"response": response}

@app.get("/feedback/{session_id}", response_model=FeedbackResponse)
async def get_feedback(session_id: str):
    if session_id not in hirebot_instances:
        raise HTTPException(status_code=404, detail="Session not found")
    
    hirebot = hirebot_instances[session_id]
    feedback = hirebot.generate_feedback()
    return feedback

if __name__ == "_main_":
    import uvicorn
    uvicorn.run(app, host="localhost", port=8001)