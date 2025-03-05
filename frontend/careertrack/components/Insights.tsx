"use client"
import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Define strict types for the data structure
interface JobOpportunityData {
  domain: string;
  2024: number;
  2025: number;
  2026: number;
  2027: number;
  2028: number;
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

export default function Insights() {
  // Typed state management
  const [data, setData] = useState<JobOpportunityData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('Gemini API key is not defined');
      }

      // Mock data with proper typing
      const mockData: JobOpportunityData[] = DOMAINS.map(domain => ({
        domain,
        2024: Math.floor(Math.random() * 300) + 100,
        2025: Math.floor(Math.random() * 300) + 100,
        2026: Math.floor(Math.random() * 300) + 100,
        2027: Math.floor(Math.random() * 300) + 100,
        2028: Math.floor(Math.random() * 300) + 100,
      }));

      setData(mockData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="animate-pulse">
          <div className="h-16 w-16 bg-blue-500 rounded-full"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-red-50">
        <div className="text-center p-8 bg-white rounded-xl shadow-2xl">
          <h2 className="text-3xl font-bold text-red-600 mb-4">Oops! Something went wrong</h2>
          <p className="text-gray-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-8">
      <div className="container mx-auto">
        <h1 className="text-4xl font-extrabold text-center text-gray-800 mb-12 tracking-tight">
          Tech Job Opportunities Forecast
        </h1>
        
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="p-6">
            <ResponsiveContainer width="100%" height={500}>
              <BarChart
                data={data}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              >
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  vertical={false} 
                  stroke="#f0f0f0"
                />
                <XAxis 
                  dataKey="domain" 
                  angle={-45} 
                  textAnchor="end"
                  interval={0}
                  stroke="#888888"
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
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ 
                    backgroundColor: '#f8f9fa', 
                    borderRadius: '12px', 
                    border: 'none' 
                  }}
                />
                <Legend 
                  verticalAlign="top" 
                  height={36}
                />
                <Bar dataKey="2024" fill="#3B82F6" name="2024" />
                <Bar dataKey="2025" fill="#10B981" name="2025" />
                <Bar dataKey="2026" fill="#8B5CF6" name="2026" />
                <Bar dataKey="2027" fill="#F43F5E" name="2027" />
                <Bar dataKey="2028" fill="#F59E0B" name="2028" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {data.map((domainData) => (
            <div 
              key={domainData.domain} 
              className="bg-white rounded-xl shadow-lg p-4 hover:shadow-xl transition-all"
            >
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {domainData.domain}
              </h3>
              <div className="space-y-1">
                {Object.entries(domainData)
                  .filter(([key]) => key !== 'domain')
                  .map(([year, value]) => (
                    <div 
                      key={year} 
                      className="flex justify-between text-sm text-gray-600"
                    >
                      <span>{year}</span>
                      <span className="font-medium">{value}</span>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}