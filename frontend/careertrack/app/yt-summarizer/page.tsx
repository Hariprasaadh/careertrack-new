// app/page.tsx

'use client';

import { useState } from 'react';
import { Inter } from 'next/font/google';
import * as React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

const inter = Inter({ subsets: ['latin'] });

// Types
interface VideoRecommendation {
  video_id: string;
  title: string;
  channel_title: string;
  thumbnail_url: string;
}

interface SummaryResponse {
  topic: string;
  keywords: string[];
  summary: string[];
  key_takeaways: string[];
  next_steps: string[];
  recommendations: VideoRecommendation[];
}

interface FormState {
  error?: string;
  loading?: boolean;
  data?: SummaryResponse;
}

// API function
async function analyzeVideo(videoUrl: string): Promise<SummaryResponse> {
  const API_URL = process.env.NEXT_PUBLIC_YT_RENDER_URL;
  const response = await fetch(`${API_URL}/analyze?video_url=${encodeURIComponent(videoUrl)}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Failed to analyze video');
  }

  return response.json();
}

// Main page component
export default function Home() {
  const [videoUrl, setVideoUrl] = useState('');
  const [formState, setFormState] = useState<FormState>({});
  const [toast, setToast] = useState<{visible: boolean, title: string, message: string, type: 'success' | 'error'} | null>(null);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!videoUrl || !videoUrl.includes('youtube.com/watch?v=')) {
      setToast({
        visible: true,
        title: 'Invalid URL',
        message: 'Please enter a valid YouTube video URL',
        type: 'error'
      });
      
      setTimeout(() => setToast(null), 3000);
      return;
    }

    setFormState({ loading: true });

    try {
      const data = await analyzeVideo(videoUrl);
      setFormState({ data });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to analyze video';
      setToast({
        visible: true,
        title: 'Error',
        message: errorMessage,
        type: 'error'
      });
      setFormState({ error: errorMessage });
      
      setTimeout(() => setToast(null), 3000);
    }
  };

  return (
    <div className={`${inter.className} min-h-screen bg-gradient-to-b from-blue-50 to-white`}>
     

      {/* Hero section */}
      <div className="text-blue-700 bg-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            YouTube Video <span className="text-blue-500">Summarizer</span>
          </h1>
          <p className="text-xl text-blue-400 max-w-2xl mx-auto mb-8">
            Extract key insights, summaries, and recommendations from any YouTube video
          </p>
          
          {/* Form */}
          <Card className="max-w-2xl mx-auto bg-white/10 backdrop-blur border-blue-500/20">
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input
                    type="text"
                    placeholder="Enter YouTube video URL (https://www.youtube.com/watch?v=...)"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    className="flex-1 bg-white/80 border-blue-300 placeholder-blue-500/60"
                    disabled={formState.loading}
                  />
                  <Button 
                    type="submit" 
                    disabled={formState.loading}
                    className="bg-blue-800 hover:bg-blue-900 text-white"
                  >
                    {formState.loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : 'Analyze Video'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main content */}
      <main className="container mx-auto py-12 px-4">
        {/* Loading indicator */}
        {formState.loading && (
          <div className="flex flex-col justify-center items-center p-12">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
            <p className="text-blue-600 font-medium">Analyzing your video...</p>
            <p className="text-blue-500/70 text-sm">This may take a minute or two depending on video length</p>
          </div>
        )}

        {/* Error message */}
        {formState.error && (
          <Alert variant="destructive" className="max-w-2xl mx-auto">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{formState.error}</AlertDescription>
          </Alert>
        )}

        {/* Results */}
        {formState.data && (
          <div className="w-full space-y-8 max-w-4xl mx-auto">
            {/* Summary Card */}
            <Card className="border-blue-200 shadow-md overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                <CardTitle className="text-2xl">{formState.data.topic}</CardTitle>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formState.data.keywords.map((keyword, index) => (
                    <Badge 
                      key={index} 
                      variant="secondary"
                      className="bg-blue-200 text-blue-800 hover:bg-blue-300"
                    >
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </CardHeader>
              
              <CardContent className="p-0">
                <Tabs defaultValue="summary" className="w-full">
                  <TabsList className="w-full justify-start rounded-none border-b bg-white p-0">
                    <TabsTrigger value="summary" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:bg-white data-[state=active]:shadow-none px-6 py-3">
                      Summary
                    </TabsTrigger>
                    <TabsTrigger value="takeaways" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:bg-white data-[state=active]:shadow-none px-6 py-3">
                      Key Takeaways
                    </TabsTrigger>
                    <TabsTrigger value="nextsteps" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:bg-white data-[state=active]:shadow-none px-6 py-3">
                      Next Steps
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="summary" className="p-6">
                    <ul className="space-y-3">
                      {formState.data.summary.map((point, index) => (
                        <li key={index} className="flex gap-2 items-start">
                          <div className="bg-blue-100 text-blue-600 rounded-full h-5 w-5 flex items-center justify-center text-xs mt-1 flex-shrink-0">
                            {index + 1}
                          </div>
                          <p>{point}</p>
                        </li>
                      ))}
                    </ul>
                  </TabsContent>
                  
                  <TabsContent value="takeaways" className="p-6">
                    <ul className="space-y-3">
                      {formState.data.key_takeaways.map((takeaway, index) => (
                        <li key={index} className="flex gap-2 items-start">
                          <div className="bg-blue-100 text-blue-600 rounded-full h-5 w-5 flex items-center justify-center text-xs mt-1 flex-shrink-0">
                            ✓
                          </div>
                          <p>{takeaway}</p>
                        </li>
                      ))}
                    </ul>
                  </TabsContent>
                  
                  <TabsContent value="nextsteps" className="p-6">
                    <ul className="space-y-3">
                      {formState.data.next_steps.map((step, index) => (
                        <li key={index} className="flex gap-2 items-start">
                          <div className="bg-blue-100 text-blue-600 rounded-full h-5 w-5 flex items-center justify-center text-xs mt-1 flex-shrink-0">
                            →
                          </div>
                          <p>{step}</p>
                        </li>
                      ))}
                    </ul>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
            
            {/* Recommendations */}
            <div>
              <h3 className="text-xl font-semibold mb-4 text-blue-800 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-5 w-5">
                  <path d="M21 15V6"></path>
                  <path d="M18.5 18a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"></path>
                  <path d="M12 12H3"></path>
                  <path d="M16 6H3"></path>
                  <path d="M12 18H3"></path>
                </svg>
                Recommended Videos
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {formState.data.recommendations.map((recommendation) => (
                  <Card 
                    key={recommendation.video_id} 
                    className="overflow-hidden border-blue-100 hover:border-blue-300 transition-colors h-full flex flex-col"
                  >
                    <div className="aspect-video relative overflow-hidden">
                      <img 
                        src={recommendation.thumbnail_url} 
                        alt={recommendation.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                    </div>
                    <CardContent className="p-4 flex-1 flex flex-col">
                      <h4 className="font-semibold line-clamp-2 mb-1 text-blue-900">{recommendation.title}</h4>
                      <p className="text-sm text-gray-500 mb-4">{recommendation.channel_title}</p>
                      <div className="mt-auto">
                        <Button 
                          variant="outline"
                          size="sm"
                          className="w-full border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                          asChild
                        >
                          <a 
                            href={`https://www.youtube.com/watch?v=${recommendation.video_id}`}
                            target="_blank" 
                            rel="noopener noreferrer"
                          >
                            Watch on YouTube
                          </a>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

   

      {/* Toast notification */}
      {toast && toast.visible && (
        <div className={`fixed bottom-4 right-4 max-w-xs rounded-lg shadow-lg pointer-events-auto ${
          toast.type === 'error' ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'
        }`}>
          <div className="p-4">
            <div className="flex items-start">
              <div className="flex-1">
                <p className={`text-sm font-medium ${
                  toast.type === 'error' ? 'text-red-800' : 'text-green-800'
                }`}>
                  {toast.title}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  {toast.message}
                </p>
              </div>
              <button
                onClick={() => setToast(null)}
                className="ml-4 text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <span className="sr-only">Close</span>
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}