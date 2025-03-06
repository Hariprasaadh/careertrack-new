from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from langchain_groq import ChatGroq
from langchain.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.memory import ConversationBufferMemory
from langchain.chains import LLMChain
from langchain.schema import SystemMessage
import asyncio
import os
from dotenv import load_dotenv

from gitingest import ingest_async

load_dotenv()

app = FastAPI(title="GitHub Repository Chat API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

chatbot_instances = {}

class GitRepoChat:
    def __init__(self, groq_api_key):
        self.llm = ChatGroq(
            model_name="llama-3.3-70b-versatile",
            temperature=0.5,
            groq_api_key=groq_api_key
        )
        self.memory = ConversationBufferMemory(
            memory_key="chat_history",
            return_messages=True
        )
        self.repo_data = None
        self.chain = None

    async def ingest_repository(self, repo_url):
        """Ingest a GitHub repository asynchronously"""
        self.repo_data = await ingest_async(repo_url)
        self.chain = self.create_chain()
        return {"status": "success", "repo_url": repo_url}

    def create_chain(self):
        """Create the LLM chain with repository data"""
        if not self.repo_data:
            raise ValueError("No repository data available. Please ingest a repository first.")

        prompt = ChatPromptTemplate.from_messages([
            SystemMessage(content=f"""You are GitHubAssistant, a helpful AI that helps users understand GitHub repositories.
You have access to the following repository data:
{self.repo_data}

Answer questions about the repository structure, code, documentation, and purpose.
Be concise and short but informative. If you don't know something, say so.
"""),
            MessagesPlaceholder(variable_name="chat_history"),
            ("human", "{question}")
        ])

        return LLMChain(
            llm=self.llm,
            prompt=prompt,
            memory=self.memory,
        )

class IngestRequest(BaseModel):
    repo_url: str
    session_id: str

class ChatRequest(BaseModel):
    session_id: str
    question: str

@app.get("/", response_class=HTMLResponse)
async def root():
    """Root endpoint that returns basic API information"""
    return """
    <html>
        <head>
            <title>GitHub Repository Chat API</title>
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
            <h1>GitHub Repository Chat API</h1>
            <p>This API allows you to ingest GitHub repositories and chat about their contents.</p>

            <div class="endpoint">
                <h2>POST /ingest</h2>
                <p>Ingest a GitHub repository by providing its URL and a session ID.</p>
                <p>Example: <code>{"repo_url": "https://github.com/username/repo", "session_id": "session123"}</code></p>
            </div>

            <div class="endpoint">
                <h2>POST /chat</h2>
                <p>Ask questions about an ingested repository using its session ID.</p>
                <p>Example: <code>{"session_id": "session123", "question": "What does this repo do?"}</code></p>
            </div>

            <div class="endpoint">
                <h2>GET /health</h2>
                <p>Check the health status of the API.</p>
            </div>

            <p>Visit <code>/docs</code> for detailed API documentation and interactive testing.</p>
        </body>
    </html>
    """

@app.post("/ingest")
async def ingest_endpoint(request: IngestRequest):
    """Endpoint to ingest a GitHub repository"""
    try:
        groq_api_key = os.getenv("GROQ_API_KEY")
        if not groq_api_key:
            raise HTTPException(status_code=500, detail="GROQ_API_KEY not configured in environment")

        chatbot = GitRepoChat(groq_api_key)
        result = await chatbot.ingest_repository(request.repo_url)
        chatbot_instances[request.session_id] = chatbot
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error ingesting repository: {str(e)}")

@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    """Endpoint to chat about an ingested repository"""
    try:
        chatbot = chatbot_instances.get(request.session_id)
        if not chatbot:
            raise HTTPException(status_code=404, detail="Session not found. Please ingest a repository first.")

        if not chatbot.chain:
            raise HTTPException(status_code=400, detail="Repository not ingested yet.")

        response = await chatbot.chain.arun(question=request.question)  # Use arun for async compatibility
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing chat: {str(e)}")

@app.get("/health")
async def health_check():
    """Check the health status of the API"""
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="localhost", port=8001)