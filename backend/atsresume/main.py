from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain_core.prompts import PromptTemplate
from langchain_community.document_loaders import WebBaseLoader
import PyPDF2 as pdf
import os
import io
import uvicorn
import json

app = FastAPI(
    title="Smart ATS Resume Analyzer API",
    description="API for analyzing resumes against job descriptions",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"],  
)

load_dotenv()

GROQ_API_KEY1 = os.getenv("GROQ_API_KEY1")
if not GROQ_API_KEY1:
    raise ValueError("GROQ_API_KEY1 environment variable is not set")

GROQ_API_KEY2 = os.getenv("GROQ_API_KEY2")
if not GROQ_API_KEY2:
    raise ValueError("GROQ_API_KEY2 environment variable is not set")

GROQ_API_KEY3 = os.getenv("GROQ_API_KEY3")
if not GROQ_API_KEY3:
    raise ValueError("GROQ_API_KEY3 environment variable is not set")


def extract_text(file_content):
    """Extract text from PDF content"""
    try:
        pdf_file = io.BytesIO(file_content)
        reader = pdf.PdfReader(pdf_file)
        pages = len(reader.pages)
        text = ""
        for page_num in range(pages):
            page = reader.pages[page_num]
            text += str(page.extract_text())
        return text
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error extracting text from PDF: {str(e)}")


def scrape_website(job_link):
    """Scrape job details from the provided URL"""
    if not job_link:
        raise HTTPException(status_code=400, detail="Please provide a valid job link")

    llm_scrape = ChatGroq(
        model_name="llama-3.3-70b-versatile",
        temperature=0.5,
        groq_api_key=GROQ_API_KEY2
    )

    try:
        loader = WebBaseLoader(job_link)
        page_data = loader.load().pop().page_content

        prompt_job_content = PromptTemplate.from_template(
            """
               ### SCRAPED TEXT FROM WEBSITE:
               {page_data}
               ### INSTRUCTION:
               Extract the following from the scraped text:
               - Company Details (e.g., Name)
               - Job Title and Role
               - Job Description
               - Skills and Competencies
               - Qualifications and Experience
               and any other important data
            """
        )

        chain_extract = prompt_job_content | llm_scrape
        res = chain_extract.invoke(input={'page_data': page_data})
        return res.content
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error scraping job content: {str(e)}")


def generate_mail(resume_content, job_content):
    """Generate a job application email based on resume and job content"""
    if not resume_content or not job_content:
        raise HTTPException(status_code=400, detail="Resume or job content is missing")

    llm_mail = ChatGroq(
        model_name="llama-3.3-70b-versatile",
        temperature=0.5,
        groq_api_key=GROQ_API_KEY3
    )

    prompt_mail = PromptTemplate.from_template(
        """
            ### JOB CONTENT:
            {job_content}

            ### USER RESUME:
            {resume_content}

            ### INSTRUCTION:
            Create a personalized job application email using the above details. 
            Include:
            1. A formal greeting
            2. A brief introduction about the candidate
            3. Explanation of why the user is interested in the job
            4. Value proposition and how the user's skills align with the job
            5. Call to action (interview invitation)
            6. Polite closing with contact details

            Ensure the email maintains a professional and concise tone.
        """
    )

    mail_extract = prompt_mail | llm_mail
    final_mail = mail_extract.invoke(input={'job_content': job_content, 'resume_content': resume_content})
    return final_mail.content


class AnalysisRequest(BaseModel):
    job_link: str


class MailRequest(BaseModel):
    resume_content: str
    job_content: str


class AnalysisResponse(BaseModel):
    analysis: dict
    email_content: str


@app.get("/", response_class=HTMLResponse)
async def root():
    """Root endpoint that returns basic API information"""
    return """
    <html>
        <head>
            <title>Smart ATS Resume Analyzer API</title>
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
            <h1>Smart ATS Resume Analyzer API</h1>
            <p>This API provides resume analysis against job descriptions.</p>

            <div class="endpoint">
                <h2>POST /analyze</h2>
                <p>Upload a resume PDF and provide a job link to get analysis.</p>
            </div>

            <div class="endpoint">
                <h2>POST /generate-email</h2>
                <p>Generate a job application email based on resume and job content.</p>
            </div>

            <p>Check <code>/docs</code> for detailed API documentation.</p>
        </body>
    </html>
    """


@app.post("/analyze", response_model=AnalysisResponse)
async def analyze_resume(
        resume: UploadFile = File(...),
        job_link: str = Form(...)
):
    """
    Analyze a resume against a job description

    - **resume**: PDF file containing the resume
    - **job_link**: URL of the job posting

    Returns JSON content with analysis details
    """
    if resume.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    file_content = await resume.read()
    resume_content = extract_text(file_content)
    job_content = scrape_website(job_link)

    llm = ChatGroq(
        model_name="llama-3.3-70b-versatile",
        temperature=0.5,
        groq_api_key=GROQ_API_KEY1
    )
    prompt_extract = PromptTemplate.from_template(
        """Act as a highly skilled ATS (Application Tracking System) professional evaluating resumes.

Your task is to provide a comprehensive JSON analysis of the resume against the job description.

Resume Content: {resume_content}
Job Description: {job_content}

Please generate a JSON response with the following structure:
{{
    "match_percentage": 75,
    "match_reasons": {{
        "strengths": [
            "Strong Python programming skills",
            "Relevant project experience"
        ],
        "gaps": [
            "Limited cloud certification",
            "Minimal DevOps experience"
        ],
        "alignment": [
            "Educational background matches job requirements",
            "Technical skills overlap with job description"
        ]
    }},
    "missing_keywords": [
        "Kubernetes",
        "Docker",
        "CI/CD Pipeline"
    ],
    "improvement_suggestions": [
        "Add cloud certification (AWS/GCP)",
        "Include more DevOps project details",
        "Highlight containerization experience"
    ],
    "recommended_certifications": [
        {{
            "name": "AWS Certified Developer",
            "platform": "Coursera",
            "link": "https://www.coursera.org/aws-certification"
        }},
        {{
            "name": "Docker Certified Associate",
            "platform": "Linux Foundation",
            "link": "https://training.linuxfoundation.org/certification/docker-certified-associate/"
        }}
    ]
}}

Ensure the analysis is precise, data-driven, and provides actionable insights."""
    )

    try:
        chain = prompt_extract | llm
        res = chain.invoke(input={'resume_content': resume_content, 'job_content': job_content})

        try:
            analysis_data = json.loads(res.content)
        except json.JSONDecodeError:
            import re
            json_match = re.search(r'\{.*\}', res.content, re.DOTALL)
            if json_match:
                try:
                    analysis_data = json.loads(json_match.group(0))
                except:
                    raise HTTPException(status_code=500, detail="Failed to parse analysis response")
            else:
                raise HTTPException(status_code=500, detail="No valid JSON found in response")

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis generation error: {str(e)}")

    email_content = generate_mail(resume_content, job_content)

    return {
        "analysis": analysis_data,
        "email_content": email_content
    }

@app.post("/generate-email")
async def create_email(request: MailRequest):
    """
    Generate a job application email

    - **resume_content**: Text content of the resume
    - **job_content**: Text content of the job description

    Returns a generated job application email
    """
    email = generate_mail(request.resume_content, request.job_content)
    return {"email": email}


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok"}


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port)