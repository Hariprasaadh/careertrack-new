"use client"
import React, { useState, useEffect } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_CODE_RENDER_URL;

// Enhanced types for platform stats
interface BasePlatformStats {
  username: string;
}

interface LeetCodeStats extends BasePlatformStats {
  total_solved: number;
  easy_solved: number;
  medium_solved: number;
  hard_solved: number;
}

interface CodeforcesStats extends BasePlatformStats {
  solved_problems: number;
}

interface CodeChefStats extends BasePlatformStats {
  rating: string;
  highest_rating: string;
  contests_attended: string;
}

interface GeeksForGeeksStats extends BasePlatformStats {
  problems_solved: string;
}

type PlatformStats = 
  | LeetCodeStats 
  | CodeforcesStats 
  | CodeChefStats 
  | GeeksForGeeksStats;

interface Platform {
  id: keyof UsernameDictionary;
  name: string;
  icon: string;
  primaryColor: string;
  secondaryColor: string;
  placeholder: string;
}

type UsernameDictionary = {
  leetcode: string;
  codeforces: string;
  codechef: string;
  geeksforgeeks: string;
};

const CodingStatsDashboard: React.FC = () => {
  const [usernames, setUsernames] = useState<UsernameDictionary>({
    leetcode: '',
    codeforces: '',
    codechef: '',
    geeksforgeeks: ''
  });
  
  const [results, setResults] = useState<Record<string, PlatformStats | null>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<Record<string, string | null>>({});
  const [totalProblemsSolved, setTotalProblemsSolved] = useState(0);
  const [animatedCount, setAnimatedCount] = useState(0);

  const platforms: Platform[] = [
    { 
      id: 'leetcode', 
      name: 'LeetCode', 
      icon: '/icons/leetcode.svg', 
      primaryColor: '#f0932b', 
      secondaryColor: '#ffbe76',
      placeholder: 'Enter LeetCode username' 
    },
    { 
      id: 'codeforces', 
      name: 'Codeforces', 
      icon: '/icons/codeforces.svg', 
      primaryColor: '#6c5ce7', 
      secondaryColor: '#a29bfe',
      placeholder: 'Enter Codeforces handle' 
    },
    { 
      id: 'codechef', 
      name: 'CodeChef', 
      icon: '/icons/codechef.svg', 
      primaryColor: '#e17055', 
      secondaryColor: '#fab1a0',
      placeholder: 'Enter CodeChef username' 
    },
    { 
      id: 'geeksforgeeks', 
      name: 'GeeksForGeeks', 
      icon: '/icons/geeksforgeeks.svg', 
      primaryColor: '#2d3436', 
      secondaryColor: '#636e72',
      placeholder: 'Enter GeeksForGeeks username' 
    },
  ];

  // Calculate total problems solved across all platforms
  useEffect(() => {
    let total = 0;
    
    Object.entries(results).forEach(([platform, data]) => {
      if (!data) return;
      
      if (platform === 'leetcode' && 'total_solved' in data) {
        total += data.total_solved;
      } else if (platform === 'codeforces' && 'solved_problems' in data) {
        total += data.solved_problems;
      } else if (platform === 'codechef' && 'contests_attended' in data) {
        total += parseInt(data.contests_attended) || 0;
      } else if (platform === 'geeksforgeeks' && 'problems_solved' in data) {
        total += parseInt(data.problems_solved) || 0;
      }
    });
    
    setTotalProblemsSolved(total);
  }, [results]);

  // Animate the count
  useEffect(() => {
    if (totalProblemsSolved > 0) {
      setAnimatedCount(0);
      const duration = 2000; // 2 seconds
      const interval = 20; // update every 20ms
      const steps = duration / interval;
      const increment = totalProblemsSolved / steps;
    let current = 0;

    const animate = () => {
        current += increment;
        if (current > totalProblemsSolved) {
          setAnimatedCount(totalProblemsSolved);
          clearInterval(timer);
        } else {
          setAnimatedCount(Math.floor(current));
        }
      };

            const timer = setInterval(animate, interval);
            return () => clearInterval(timer);
    }
  }, [totalProblemsSolved]);

  const handleUsernameChange = (platformId: keyof UsernameDictionary, value: string) => {
    setUsernames(prev => ({
      ...prev,
      [platformId]: value
    }));
  };

  const fetchPlatformStats = async (platformId: keyof UsernameDictionary) => {
    const username = usernames[platformId];
    
    if (!username) {
      setError(prev => ({ 
        ...prev, 
        [platformId]: 'Please enter a username' 
      }));
      return;
    }

    setLoading(prev => ({ ...prev, [platformId]: true }));
    setError(prev => ({ ...prev, [platformId]: null }));

    try {
      const response = await fetch(`${API_BASE_URL}/${platformId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });

      if (!response.ok) {
        throw new Error(`Error fetching ${platformId} data: ${response.status}`);
      }

      const data = await response.json();
      setResults(prev => ({ ...prev, [platformId]: data }));
    } catch (err) {
      setError(prev => ({
        ...prev,
        [platformId]: err instanceof Error ? err.message : `Failed to fetch ${platformId} profile data`
      }));
      setResults(prev => ({ ...prev, [platformId]: null }));
    } finally {
      setLoading(prev => ({ ...prev, [platformId]: false }));
    }
  };

  // Type checking helper with improved type safety
  function isLeetCodeStats(data: PlatformStats): data is LeetCodeStats {
    return 'total_solved' in data && 'easy_solved' in data;
  }

  function isCodeforcesStats(data: PlatformStats): data is CodeforcesStats {
    return 'solved_problems' in data;
  }

  function isCodeChefStats(data: PlatformStats): data is CodeChefStats {
    return 'rating' in data && 'highest_rating' in data;
  }

  function isGeeksForGeeksStats(data: PlatformStats): data is GeeksForGeeksStats {
    return 'problems_solved' in data;
  }

  // Platform-specific card renderers
  const renderLeetCodeStats = (data: PlatformStats, platform: Platform) => {
    if (isLeetCodeStats(data)) {
      const chartData = [
        { name: 'Easy', value: data.easy_solved, color: '#00b894' },
        { name: 'Medium', value: data.medium_solved, color: '#fdcb6e' },
        { name: 'Hard', value: data.hard_solved, color: '#d63031' }
      ];

      return (
        <PlatformCard 
          title={platform.name} 
          username={data.username} 
          totalSolved={data.total_solved}
          platformColor={platform.primaryColor}
          chartData={chartData}
        />
      );
    }
    return null;
  };

  const renderCodeforcesStats = (data: PlatformStats, platform: Platform) => {
    if (isCodeforcesStats(data)) {
      return (
        <PlatformCard 
          title={platform.name} 
          username={data.username} 
          totalSolved={data.solved_problems}
          platformColor={platform.primaryColor}
        />
      );
    }
    return null;
  };

  const renderCodeChefStats = (data: PlatformStats, platform: Platform) => {
    if (isCodeChefStats(data)) {
      const contestsNumber = parseInt(data.contests_attended) || 0;
      
      return (
        <PlatformCard 
          title={platform.name} 
          username={data.username} 
          totalSolved={contestsNumber}
          platformColor={platform.primaryColor}
          subtitle={`Rating: ${data.rating}`}
          additionalInfo={`Highest Rating: ${data.highest_rating}`}
        />
      );
    }
    return null;
  };

  const renderGeeksForGeeksStats = (data: PlatformStats, platform: Platform) => {
    if (isGeeksForGeeksStats(data)) {
      const problemsSolved = parseInt(data.problems_solved) || 0;
      
      return (
        <PlatformCard 
          title={platform.name} 
          username={data.username} 
          totalSolved={problemsSolved}
          platformColor={platform.primaryColor}
        />
      );
    }
    return null;
  };

  const renderPlatformStats = (platformId: string) => {
    const result = results[platformId];
    const isLoading = loading[platformId];
    const platformError = error[platformId];
    const platform = platforms.find(p => p.id === platformId as keyof UsernameDictionary) || platforms[0];

    if (isLoading) {
      return <LoadingCard platformName={platform.name} platformColor={platform.primaryColor} />;
    }

    if (platformError) {
      return <ErrorCard 
        platformName={platform.name} 
        error={platformError} 
        platformColor={platform.primaryColor} 
        onRetry={() => fetchPlatformStats(platform.id)}
      />;
    }

    if (!result) {
      return null;
    }

    switch (platformId) {
      case 'leetcode':
        return renderLeetCodeStats(result, platform);
      case 'codeforces':
        return renderCodeforcesStats(result, platform);
      case 'codechef':
        return renderCodeChefStats(result, platform);
      case 'geeksforgeeks':
        return renderGeeksForGeeksStats(result, platform);
      default:
        return null;
    }
  };

  const renderPlatformInput = (platform: Platform) => {
    const platformId = platform.id;
    const isLoading = loading[platformId];
    const hasError = !!error[platformId];
    
    return (
      <div className="bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1 w-full">
        <div 
          className="p-4 text-white flex justify-between items-center" 
          style={{ backgroundColor: platform.primaryColor }}
        >
          <h3 className="text-lg font-bold">{platform.name}</h3>
        </div>
        
        <div className="p-5">
          <div className="flex flex-col space-y-3">
            <div className="relative">
              <input
                type="text"
                value={usernames[platformId]}
                onChange={(e) => handleUsernameChange(platformId, e.target.value)}
                placeholder={platform.placeholder}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                  hasError 
                    ? 'border-red-300 focus:ring-red-200' 
                    : 'border-gray-300 focus:ring-blue-200 focus:border-blue-400'
                }`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') fetchPlatformStats(platformId);
                }}
              />
            </div>
            
            <button
              onClick={() => fetchPlatformStats(platformId)}
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-lg text-white font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2"
              style={{ 
                backgroundColor: isLoading ? '#9CA3AF' : platform.primaryColor,
              }}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading...
                </span>
              ) : 'Fetch Stats'}
            </button>
          </div>
          
          {error[platformId] && (
            <div className="mt-3 text-sm text-red-600 bg-red-50 p-2 rounded-md">
              <span className="font-medium">Error:</span> {error[platformId]}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Function to compute platform-specific data contributions for graph
  const getContributionData = () => {
    const data: {platform: string, problems: number, color: string}[] = [];
    
    if (results.leetcode && isLeetCodeStats(results.leetcode)) {
      data.push({
        platform: 'LeetCode',
        problems: results.leetcode.total_solved,
        color: '#f0932b'
      });
    }
    
    if (results.codeforces && isCodeforcesStats(results.codeforces)) {
      data.push({
        platform: 'Codeforces',
        problems: results.codeforces.solved_problems,
        color: '#6c5ce7'
      });
    }
    
    if (results.codechef && isCodeChefStats(results.codechef)) {
      data.push({
        platform: 'CodeChef',
        problems: parseInt(results.codechef.contests_attended) || 0,
        color: '#e17055'
      });
    }
    
    if (results.geeksforgeeks && isGeeksForGeeksStats(results.geeksforgeeks)) {
      data.push({
        platform: 'GeeksForGeeks',
        problems: parseInt(results.geeksforgeeks.problems_solved) || 0,
        color: '#2d3436'
      });
    }
    
    return data;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-3">
            Coding Profile Dashboard
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Track your progress across multiple competitive programming platforms in one place
          </p>
        </div>

        {/* Total Problem Count Animation */}
        {totalProblemsSolved > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-12 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-6">Overall Coding Progress</h2>
            
            <div className="text-center mb-8">
              <div className="relative inline-block">
                <div className="text-7xl font-bold text-indigo-600 mb-2">{animatedCount}</div>
                <div className="text-lg text-gray-500">Total Problems Solved</div>
                <div className="absolute -top-4 -right-4 bg-green-500 text-white text-sm px-2 py-1 rounded-full animate-pulse">
                  Active
                </div>
              </div>
            </div>
            
            <div className="mb-8">
              <AnimatedBarGraph data={getContributionData()} />
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {getContributionData().map((item, index) => (
                <div key={index} className="text-center p-3 rounded-lg bg-gray-50">
                  <div className="text-lg font-semibold" style={{color: item.color}}>
                    {item.platform}
                  </div>
                  <div className="text-xl font-bold">{item.problems}</div>
                  <div className="text-xs text-gray-500">Problems</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {platforms.map(platform => (
            <div key={platform.id} className="flex">
              {renderPlatformInput(platform)}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {platforms.map(platform => (
            <div key={platform.id}>
              {renderPlatformStats(platform.id)}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

// Animated Bar Graph Component
interface AnimatedBarGraphProps {
  data: Array<{
    platform: string;
    problems: number;
    color: string;
  }>;
}

const AnimatedBarGraph: React.FC<AnimatedBarGraphProps> = ({ data }) => {
  const [animated, setAnimated] = useState(false);
  
  useEffect(() => {
    // Start animation after component mounts
    const timer = setTimeout(() => {
      setAnimated(true);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [data]);
  
  // Find the maximum value for scaling
  const maxValue = Math.max(...data.map(item => item.problems), 1);
  
  return (
    <div className="w-full h-64">
      <div className="flex h-full items-end justify-around">
        {data.map((item, index) => {
          const percentage = (item.problems / maxValue) * 100;
          return (
            <div key={index} className="flex flex-col items-center w-full max-w-xs px-2">
              <div className="w-full relative h-52 flex flex-col justify-end">
                <div 
                  className="w-full rounded-t-lg transition-all duration-1000 ease-out" 
                  style={{
                    backgroundColor: item.color,
                    height: animated ? `${percentage}%` : '0%'
                  }}
                >
                  <div className="absolute top-0 left-0 right-0 text-center -mt-8 font-bold">
                    {item.problems}
                  </div>
                </div>
              </div>
              <div className="text-sm font-medium mt-2 text-center">
                {item.platform}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Custom Donut chart component
interface ChartDataItem {
  name: string;
  value: number;
  color: string;
}

const DonutChart: React.FC<{
  data: ChartDataItem[];
  size?: number;
  thickness?: number;
}> = ({ data, size = 200, thickness = 40 }) => {
  const radius = size / 2;
  const innerRadius = radius - thickness;
  
  // Calculate total for percentages
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  // Calculate the segments
let currentAngle = 0;
const segments = data.map((item) => {
    const angle = (item.value / total) * 360;
    const startAngle = currentAngle;
    currentAngle += angle;
    const endAngle = currentAngle;
    
    const startAngleRad = (startAngle - 90) * (Math.PI / 180);
    const endAngleRad = (endAngle - 90) * (Math.PI / 180);
    
    const x1 = radius + innerRadius * Math.cos(startAngleRad);
    const y1 = radius + innerRadius * Math.sin(startAngleRad);
    const x2 = radius + radius * Math.cos(startAngleRad);
    const y2 = radius + radius * Math.sin(startAngleRad);
    const x3 = radius + radius * Math.cos(endAngleRad);
    const y3 = radius + radius * Math.sin(endAngleRad);
    const x4 = radius + innerRadius * Math.cos(endAngleRad);
    const y4 = radius + innerRadius * Math.sin(endAngleRad);
    
    // Determine if the arc is more than 180 degrees
    const largeArcFlag = angle > 180 ? 1 : 0;
    
    // Path for the segment
    const path = [
      `M ${x1} ${y1}`,
      `L ${x2} ${y2}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x3} ${y3}`,
      `L ${x4} ${y4}`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x1} ${y1}`,
      'Z'
    ].join(' ');
    
    return { path, color: item.color, name: item.name, value: item.value, percentage: (item.value / total) * 100 };
  });
  
  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {segments.map((segment, i) => (
          <path key={i} d={segment.path} fill={segment.color} />
        ))}
        <circle cx={radius} cy={radius} r={innerRadius - 2} fill="white" />
      </svg>
      <div className="flex flex-wrap justify-center mt-4 gap-4">
        {segments.map((segment, i) => (
          <div key={i} className="flex items-center">
            <div className="w-3 h-3 rounded-full mr-1" style={{ backgroundColor: segment.color }}></div>
            <span className="text-sm text-gray-700">
              {segment.name}: <span className="font-medium">{segment.value}</span> ({segment.percentage.toFixed(1)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Progress bar for non-chart visualizations
// For internal use only


// Enhanced components with proper TypeScript interfaces
interface PlatformCardProps { 
  title: string; 
  username: string; 
  totalSolved: number | string;
  platformColor: string;
  subtitle?: string;
  additionalInfo?: string;
  chartData?: Array<ChartDataItem>;
}

const PlatformCard: React.FC<PlatformCardProps> = ({ 
  title, 
  username, 
  totalSolved, 
  platformColor,
  subtitle,
  additionalInfo,
  chartData 
}) => {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden h-full transform transition-all duration-300 hover:shadow-xl">
      <div 
        className="p-5 text-white" 
        style={{ backgroundColor: platformColor }}
      >
        <h3 className="text-xl font-bold mb-1">{title}</h3>
        <p className="text-sm opacity-90">@{username}</p>
      </div>
      
      <div className="p-6">
        <div className="text-center mb-6">
          <span className="text-4xl font-bold">{totalSolved}</span>
          <p className="text-gray-500 mt-1">Problems Solved</p>
          {subtitle && <p className="text-gray-700 font-medium mt-3">{subtitle}</p>}
          {additionalInfo && <p className="text-gray-600 text-sm mt-1">{additionalInfo}</p>}
        </div>
        
        {chartData && chartData.length > 0 && (
          <div className="flex justify-center py-2">
            <DonutChart data={chartData} size={200} thickness={40} />
          </div>
        )}
      </div>
    </div>
  );
};

interface LoadingCardProps {
  platformName: string;
  platformColor: string;
}

const LoadingCard: React.FC<LoadingCardProps> = ({ platformName, platformColor }) => (
  <div className="bg-white rounded-lg shadow-lg overflow-hidden h-full">
    <div className="p-5" style={{ backgroundColor: platformColor }}>
      <h3 className="text-xl font-bold text-white">{platformName}</h3>
    </div>
    <div className="p-6">
      <div className="animate-pulse flex flex-col items-center space-y-6">
        <div className="h-6 bg-gray-200 rounded w-1/2"></div>
        <div className="h-14 bg-gray-200 rounded-full w-14"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        <div className="h-36 bg-gray-200 rounded-full w-36"></div>
        <div className="flex space-x-3 w-full justify-center">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        </div>
      </div>
    </div>
  </div>
);

interface ErrorCardProps {
  platformName: string;
  error: string;
  platformColor: string;
  onRetry: () => void;
}

const ErrorCard: React.FC<ErrorCardProps> = ({ platformName, error, platformColor, onRetry }) => (
  <div className="bg-white rounded-lg shadow-lg overflow-hidden h-full">
    <div className="p-5" style={{ backgroundColor: platformColor }}>
      <h3 className="text-xl font-bold text-white">{platformName}</h3>
    </div>
    <div className="p-6 text-center">
      <div className="text-red-500 text-lg mb-3">Error loading data</div>
      <div className="bg-red-50 p-4 rounded-lg">
        <p className="text-red-700">{error}</p>
      </div>
      <button 
        onClick={onRetry}
        className="mt-4 px-4 py-2 bg-gray-100 rounded-md text-gray-700 hover:bg-gray-200 transition-colors"
      >
        Try Again
      </button>
    </div>
  </div>
);

export default CodingStatsDashboard;