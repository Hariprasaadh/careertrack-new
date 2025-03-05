// File: src/lib/platforms/leetcode.ts
import axios from "axios";

// Interface for LeetCode submission data
interface LeetcodeSubmission {
count: number;
difficulty: string;
}

export async function fetchLeetCodeStats(username: string) {
  try {
    // LeetCode doesn't have a public API, so we use their GraphQL endpoint
    const response = await axios.post(
      "https://leetcode.com/graphql",
      {
        query: `
          query userProblemsSolved($username: String!) {
            matchedUser(username: $username) {
              username
              submitStats {
                acSubmissionNum {
                  difficulty
                  count
                }
              }
            }
          }
        `,
        variables: {
          username,
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const userData = response.data.data.matchedUser;
    
    if (!userData) {
      return { solved: 0, username };
    }

    // Extract problem counts by difficulty
    const acSubmissionNum = userData.submitStats.acSubmissionNum;
    
    // Calculate total problems solved (sum of all difficulties)
    const totalSolved = acSubmissionNum.reduce(
    (sum: number, item: LeetcodeSubmission) => sum + item.count,
      0
    );

    return {
      solved: totalSolved,
      username,
    };
  } catch (error) {
    console.error(`Error fetching LeetCode stats for ${username}:`, error);
    return { solved: 0, username };
  }
}