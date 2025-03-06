from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse  
from pydantic import BaseModel
import requests
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.common.by import By
import time
import uvicorn
import os
import uvicorn

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"],  
)

class UsernameRequest(BaseModel):
    username: str

# Root Endpoint
@app.get("/", response_class=HTMLResponse)
async def root():
    """Root endpoint that returns basic API information"""
    return """
    <html>
        <head>
            <title>Coding Profile Stats API</title>
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
            <h1>Coding Profile Stats API</h1>
            <p>This API fetches coding profile statistics from various platforms.</p>

            <div class="endpoint">
                <h2>POST /leetcode</h2>
                <p>Get LeetCode profile stats including solved problems, ranking, and reputation.</p>
                <p><strong>Request Body:</strong> <code>{"username": "your_leetcode_username"}</code></p>
            </div>

            <div class="endpoint">
                <h2>POST /codeforces</h2>
                <p>Get the number of unique problems solved on Codeforces.</p>
                <p><strong>Request Body:</strong> <code>{"username": "your_codeforces_handle"}</code></p>
            </div>

            <div class="endpoint">
                <h2>POST /codechef</h2>
                <p>Get CodeChef profile stats including rating, highest rating, and contests attended.</p>
                <p><strong>Request Body:</strong> <code>{"username": "your_codechef_username"}</code></p>
            </div>

            <div class="endpoint">
                <h2>POST /codingninjas</h2>
                <p>Get the number of questions solved from a fixed Coding Ninjas profile (UI accepts username).</p>
                <p><strong>Request Body:</strong> <code>{"username": "any_username"}</code></p>
            </div>

            <div class="endpoint">
                <h2>POST /geeksforgeeks</h2>
                <p>Get the number of problems solved from a GeeksforGeeks user profile.</p>
                <p><strong>Request Body:</strong> <code>{"username": "your_geeksforgeeks_username"}</code></p>
            </div>

            <p>Check <code>/docs</code> for detailed API documentation and interactive testing.</p>
        </body>
    </html>
    """

@app.post("/leetcode")
async def get_leetcode_stats(request: UsernameRequest):
    username = request.username
    url = "https://leetcode.com/graphql"
    query = """
    {
        matchedUser(username: "%s") {
            username
            submitStatsGlobal {
                acSubmissionNum {
                    difficulty
                    count
                }
            }
            profile {
                ranking
                reputation
            }
        }
    }
    """ % username

    response = requests.post(url, json={"query": query})
    data = response.json()

    if "data" in data and data["data"]["matchedUser"]:
        user_data = data["data"]["matchedUser"]
        stats = user_data["submitStatsGlobal"]["acSubmissionNum"]

        result = {
            "username": user_data["username"],
            "ranking": user_data["profile"]["ranking"],
            "reputation": user_data["profile"]["reputation"],
            "total_solved": stats[0]["count"],
            "easy_solved": stats[1]["count"],
            "medium_solved": stats[2]["count"],
            "hard_solved": stats[3]["count"]
        }
        return result
    else:
        raise HTTPException(status_code=404, detail="Failed to fetch LeetCode data")

@app.post("/codeforces")
async def get_codeforces_stats(request: UsernameRequest):
    handle = request.username
    url = f"https://codeforces.com/api/user.status?handle={handle}&from=1"
    response = requests.get(url)

    if response.status_code != 200:
        raise HTTPException(status_code=404, detail="Failed to fetch Codeforces data")

    data = response.json()
    solved_problems = set()

    for submission in data['result']:
        if submission['verdict'] == 'OK':
            problem_id = f"{submission['problem']['contestId']}-{submission['problem']['index']}"
            solved_problems.add(problem_id)

    result = {
        "username": handle,
        "solved_problems": len(solved_problems)
    }
    return result

@app.post("/codechef")
async def get_codechef_stats(request: UsernameRequest):
    username = request.username
    url = f"https://www.codechef.com/users/{username}"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }

    response = requests.get(url, headers=headers)
    if response.status_code != 200:
        raise HTTPException(status_code=404, detail=f"Failed to fetch CodeChef data. Status code: {response.status_code}")

    soup = BeautifulSoup(response.text, "html.parser")

    rating_tag = soup.find("div", class_="rating-number")
    highest_rating_tag = soup.find("small", string=lambda text: "Highest Rating" in text if text else False)
    rank_section = soup.find("ul", class_="rating-ranks")
    contest_section = soup.find("div", class_="contest-participated-count")

    rating = rating_tag.text.strip() if rating_tag else "N/A"
    highest_rating = highest_rating_tag.text.split()[-1].strip(")") if highest_rating_tag else "N/A"
    contests_attended = contest_section.find("b").text.strip() if contest_section and contest_section.find("b") else "N/A"

    result = {
        "username": username,
        "rating": rating,
        "highest_rating": highest_rating,
        "contests_attended": contests_attended
    }
    return result

@app.post("/codingninjas")
async def get_codingninjas_stats(request: UsernameRequest):
    hardcoded_url = "https://www.naukri.com/code360/profile/268238b8-bc4b-402f-bbed-8421ed253193"
    
    driver = webdriver.Chrome()  
    driver.get(hardcoded_url)

    time.sleep(5)

    try:
        solved_element = driver.find_element(By.CLASS_NAME, "left.zen-typo-heading-5")
        solved_count = solved_element.text
        result = {
            "username": request.username,  # Return the input username for UI consistency
            "questions_solved": solved_count
        }
    except Exception as e:
        driver.quit()
        raise HTTPException(status_code=500, detail=f"Could not fetch Coding Ninjas data. Error: {str(e)}")
    
    driver.quit()
    return result

@app.post("/geeksforgeeks")
async def get_geeksforgeeks_stats(request: UsernameRequest):
    username = request.username
    url = f"https://www.geeksforgeeks.org/user/{username}/"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }

    response = requests.get(url, headers=headers)
    if response.status_code != 200:
        raise HTTPException(status_code=404, detail=f"Failed to fetch GeeksforGeeks data. Status code: {response.status_code}")

    soup = BeautifulSoup(response.text, "html.parser")
    score_element = soup.find("div", class_="scoreCard_head_left--score__oSi_x")

    if score_element:
        problems_solved = score_element.text.strip()
    else:
        raise HTTPException(status_code=404, detail="Could not find problems solved data on GeeksforGeeks profile")

    result = {
        "username": username,
        "problems_solved": problems_solved
    }
    return result

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="localhost", port=port)