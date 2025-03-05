// File: src/app/page.tsx
"use client";
import { useState } from "react";
import { User } from "@/types/User";
import UserForm from "@/components/UserForm";
import StatsDisplay from "@/components/StatsDisplay";

export default function Interview() {
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserData = async (usernames: {
    leetcode: string;
    hackerrank: string;
    codechef: string;
    codeforces: string;
  }) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/user-stats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(usernames),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }
      
      const data = await response.json();
      setUserData(data);
    } catch (err) {
      setError('Error fetching user data. Please check your usernames and try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-center mb-2">Code Portfolio Tracker</h1>
        <p className="text-lg text-center text-slate-300 mb-12">
          Track your coding progress across multiple platforms
        </p>
        
        <div className="max-w-3xl mx-auto">
          <UserForm onSubmit={fetchUserData} />
          
          {loading && (
            <div className="flex justify-center my-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          )}
          
          {error && (
            <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-100 px-4 py-3 rounded my-6">
              {error}
            </div>
          )}
          
          {userData && !loading && <StatsDisplay userData={userData} />}
        </div>
      </div>
    </main>
  );
}