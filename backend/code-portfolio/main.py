import requests

username = "Hariprasaadh_K"

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

    username = user_data["username"]
    ranking = user_data["profile"]["ranking"]
    reputation = user_data["profile"]["reputation"]
    stats = user_data["submitStatsGlobal"]["acSubmissionNum"]

    total_solved = stats[0]["count"]
    easy_solved = stats[1]["count"]
    medium_solved = stats[2]["count"]
    hard_solved = stats[3]["count"]

    print(f"Username: {username}")
    print(f"Ranking: {ranking}")
    print(f"Reputation: {reputation}")
    print(f"Total Problems Solved: {total_solved}")
    print(f"Easy: {easy_solved}, Medium: {medium_solved}, Hard: {hard_solved}")
else:
    print("Failed to fetch data.")


# print("------")

# import requests

# def get_solved_problems(codeforces_handle):
#     url = f"https://codeforces.com/api/user.status?handle={codeforces_handle}&from=1"
#     response = requests.get(url)
    
#     if response.status_code != 200:
#         print("Failed to fetch data")
#         return
    
#     data = response.json()
    
#     solved_problems = set()
    
#     for submission in data['result']:
#         if submission['verdict'] == 'OK':
#             problem_id = f"{submission['problem']['contestId']}-{submission['problem']['index']}"
#             solved_problems.add(problem_id)
    
#     print(f"User: {codeforces_handle} has solved {len(solved_problems)} unique problems.")
#     return len(solved_problems)

# handle = "Hariprasaadh_K" 
# get_solved_problems(handle)

# import requests
# from bs4 import BeautifulSoup

# def get_codechef_stats(username):
#     url = f"https://www.codechef.com/users/{username}"
#     headers = {
#         "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
#     }

#     response = requests.get(url, headers=headers)
#     if response.status_code != 200:
#         print(f"Failed to fetch data for {username}. Status code: {response.status_code}")
#         return

#     soup = BeautifulSoup(response.text, "html.parser")

#     # Rating and Highest Rating
#     rating_tag = soup.find("div", class_="rating-number")
#     highest_rating_tag = soup.find("small", string=lambda text: "Highest Rating" in text if text else False)

#     rating = rating_tag.text.strip() if rating_tag else "N/A"
#     highest_rating = highest_rating_tag.text.split()[-1].strip(")") if highest_rating_tag else "N/A"

#     # Ranks
#     rank_section = soup.find("ul", class_="rating-ranks")
#     global_rank = rank_section.find_all("a")[0].text.strip() if rank_section and len(rank_section.find_all("a")) > 0 else "N/A"
#     country_rank = rank_section.find_all("a")[1].text.strip() if rank_section and len(rank_section.find_all("a")) > 1 else "N/A"

#     # Contests Attended
#     contests_attended = "N/A"
#     contest_section = soup.find("div", class_="contest-participated-count")
#     if contest_section:
#         contests_attended = contest_section.find("b").text.strip() if contest_section.find("b") else "N/A"
#     else:
#         for element in soup.select("div.rating-data-section li, div.rating-data-section span"):
#             if "contest" in element.text.lower():
#                 contests_attended = element.text.split(":")[-1].strip()
#                 break

#     # Fully Solved Problems (Enhanced Search)
#     fully_solved_count = "N/A"
#     # Step 1: Look for a section related to problems solved
#     solved_section = soup.find("section", class_="problems-solved")
#     if not solved_section:
#         # Fallback: Search entire page for "solved" keyword
#         solved_section = soup

#     # Step 2: Search for any element mentioning "solved"
#     found = False
#     for element in solved_section.find_all(["h5", "p", "span", "div"], recursive=True):
#         text = element.text.lower()
#         if "solved" in text:
#             print(f"Debug - Found potential solved element: {element.text}")  # Debugging output
#             # Extract number: look for digits after "solved"
#             parts = element.text.split()
#             for i, part in enumerate(parts):
#                 if "solved" in part.lower() and i + 1 < len(parts):
#                     if parts[i + 1].isdigit():
#                         fully_solved_count = parts[i + 1]
#                         found = True
#                         break
#             # Alternative: If number is in parentheses or after colon
#             if not found and ":" in element.text:
#                 fully_solved_count = element.text.split(":")[-1].strip("()")
#                 found = True
#             elif not found and "(" in element.text:
#                 fully_solved_count = element.text.split("(")[-1].strip(")")
#                 found = True
#             if found:
#                 break

#     # Output
#     print(f"CodeChef Stats for {username}:")
#     print(f"Rating: {rating}")
#     print(f"Highest Rating Achieved: {highest_rating}")
#     print(f"Contests Attended: {contests_attended}")

#     return {
#         "username": username,
#         "rating": rating,
#         "highest_rating": highest_rating,
#         "contests_attended": contests_attended,
#     }

# handle = "hariprasaadh_k"
# stats = get_codechef_stats(handle)