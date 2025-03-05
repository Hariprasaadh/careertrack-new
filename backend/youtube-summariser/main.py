from fastapi import FastAPI, HTTPException
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
from youtube_transcript_api import YouTubeTranscriptApi
from langchain_groq import ChatGroq
from langchain_core.prompts import PromptTemplate
import os
from dotenv import load_dotenv
import uvicorn
import json
import googleapiclient.discovery
from typing import List

load_dotenv()

app = FastAPI(title="YouTube Video Summary API")

summary_prompt = PromptTemplate.from_template(
    """
    INPUT:
    # Transcript: {transcript}

    ### YouTube Video Summariser
    - Extract technical keywords from the transcript
    - Don't include words "Speaker" or "Transcript"
    - Summarise technical content
    - Provide a comprehensive summary in 7 points.
    - Proper key takeaways from the video
    - Next steps for the viewer to learn more about the topic
    - Include only important keywords and it should be maximum 7

    OUTPUT STRUCTURE:
    {{
        "topic": "",
        "keywords": [],
        "summary": [],
        "key_takeaways": [],
        "next_steps": []
    }}
    """
)

class VideoRecommendation(BaseModel):
    video_id: str
    title: str
    channel_title: str
    thumbnail_url: str

class CompleteSummaryResponse(BaseModel):
    topic: str
    keywords: list[str]
    summary: list[str]
    key_takeaways: list[str]
    next_steps: list[str]
    recommendations: List[VideoRecommendation]

def extract_transcript(video_url: str) -> tuple:
    try:
        video_id = video_url.split("v=")[1].split("&")[0]
        transcript_text = YouTubeTranscriptApi.get_transcript(video_id)
        transcript = " ".join(item["text"] for item in transcript_text)
        return transcript, video_id
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error extracting transcript: {str(e)}")

def generate_summary(transcript: str) -> dict:
    try:
        llm = ChatGroq(
            model_name="llama-3.3-70b-versatile",
            temperature=0.5,
            api_key=os.getenv('GROQ_API_KEY')
        )

        model = summary_prompt | llm

        response = model.invoke(input={'transcript': transcript})
        
        try:
            summary_dict = json.loads(response.content)
        except json.JSONDecodeError:
            try:
                summary_dict = eval(response.content)
            except:
                text = response.content
                start = text.find('{')
                end = text.rfind('}') + 1
                if start >= 0 and end > start:
                    json_str = text[start:end]
                    try:
                        summary_dict = json.loads(json_str)
                    except:
                        raise HTTPException(status_code=500, 
                                           detail=f"Failed to parse LLM response as JSON or dictionary")
                else:
                    raise HTTPException(status_code=500, 
                                       detail=f"Could not find JSON structure in LLM response")

        return summary_dict
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating summary: {str(e)}")

def get_recommended_videos(video_id: str, topic: str, keywords: list) -> list:
    try:
        youtube = googleapiclient.discovery.build(
            "youtube", "v3", developerKey="AIzaSyCALzXGKgarh3hzk9siwNc2CilFgVjZvKk" #os.getenv("YOUTUBE_API_KEY")
        )
        
        search_query = f"{topic} {' '.join(keywords[:3])}"
        recommended_videos = []
        
        search_response = youtube.search().list(
            q=search_query,
            type="video",
            part="id,snippet",
            maxResults=3,
            videoDuration="medium",
            relevanceLanguage="en"
        ).execute()
        
        for item in search_response.get("items", []):
            if item["id"]["kind"] == "youtube#video":
                rec_video_id = item["id"]["videoId"]
                snippet = item["snippet"]
                
                recommended_videos.append(
                    VideoRecommendation(
                        video_id=rec_video_id,
                        title=snippet["title"],
                        channel_title=snippet["channelTitle"],
                        thumbnail_url=snippet["thumbnails"]["high"]["url"]
                    )
                )
        
        return recommended_videos
    except Exception as e:
        print(f"Error getting recommendations: {str(e)}")
        return []

@app.get("/", response_class=HTMLResponse)
async def root():
    """Root endpoint that returns basic API information"""
    return """
    <html>
    <head>
        <title>YouTube Video Summarizer API</title>
        <style>
            body { 
                font-family: Arial, sans-serif; 
                max-width: 800px; 
                margin: 0 auto; 
                padding: 20px; 
                line-height: 1.6; 
                color: #333;
            }
            h1 { color: #1a73e8; }
            .endpoint { 
                background: #f5f5f5; 
                padding: 15px; 
                border-radius: 5px; 
                margin-bottom: 20px; 
                border-left: 4px solid #1a73e8;
            }
            code { 
                background: #e0e0e0; 
                padding: 2px 5px; 
                border-radius: 3px; 
            }
            .logo {
                font-size: 24px;
                font-weight: bold;
                margin-bottom: 20px;
            }
            .logo span {
                color: #1a73e8;
            }
        </style>
    </head>
    <body>
        <div class="logo">You<span>Tube</span> Summarizer API</div>
        <h1>Video Content Summarization API</h1>
        <p>This API extracts, summarizes, and analyzes YouTube video content, providing concise summaries and related video recommendations.</p>
        
        <div class="endpoint">
            <h2>POST /analyze</h2>
            <p>Generate a comprehensive summary of a YouTube video along with recommendations.</p>
            <h3>Request Parameters:</h3>
            <ul>
                <li><code>video_url</code>: The YouTube video URL to summarize</li>
            </ul>
            <h3>Response includes:</h3>
            <ul>
                <li>Topic identification</li>
                <li>Key technical keywords</li>
                <li>Detailed summary points</li>
                <li>Key takeaways</li>
                <li>Suggested next steps</li>
                <li>Related video recommendations</li>
            </ul>
        </div>
        
        <div class="endpoint">
            <h2>GET /health</h2>
            <p>Check if the API is operational.</p>
        </div>
        
        <p>Visit <code>/docs</code> for interactive API documentation and testing.</p>
    </body>
    </html>
    """

@app.post("/analyze")
async def analyze_video(video_url: str):
    # Step 1: Extract the transcript
    transcript, video_id = extract_transcript(video_url)
    
    # Step 2: Generate the summary
    summary = generate_summary(transcript)
    
    # Step 3: Get video recommendations
    recommended_videos = get_recommended_videos(
        video_id=video_id,
        topic=summary["topic"],
        keywords=summary["keywords"]
    )
    
    # Step 4: Combine everything into one response
    complete_response = {
        "topic": summary["topic"],
        "keywords": summary["keywords"],
        "summary": summary["summary"],
        "key_takeaways": summary["key_takeaways"],
        "next_steps": summary["next_steps"],
        "recommendations": recommended_videos
    }
    
    return CompleteSummaryResponse(**complete_response)

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run(app, host="localhost", port=8000)