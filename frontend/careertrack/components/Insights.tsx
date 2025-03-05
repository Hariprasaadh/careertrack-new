"use client"
import React, { useEffect, useState } from 'react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

// Define strict types for the data structure
interface JobOpportunityData {
  domain: DomainType;
  "2024": number;
  "2025": number;
  "2026": number;
  "2027": number;
  "2028": number;
}

interface GrowthData {
  year: string;
  AIML: number;
  WebDev: number;
  AppDev: number;
  Blockchain: number;
  DataScience: number;
  Cybersecurity: number;
  CloudComputing: number;
  DevOps: number;
}

// Domains as a const array to ensure type safety
const DOMAINS = [
  'AIML',
  'WebDev',
  'AppDev',
  'Blockchain',
  'DataScience',
  'Cybersecurity',
  'CloudComputing',
  'DevOps',
] as const;

type DomainType = typeof DOMAINS[number];

// Colors for each domain
const DOMAIN_COLORS: Record<DomainType, string> = {
  'AIML': '#3B82F6',
  'WebDev': '#10B981',
  'AppDev': '#8B5CF6',
  'Blockchain': '#F43F5E',
  'DataScience': '#F59E0B',
  'Cybersecurity': '#EC4899',
  'CloudComputing': '#6366F1',
  'DevOps': '#14B8A6'
};

// Domain full names for better display
const DOMAIN_FULL_NAMES: Record<DomainType, string> = {
  'AIML': 'AI & Machine Learning',
  'WebDev': 'Web Development',
  'AppDev': 'App Development',
  'Blockchain': 'Blockchain',
  'DataScience': 'Data Science',
  'Cybersecurity': 'Cybersecurity',
  'CloudComputing': 'Cloud Computing',
  'DevOps': 'DevOps'
};

// Years array for typesafe iteration
const YEARS = ['2024', '2025', '2026', '2027', '2028'] as const;
type YearType = typeof YEARS[number];

export default function Insights() {
  // Typed state management
  const [jobData, setJobData] = useState<JobOpportunityData[]>([]);
  const [growthData, setGrowthData] = useState<GrowthData[]>([]);
  const [activeDomain, setActiveDomain] = useState<DomainType>('AIML');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'growth' | 'opportunities'>('growth');

  useEffect(() => {
    fetchData();
  }, []);

  // Calculate growth percentages from raw job data
  const calculateGrowthData = (jobData: JobOpportunityData[]): GrowthData[] => {
    const growthData: GrowthData[] = [];
    
    // Initialize with base year (2024) as 0% growth
    const baseYearData: GrowthData = {
      year: '2024',
      AIML: 0,
      WebDev: 0,
      AppDev: 0,
      Blockchain: 0,
      DataScience: 0,
      Cybersecurity: 0,
      CloudComputing: 0,
      DevOps: 0
    };
    growthData.push(baseYearData);
    
    // Calculate percentage growth for subsequent years
    for (let i = 1; i < YEARS.length; i++) {
      const currentYear = YEARS[i];
      const prevYear = YEARS[i-1];
      
      const yearData: GrowthData = {
        year: currentYear,
        AIML: 0,
        WebDev: 0,
        AppDev: 0,
        Blockchain: 0,
        DataScience: 0,
        Cybersecurity: 0,
        CloudComputing: 0,
        DevOps: 0
      };
      
      jobData.forEach(domain => {
        const prevValue = domain[prevYear];
        const currentValue = domain[currentYear];
        const growthPercentage = ((currentValue - prevValue) / prevValue) * 100;
        yearData[domain.domain] = parseFloat(growthPercentage.toFixed(2));
      });
      
      growthData.push(yearData);
    }
    
    return growthData;
  };

  const fetchData = async () => {
    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('Gemini API key is not defined');
      }

      // Generate more realistic data with proper typing
      const mockData: JobOpportunityData[] = DOMAINS.map(domain => {
        // Starting value between 100-400
        const baseValue = Math.floor(Math.random() * 300) + 100;
        
        // Generate values with a trend (increasing or decreasing)
        const trend = Math.random() > 0.3 ? 1 : -0.2; // Most domains have positive growth
        const volatility = Math.random() * 0.2 + 0.05; // 5-25% variation
        
        return {
          domain,
          "2024": baseValue,
          "2025": Math.max(50, Math.floor(baseValue * (1 + trend * 0.1 + (Math.random() * volatility - volatility/2)))),
          "2026": Math.max(50, Math.floor(baseValue * (1 + trend * 0.2 + (Math.random() * volatility - volatility/2)))),
          "2027": Math.max(50, Math.floor(baseValue * (1 + trend * 0.3 + (Math.random() * volatility - volatility/2)))),
          "2028": Math.max(50, Math.floor(baseValue * (1 + trend * 0.4 + (Math.random() * volatility - volatility/2))))
        };
      });

      setJobData(mockData);
      setGrowthData(calculateGrowthData(mockData));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
      setLoading(false);
    }
  };

  const renderDomainDetailCard = (domain: DomainType) => {
    const domainData = jobData.find(d => d.domain === domain);
    if (!domainData) return null;
    
    const totalGrowth = domainData["2024"] !== 0 ? 
      ((domainData["2028"] - domainData["2024"]) / domainData["2024"] * 100).toFixed(1) : 
      "0.0";
    
    const trend = domainData["2028"] > domainData["2024"] ? 'increasing' : 'decreasing';
    
    return (
      <div className="bg-white rounded-xl shadow-xl p-6 border-t-4" style={{ borderColor: DOMAIN_COLORS[domain] }}>
        <h3 className="text-2xl font-bold mb-3">{DOMAIN_FULL_NAMES[domain]}</h3>
        <p className="text-gray-600 mb-4">
          This domain shows a <span className={trend === 'increasing' ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
            {trend}
          </span> trend with <span className="font-semibold">{totalGrowth}%</span> total growth over 5 years.
        </p>
        
        <div className="mt-4 grid grid-cols-5 gap-2">
          {YEARS.map((year) => {
            const value = domainData[year];
            let growthData = 0;
            let growthPercentage = "0.0";
            
            if (year !== '2024') {
              const prevYear = `${parseInt(year)-1}` as YearType;
              const prevYearValue = domainData[prevYear];
              
              if (prevYearValue !== 0) {
                growthData = domainData[year] - prevYearValue;
                growthPercentage = ((growthData / prevYearValue) * 100).toFixed(1);
              }
            }
            
            return (
              <div key={year} className="flex flex-col items-center p-2 bg-gray-50 rounded-lg">
                <span className="text-gray-500 text-sm">{year}</span>
                <span className="font-bold text-gray-800">{value}</span>
                {year !== '2024' && (
                  <span className={parseFloat(growthPercentage) >= 0 ? "text-green-600 text-xs" : "text-red-600 text-xs"}>
                    {parseFloat(growthPercentage) >= 0 ? '↑' : '↓'} {growthPercentage}%
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const getDomainTrendData = (domain: DomainType) => {
    const domainData = jobData.find(d => d.domain === domain);
    if (!domainData) return [];
    
    return YEARS.map(year => ({
      year,
      value: domainData[year]
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading insights...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-red-50">
        <div className="text-center p-8 bg-white rounded-xl shadow-2xl max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-red-600 mb-2">Unable to Load Data</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <button 
            onClick={() => { setLoading(true); fetchData(); }}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Find fastest growing domains with type safety
  const getFastestGrowingDomains = () => {
    return [...jobData]
      .filter(domain => domain["2024"] !== 0) // Prevent division by zero
      .sort((a, b) => 
        ((b["2028"] - b["2024"]) / b["2024"]) - 
        ((a["2028"] - a["2024"]) / a["2024"])
      )
      .slice(0, 3);
  };

  // Find domains with highest demand in 2028
  const getHighestDemandDomains = () => {
    return [...jobData]
      .sort((a, b) => b["2028"] - a["2028"])
      .slice(0, 3);
  };

  // Find a domain with growth > 20% (if any exist)
  const getHighGrowthDomain = (): DomainType | null => {
    const highGrowthDomain = jobData.find(d => 
      d["2024"] !== 0 && (d["2028"] - d["2024"]) / d["2024"] > 0.2
    );
    return highGrowthDomain ? highGrowthDomain.domain : null;
  };

  // Find a domain with negative growth (if any exist)
  const getNegativeGrowthDomain = (): DomainType | null => {
    const negativeGrowthDomain = jobData.find(d => 
      (d["2028"] - d["2024"]) < 0
    );
    return negativeGrowthDomain ? negativeGrowthDomain.domain : null;
  };

  // Get insights for selected domain
  const getDomainInsights = (domain: DomainType) => {
    const domainData = jobData.find(d => d.domain === domain);
    if (!domainData) return [];
    
    // Find year with highest growth
    let highestGrowthYear = '2025';
    let highestGrowthValue = -Infinity;
    
    for (let i = 1; i < YEARS.length; i++) {
      const year = YEARS[i];
      const prevYear = YEARS[i-1];
      const growth = domainData[prevYear] !== 0 ? 
        (domainData[year] - domainData[prevYear]) / domainData[prevYear] * 100 : 0;
      
      if (growth > highestGrowthValue) {
        highestGrowthValue = growth;
        highestGrowthYear = year;
      }
    }
    
    return {
      highestGrowthYear,
      highestGrowthValue: highestGrowthValue.toFixed(1),
      totalJobs2028: domainData["2028"],
      isGrowing: domainData["2028"] > domainData["2024"]
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 tracking-tight mb-4">
              Tech Job Market Insights
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Explore future trends and growth projections across different technology domains from 2024 to 2028.
            </p>
          </div>
          {/* View Toggle */}
          <div className="flex justify-center mb-8">
            <div className="bg-white rounded-lg shadow-md p-1 inline-flex">
              <button 
                className={`px-4 py-2 rounded-md font-medium ${view === 'growth' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
                onClick={() => setView('growth')}
              >
                Growth Trends
              </button>
              <button 
                className={`px-4 py-2 rounded-md font-medium ${view === 'opportunities' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
                onClick={() => setView('opportunities')}
              >
                Job Opportunities
              </button>
            </div>
          </div>

          {/* Main Chart */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                {view === 'growth' ? 'Year-over-Year Percentage Growth' : 'Job Opportunities by Domain'}
              </h2>
              <div className="h-[500px]">
                <ResponsiveContainer width="100%" height="100%">
                  {view === 'growth' ? (
                    <LineChart
                      data={growthData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="year" 
                        padding={{ left: 30, right: 30 }}
                        stroke="#888888"
                      />
                      <YAxis 
                        label={{ 
                          value: 'Growth (%)', 
                          angle: -90, 
                          position: 'insideLeft',
                          offset: 0
                        }}
                        stroke="#888888"
                        domain={[-15, 'auto']}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#ffffff', 
                          borderRadius: '8px', 
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)', 
                          border: 'none' 
                        }}
                        formatter={(value: number) => [`${value}%`, 'Growth']}
                      />
                      <Legend verticalAlign="top" height={36} />
                      
                      {DOMAINS.map((domain) => (
                        <Line 
                          key={domain}
                          type="monotone" 
                          dataKey={domain} 
                          name={DOMAIN_FULL_NAMES[domain]}
                          stroke={DOMAIN_COLORS[domain]}
                          activeDot={{ r: 8 }}
                          strokeWidth={2}
                          dot={{ r: 4 }}
                        />
                      ))}
                    </LineChart>
                  ) : (
                    <BarChart
                      data={jobData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="domain" 
                        angle={-45} 
                        textAnchor="end"
                        interval={0}
                        stroke="#888888"
                        tickFormatter={(value) => DOMAIN_FULL_NAMES[value as DomainType]}
                      />
                      <YAxis 
                        label={{ 
                          value: 'Job Opportunities', 
                          angle: -90, 
                          position: 'insideLeft',
                          offset: 0
                        }}
                        stroke="#888888"
                      />
                      <Tooltip 
                        cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
                        contentStyle={{ 
                          backgroundColor: '#ffffff', 
                          borderRadius: '8px', 
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)', 
                          border: 'none' 
                        }}
                        formatter={(value: number, name: string) => [value, name]}
                        labelFormatter={(label) => DOMAIN_FULL_NAMES[label as DomainType]}
                      />
                      <Legend verticalAlign="top" height={36} />
                      <Bar dataKey="2024" fill="#3B82F6" name="2024" />
                      <Bar dataKey="2025" fill="#10B981" name="2025" />
                      <Bar dataKey="2026" fill="#8B5CF6" name="2026" />
                      <Bar dataKey="2027" fill="#F43F5E" name="2027" />
                      <Bar dataKey="2028" fill="#F59E0B" name="2028" />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Domain Selection Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            {DOMAINS.map((domain) => {
              // Find the domain data safely
              const domainData = jobData.find(d => d.domain === domain);
              if (!domainData) return null;
              
              // Calculate growth percentage safely
              const growthPercentage = domainData["2024"] !== 0 ?
                ((domainData["2028"] - domainData["2024"]) / domainData["2024"] * 100).toFixed(1) :
                "0.0";
              
              return (
                <div 
                  key={domain} 
                  onClick={() => setActiveDomain(domain)}
                  className={`bg-white rounded-xl p-4 cursor-pointer transition-all transform hover:-translate-y-1 border-l-4 ${activeDomain === domain ? 'shadow-lg' : 'shadow'}`}
                  style={{ borderLeftColor: DOMAIN_COLORS[domain] }}
                >
                  <h3 className="text-lg font-semibold text-gray-800">
                    {DOMAIN_FULL_NAMES[domain]}
                  </h3>
                  <div className="mt-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>2028 Projection:</span>
                      <span className="font-medium">
                        {domainData["2028"]}
                      </span>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span>5 Year Growth:</span>
                      <span className={parseFloat(growthPercentage) >= 0 ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                        {growthPercentage}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detailed Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Detailed Domain Card */}
            <div className="lg:col-span-2">
              {renderDomainDetailCard(activeDomain)}
            </div>
            
            {/* Domain Trend Card */}
            <div className="bg-white rounded-xl shadow-xl p-6">
              <h3 className="text-xl font-bold mb-4">{DOMAIN_FULL_NAMES[activeDomain]} Growth Trend</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={getDomainTrendData(activeDomain)}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#ffffff', 
                        borderRadius: '8px', 
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)', 
                        border: 'none' 
                      }}
                      formatter={(value: number) => [value, 'Jobs']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke={DOMAIN_COLORS[activeDomain]} 
                      fill={`${DOMAIN_COLORS[activeDomain]}33`} 
                      name="Jobs"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              
              <div className="mt-6">
                <h4 className="text-lg font-semibold mb-2">Key Insights</h4>
                {(() => {
                  const insights = getDomainInsights(activeDomain);
                  return (
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-start">
                        <svg className="h-5 w-5 mr-2 text-blue-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {insights.isGrowing ? 
                          `${DOMAIN_FULL_NAMES[activeDomain]} is projected to grow consistently through 2028.` :
                          `${DOMAIN_FULL_NAMES[activeDomain]} shows some challenges in long-term growth.`
                        }
                      </li>
                      <li className="flex items-start">
                        <svg className="h-5 w-5 mr-2 text-blue-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {parseFloat(insights.highestGrowthValue) > 0 ? 
                          `Strongest growth appears in ${insights.highestGrowthYear} with ${insights.highestGrowthValue}% increase.` :
                          `Most challenging year appears to be ${insights.highestGrowthYear} with ${insights.highestGrowthValue}% change.`
                        }
                      </li>
                      <li className="flex items-start">
                        <svg className="h-5 w-5 mr-2 text-blue-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        By 2028, expect around {insights.totalJobs2028} job opportunities in this domain.
                      </li>
                    </ul>
                  );
                })()}
              </div>
            </div>
          </div>
          
          {/* Summary Section */}
          <div className="mt-12 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 shadow-inner">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Industry Overview</h2>
            <p className="text-gray-700 mb-6">
              Based on our projections, the technology job market is expected to see significant changes between 2024 and 2028. 
              {(() => {
                const highGrowthDomain = getHighGrowthDomain();
                const negativeGrowthDomain = getNegativeGrowthDomain();
                
                return (
                  <>
                    {highGrowthDomain && 
                      ` Some domains like ${DOMAIN_FULL_NAMES[highGrowthDomain]} show particularly strong growth potential.`
                    }
                    {negativeGrowthDomain && 
                      ` Meanwhile, domains like ${DOMAIN_FULL_NAMES[negativeGrowthDomain]} may face challenges.`
                    }
                  </>
                );
              })()}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white bg-opacity-70 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">Fastest Growing Domains</h3>
                <ol className="list-decimal list-inside">
                  {getFastestGrowingDomains().map((domain, index) => {
                    const growthPercentage = domain["2024"] !== 0 ?
                      ((domain["2028"] - domain["2024"]) / domain["2024"] * 100).toFixed(1) :
                      "0.0";
                    
                    return (
                      <li key={index} className="mb-1">
                        <span className="font-medium">{DOMAIN_FULL_NAMES[domain.domain]}</span>
                        <span className="text-green-600 ml-2">
                          (+{growthPercentage}%)
                        </span>
                      </li>
                    );
                  })}
                </ol>
              </div>
              
              <div className="bg-white bg-opacity-70 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">Highest Demand in 2028</h3>
                <ol className="list-decimal list-inside">
                  {getHighestDemandDomains().map((domain, index) => (
                    <li key={index} className="mb-1">
                      <span className="font-medium">{DOMAIN_FULL_NAMES[domain.domain]}</span>
                      <span className="text-gray-600 ml-2">
                        ({domain["2028"]} positions)
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}