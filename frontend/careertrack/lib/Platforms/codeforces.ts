// File: src/lib/platforms/codeforces.ts
import axios from "axios";

interface CodeforcesSubmission {
verdict: string;
problem: {
    contestId: number;
    index: string;
};
}
export async function fetchCodeforcesStats(username: string) {
  try {
    // Codeforces has an official API
    const response = await axios.get(
      `https://codeforces.com/api/user.status?handle=${username}`
    );
    
    if (response.data.status !== "OK") {
      throw new Error(`Codeforces API error: ${response.data.comment}`);
    }
    
    // Count unique solved problems (verdict === "OK")
    const submissions = response.data.result;
    const solvedProblems = new Set();
    
    submissions.forEach((submission: CodeforcesSubmission) => {
      if (submission.verdict === "OK") {
        // Create a unique identifier for each problem
        const problemId = `${submission.problem.contestId}-${submission.problem.index}`;
        solvedProblems.add(problemId);
      }
    });
    
    return {
      solved: solvedProblems.size,
      username,
    };
  } catch (error) {
    console.error(`Error fetching Codeforces stats for ${username}:`, error);
    return { solved: 0, username };
  }
}