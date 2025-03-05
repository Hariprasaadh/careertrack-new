from fastapi import FastAPI, HTTPException
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

class VideoSummary(BaseModel):
    topic: str
    keywords: list[str]
    summary: list[str]
    key_takeaways: list[str]
    next_steps: list[str]

class RecommendationResponse(BaseModel):
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
            api_key="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" #os.getenv('GROQ_API_KEY')
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
        
        search_response = youtube.search().list(
            q=search_query,
            type="video",
            part="id,snippet",
            maxResults=3,  
            videoDuration="medium",
            relevanceLanguage="en",
            relatedToVideoId=video_id
        ).execute()
        
        recommended_videos = []
        for item in search_response.get("items", []):
            if item["id"]["kind"] == "youtube#video":
                video_id = item["id"]["videoId"]
                snippet = item["snippet"]
                
                recommended_videos.append(
                    VideoRecommendation(
                        video_id=video_id,
                        title=snippet["title"],
                        channel_title=snippet["channelTitle"],
                        thumbnail_url=snippet["thumbnails"]["high"]["url"]
                    )
                )
        
        return recommended_videos
    except Exception as e:
        print(f"Error getting recommendations: {str(e)}")
        return [] 

@app.post("/summarize")
async def summarize_video(video_url: str):
    transcript, video_id = extract_transcript(video_url)
    
    summary = generate_summary(transcript)
    
 
    return VideoSummary(**summary)

@app.post("/recommendations")
async def get_recommendations(video_url: str):
    transcript, video_id = extract_transcript(video_url)
    
    summary = generate_summary(transcript)
    
    recommended_videos = get_recommended_videos(
        video_id=video_id,
        topic=summary["topic"],
        keywords=summary["keywords"]
    )
    
    return RecommendationResponse(recommendations=recommended_videos)



@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run(app, host="localhost", port=8000)