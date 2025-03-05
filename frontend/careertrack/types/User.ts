export interface User {
    leetcode: {
      username: string;
      totalSolved: number;
      easySolved: number;
      mediumSolved: number;
      hardSolved: number;
      rating: number;
      contests: number;
    };
    codeforces: {
      username: string;
      totalSolved: number;
      rating: number;
      rank: string;
      contests: number;
    };
    codechef: {
      username: string;
      totalSolved: number;
      rating: number;
      rank: string;
      contests: number;
    };
    hackerrank: {
      username: string;
      totalSolved: number;
      rating: number;
      badges: number;
    };
    totalSolved: number;
    highestRating: number;
  }