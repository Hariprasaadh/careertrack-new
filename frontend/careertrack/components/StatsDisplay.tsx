import React from 'react';
import { User } from '@/types/User';

interface StatsDisplayProps {
  userData: User;
}

const StatsDisplay: React.FC<StatsDisplayProps> = ({ userData }) => {
  const { leetcode, codeforces, codechef, hackerrank, totalSolved, highestRating } = userData;
  
  // Determine highest platform by solved problems
  const platforms = [
    { name: 'LeetCode', solved: leetcode.totalSolved },
    { name: 'Codeforces', solved: codeforces.totalSolved },
    { name: 'CodeChef', solved: codechef.totalSolved },
    { name: 'HackerRank', solved: hackerrank.totalSolved }
  ];
  
  const topPlatform = platforms.reduce((max, platform) => 
    platform.solved > max.solved ? platform : max, platforms[0]);

  return (
    <div className="mt-8">
      <div className="bg-slate-800 rounded-lg p-6 shadow-lg mb-6">
        <h2 className="text-xl font-semibold mb-4">Overall Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-700 p-4 rounded-lg">
            <h3 className="text-sm uppercase text-slate-400 mb-1">Total Problems Solved</h3>
            <p className="text-3xl font-bold">{totalSolved}</p>
          </div>
          <div className="bg-slate-700 p-4 rounded-lg">
            <h3 className="text-sm uppercase text-slate-400 mb-1">Highest Rating</h3>
            <p className="text-3xl font-bold">{highestRating}</p>
          </div>
          <div className="bg-slate-700 p-4 rounded-lg">
            <h3 className="text-sm uppercase text-slate-400 mb-1">Top Platform</h3>
            <p className="text-3xl font-bold">{topPlatform.name}</p>
            <p className="text-sm text-slate-400">{topPlatform.solved} problems</p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* LeetCode Stats */}
        <div className="bg-slate-800 rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">LeetCode</h2>
            <span className="text-sm text-slate-400">{leetcode.username}</span>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-slate-700 p-3 rounded-lg">
              <h3 className="text-xs uppercase text-slate-400 mb-1">Problems Solved</h3>
              <p className="text-2xl font-bold">{leetcode.totalSolved}</p>
            </div>
            <div className="bg-slate-700 p-3 rounded-lg">
              <h3 className="text-xs uppercase text-slate-400 mb-1">Contest Rating</h3>
              <p className="text-2xl font-bold">{leetcode.rating}</p>
            </div>
          </div>
          
          <div className="bg-slate-700 p-3 rounded-lg">
            <h3 className="text-xs uppercase text-slate-400 mb-2">Difficulty Breakdown</h3>
            <div className="flex justify-between">
              <div className="text-center">
                <span className="text-green-500 font-medium">Easy</span>
                <p className="text-lg font-bold">{leetcode.easySolved}</p>
              </div>
              <div className="text-center">
                <span className="text-yellow-500 font-medium">Medium</span>
                <p className="text-lg font-bold">{leetcode.mediumSolved}</p>
              </div>
              <div className="text-center">
                <span className="text-red-500 font-medium">Hard</span>
                <p className="text-lg font-bold">{leetcode.hardSolved}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Codeforces Stats */}
        <div className="bg-slate-800 rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Codeforces</h2>
            <span className="text-sm text-slate-400">{codeforces.username}</span>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-700 p-3 rounded-lg">
              <h3 className="text-xs uppercase text-slate-400 mb-1">Problems Solved</h3>
              <p className="text-2xl font-bold">{codeforces.totalSolved}</p>
            </div>
            <div className="bg-slate-700 p-3 rounded-lg">
              <h3 className="text-xs uppercase text-slate-400 mb-1">Rating</h3>
              <p className="text-2xl font-bold">{codeforces.rating}</p>
            </div>
            <div className="bg-slate-700 p-3 rounded-lg">
              <h3 className="text-xs uppercase text-slate-400 mb-1">Rank</h3>
              <p className="text-2xl font-bold">{codeforces.rank || 'Unrated'}</p>
            </div>
            <div className="bg-slate-700 p-3 rounded-lg">
              <h3 className="text-xs uppercase text-slate-400 mb-1">Contests</h3>
              <p className="text-2xl font-bold">{codeforces.contests}</p>
            </div>
          </div>
        </div>
        
        {/* CodeChef Stats */}
        <div className="bg-slate-800 rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">CodeChef</h2>
            <span className="text-sm text-slate-400">{codechef.username}</span>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-700 p-3 rounded-lg">
              <h3 className="text-xs uppercase text-slate-400 mb-1">Problems Solved</h3>
              <p className="text-2xl font-bold">{codechef.totalSolved}</p>
            </div>
            <div className="bg-slate-700 p-3 rounded-lg">
              <h3 className="text-xs uppercase text-slate-400 mb-1">Rating</h3>
              <p className="text-2xl font-bold">{codechef.rating}</p>
            </div>
            <div className="bg-slate-700 p-3 rounded-lg">
              <h3 className="text-xs uppercase text-slate-400 mb-1">Rank</h3>
              <p className="text-2xl font-bold">{codechef.rank || 'Unrated'}</p>
            </div>
            <div className="bg-slate-700 p-3 rounded-lg">
              <h3 className="text-xs uppercase text-slate-400 mb-1">Contests</h3>
              <p className="text-2xl font-bold">{codechef.contests}</p>
            </div>
          </div>
        </div>
        
        {/* HackerRank Stats */}
        <div className="bg-slate-800 rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">HackerRank</h2>
            <span className="text-sm text-slate-400">{hackerrank.username}</span>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-700 p-3 rounded-lg">
              <h3 className="text-xs uppercase text-slate-400 mb-1">Problems Solved</h3>
              <p className="text-2xl font-bold">{hackerrank.totalSolved}</p>
            </div>
            <div className="bg-slate-700 p-3 rounded-lg">
              <h3 className="text-xs uppercase text-slate-400 mb-1">Rating</h3>
              <p className="text-2xl font-bold">{hackerrank.rating}</p>
            </div>
            <div className="bg-slate-700 p-3 rounded-lg col-span-2">
              <h3 className="text-xs uppercase text-slate-400 mb-1">Badges</h3>
              <p className="text-2xl font-bold">{hackerrank.badges}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsDisplay;