from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict
from dotenv import load_dotenv
from langchain_core.prompts import PromptTemplate
from langchain_groq import ChatGroq
from langchain_core.output_parsers import JsonOutputParser
import os

# Load environment variables
load_dotenv()

app = FastAPI()

# Initialize Groq LLM
GROQ_API_KEY = os.getenv('GROQ_API_KEY')
llm = ChatGroq(
    model_name="llama-3.3-70b-versatile",
    temperature=0.5,
    groq_api_key=GROQ_API_KEY
)

class QuizRequest(BaseModel):
    text_content: str
    num_questions: int = 5
    quiz_level: str = "Medium"

class QuizOption(BaseModel):
    a: str
    b: str
    c: str
    d: str

class QuizQuestion(BaseModel):
    mcq: str
    options: QuizOption
    correct: str

class QuizResponse(BaseModel):
    mcqs: List[QuizQuestion]

def fetch_questions(text_content: str, quiz_level: str, num_questions: int) -> Dict:
    RESPONSE_JSON_CONTENT = {
        "mcqs": [
            {
                "mcq": "multiple choice question1 (GATE 2024)",
                "options": {
                    "a": "choice here1",
                    "b": "choice here2",
                    "c": "choice here3",
                    "d": "choice here4",
                },
                "correct": "correct choice option in the form of a, b, c or d",
            }
        ]
    }

    RESPONSE_JSON_PYQ = {
        "mcqs": [
            {
                "mcq": "multiple choice question1 (GATE 2024)",
                "options": {
                    "a": "choice here1",
                    "b": "choice here2",
                    "c": "choice here3",
                    "d": "choice here4",
                },
                "correct": "correct choice option in the form of a, b, c or d",
            }
        ]
    }

    if len(text_content) > 100:
        RESPONSE_JSON = RESPONSE_JSON_CONTENT
        prompt_ques = PromptTemplate.from_template(
            """
            Text: {text_content}
            You are an expert in generating MCQ type quiz on the basis of provided content to help students excel in their studies. 
            Given the above text, create a quiz of {num_questions} multiple choice questions keeping difficulty level as {quiz_level}. 
            Make sure the questions are not repeated and check all the questions to be conforming the text as well.
            Make sure to format your response like RESPONSE_JSON below and use it as a guide.
            Return the JSON response only as double quotes not as single quotes.
            Here is the RESPONSE_JSON: 
            {RESPONSE_JSON}   
            """
        )
    else:
        RESPONSE_JSON = RESPONSE_JSON_PYQ
        prompt_ques = PromptTemplate.from_template(
            """
            You are an expert in helping students prepare for the GATE exam by providing high-quality previous year questions based on the topic provided in the {text_content} variable.
            Your task is to create a quiz consisting of {num_questions} unique multiple-choice questions derived from GATE previous year questions, ensuring the following:
                The difficulty level of the questions must match the {quiz_level} specified.
                Include the year of the GATE question in brackets at the end of each question (e.g., [GATE 2022]).
                Ensure all questions align closely with the topic mentioned in {text_content}.
                Verify that questions are not repeated and conform to the topic and difficulty level specified.

            Make sure to format your response like RESPONSE_JSON below and use it as a guide.
            Return the JSON response only as double quotes not as single quotes.
            Here is the RESPONSE_JSON: 
            {RESPONSE_JSON}

            Instructions:
            Provide only the JSON response, ensuring it uses double quotes for all keys and values.
            Do not include any additional explanations or preambles in your output.
            """
        )

    chain_ques = prompt_ques | llm
    response = chain_ques.invoke({
        "text_content": text_content,
        "quiz_level": quiz_level,
        "RESPONSE_JSON": RESPONSE_JSON,
        "num_questions": num_questions
    })

    json_parser = JsonOutputParser()
    json_res = json_parser.parse(response.content)
    return json_res

@app.post("/generate-quiz", response_model=QuizResponse)
async def generate_quiz(request: QuizRequest):
    try:
        quiz_data = fetch_questions(
            request.text_content,
            request.quiz_level,
            request.num_questions
        )
        return quiz_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="localhost", port=8000)