import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { User } from '@/types/User';

// Define interface for the request body
interface RequestBody {
  leetcode: string;
  hackerrank: string;
  codechef: string;
  codeforces: string;
}

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body: RequestBody = await request.json();
    
    // Validate usernames
    const { leetcode, hackerrank, codechef, codeforces } = body;
    
    // Fetch data from all platforms in parallel
    const [leetcodeData, codeforcesData, codechefData, hackerrankData] = await Promise.all([
        fetchLeetcodeStats(leetcode),
        fetchCodeforcesStats(codeforces),
        fetchCodechefStats(codechef),
        fetchHackerrankStats(hackerrank)
    ]);
    
    // Combine the data
    const userData: User = {
        leetcode: leetcodeData,
        codeforces: codeforcesData,
        codechef: codechefData,
        hackerrank: hackerrankData,
        totalSolved: leetcodeData.totalSolved + codeforcesData.totalSolved + codechefData.totalSolved + hackerrankData.totalSolved,
    highestRating: Math.max(
    leetcodeData.rating || 0,
    codeforcesData.rating || 0,
    codechefData.rating || 0,
    hackerrankData.rating || 0
    )
    };
    
    // Return the combined data
    return NextResponse.json(userData);
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user statistics' },
      { status: 500 }
    );
  }
}

// Function to fetch LeetCode stats
async function fetchLeetcodeStats(username: string) {
  if (!username) {
    return { username, totalSolved: 0, easySolved: 0, mediumSolved: 0, hardSolved: 0, rating: 0, contests: 0 };
  }
  
  try {
    // LeetCode GraphQL API
    const response = await axios.post('https://leetcode.com/graphql', {
      query: `
        query userProfile($username: String!) {
          matchedUser(username: $username) {
            username
            submitStats: submitStatsGlobal {
              acSubmissionNum {
                difficulty
                count
                submissions
              }
            }
            profile {
              ranking
              reputation
              starRating
            }
            userContestRanking {
              attendedContestsCount
              rating
            }
          }
        }
      `,
      variables: {
        username: username
      }
    });
    
    const data = response.data.data.matchedUser;
    
    if (!data) {
      throw new Error('LeetCode user not found');
    }
    
    const submitStats = data.submitStats.acSubmissionNum;
    
    interface SubmissionItem {
        difficulty: string;
        count: number;
        submissions: number;
    }
    
    const easy = submitStats.find((item: SubmissionItem) => item.difficulty === 'Easy')?.count || 0;
    const medium = submitStats.find((item: SubmissionItem) => item.difficulty === 'Medium')?.count || 0;
    const hard = submitStats.find((item: SubmissionItem) => item.difficulty === 'Hard')?.count || 0;
    
    return {
      username,
      totalSolved: easy + medium + hard,
      easySolved: easy,
      mediumSolved: medium,
      hardSolved: hard,
      rating: data.userContestRanking?.rating || 0,
      contests: data.userContestRanking?.attendedContestsCount || 0
    };
  } catch (error) {
    console.error(`Error fetching LeetCode data for ${username}:`, error);
    return { username, totalSolved: 0, easySolved: 0, mediumSolved: 0, hardSolved: 0, rating: 0, contests: 0 };
  }
}

// Function to fetch Codeforces stats
async function fetchCodeforcesStats(username: string) {
  if (!username) {
    return { username, totalSolved: 0, rating: 0, rank: '', contests: 0 };
  }
  
  try {
    // Fetch user info
    const userResponse = await axios.get(`https://codeforces.com/api/user.info?handles=${username}`);
    const userData = userResponse.data.result[0];
    
    // Fetch submission history
    const submissionResponse = await axios.get(`https://codeforces.com/api/user.status?handle=${username}`);
    const submissions = submissionResponse.data.result;
    
    // Count unique solved problems
    const solvedProblems = new Set();
    interface CodeforcesSubmission {
        verdict: string;
        problem: {
        contestId: number;
        index: string;
        };
    }
    
    submissions.forEach((submission: CodeforcesSubmission) => {
        if (submission.verdict === 'OK') {
        const problemKey = `${submission.problem.contestId}-${submission.problem.index}`;
        solvedProblems.add(problemKey);
        }
    });
    
    return {
      username,
      totalSolved: solvedProblems.size,
      rating: userData.rating || 0,
      rank: userData.rank || 'Unrated',
      contests: userData.maxRank ? 1 : 0 // Approximate, Codeforces doesn't directly provide contest count
    };
  } catch (error) {
    console.error(`Error fetching Codeforces data for ${username}:`, error);
    return { username, totalSolved: 0, rating: 0, rank: '', contests: 0 };
  }
}

// Function to fetch CodeChef stats
async function fetchCodechefStats(username: string) {
  if (!username) {
    return { username, totalSolved: 0, rating: 0, rank: '', contests: 0 };
  }
  
  try {
    // Note: CodeChef doesn't have a public API
    // This is a simplified version using web scraping approach
    // In a production app, you would need to implement web scraping
    
    // For now, returning placeholder data
    // You should implement actual scraping logic here
    
    return {
      username,
      totalSolved: 0, // Would be determined from scraping
      rating: 0,      // Would be determined from scraping
      rank: '',       // Would be determined from scraping
      contests: 0     // Would be determined from scraping
    };
  } catch (error) {
    console.error(`Error fetching CodeChef data for ${username}:`, error);
    return { username, totalSolved: 0, rating: 0, rank: '', contests: 0 };
  }
}

// Function to fetch HackerRank stats
async function fetchHackerrankStats(username: string) {
  if (!username) {
    return { username, totalSolved: 0, rating: 0, badges: 0 };
  }
  
  try {
    // Note: HackerRank doesn't have a public API for user profiles
    // This is a simplified version using web scraping approach
    // In a production app, you would need to implement web scraping
    
    // For now, returning placeholder data
    // You should implement actual scraping logic here
    
    return {
      username,
      totalSolved: 0, // Would be determined from scraping
      rating: 0,      // Would be determined from scraping
      badges: 0       // Would be determined from scraping
    };
  } catch (error) {
    console.error(`Error fetching HackerRank data for ${username}:`, error);
    return { username, totalSolved: 0, rating: 0, badges: 0 };
  }
}