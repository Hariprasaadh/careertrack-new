"use client";

import { useState, useEffect, ChangeEvent, FormEvent} from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Copy, Download, BookOpen, Rocket, TrendingUp, Upload } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

function LoadingOverlay() {
  const loadingTips = [
    "Pro tip: Tailored resumes get 3x more interviews 🎯",
    "Analyzing 25+ ATS optimization factors... 🔍",
    "Matching your skills against industry benchmarks 📊",
    "Optimizing keyword density for better ranking 📈",
    "Did you know? Action verbs boost impact by 40% 💪",
    "Hot tip: Recruiters scan resumes in 6 seconds! 🕒",
  ];
    
    const [tipIndex, setTipIndex] = useState(0);
    const totalDuration = 8000; 
    const updateInterval = 500; 
    
    useEffect(() => {
        // Set up an interval to rotate through the tips
        const intervalId = setInterval(() => {
        setTipIndex(prevIndex => (prevIndex + 1) % loadingTips.length);
        }, updateInterval);
        
        // Set a timeout to speed up or slow down the rotation as needed
        const timeoutId = setTimeout(() => {
        clearInterval(intervalId);
        }, totalDuration);
        
        // Clean up interval and timeout on component unmount
        return () => {
        clearInterval(intervalId);
        clearTimeout(timeoutId);
        };
    }, [loadingTips.length]);
    
    return (
    <div className="fixed inset-0 bg-white/90 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="text-center space-y-6 max-w-md w-full px-4">
        <div className="space-y-4">
          {/* Spinner */}
          <div className="flex justify-center mb-2">
            <motion.div
              className="w-16 h-16 border-4 border-gray-200 border-t-indigo-600 rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-800">
              AI Analysis in Progress
            </h3>
            <p className="text-sm text-gray-600">
              Crunching data from your resume and job description...
            </p>
          </div>
        </div>
        
        {/* Changing Tip */}
        <div className="animate-pulse-slow">
          <p className="text-sm text-purple-600 italic px-4">{loadingTips[tipIndex]}</p>
        </div>
        
        {/* Progress Footer */}
        <div className="mt-4 space-y-1">
          <p className="text-xs text-gray-500">🚀 Finalizing personalized insights</p>
          <p className="text-xs text-gray-400">Estimated completion: 8-12 seconds</p>
        </div>
        
      </div>
    </div>
  );
}
interface MatchReasons {
    strengths: string[];
    gaps: string[];
    alignment: string[];
}
interface RecommendedCertification {
    name: string;
    platform: string;
    link: string;
}

interface Analysis {
    match_percentage: number;
    match_reasons: MatchReasons;
    missing_keywords: string[];
    improvement_suggestions: string[];
    recommended_certifications: RecommendedCertification[];
}

interface AnalysisResult {
    analysis: Analysis;
    email_content: string;
}

export default function ResumeAnalyzerPage() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [jobLink, setJobLink] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_ATS_RENDER_URL;

  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      if (file.type !== 'application/pdf') {
        toast.error("Invalid File Type", {
          description: "Please upload a PDF resume"
        });
        return;
      }

      setPdfFile(file);
    }
  };

  const handleAnalyze = async (event: FormEvent) => {
    event.preventDefault();

    if (!pdfFile) {
      toast.error("Missing Resume", {
        description: "Please upload your resume PDF"
      });
      return;
    }

    if (!jobLink.trim()) {
      toast.error("Missing Job Link", {
        description: "Please enter a job description URL"
      });
      return;
    }

    try {
      new URL(jobLink);
    } catch {
      toast.error("Invalid URL", {
        description: "Please enter a valid job description link"
      });
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('resume', pdfFile);
      formData.append('job_link', jobLink);

      const response = await fetch(`${API_URL}/analyze`, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error analyzing resume');
      }

      const data: AnalysisResult = await response.json();
      console.log(data);
      setAnalysisResult(data);

      toast.success("Analysis Complete", {
        description: "Your resume has been successfully analyzed"
      });

    } catch (error) {
      toast.error("Analysis Failed", {
        description: error instanceof Error ? error.message : 'An unexpected error occurred'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyEmailToClipboard = () => {
    if (!analysisResult?.email_content) {
      toast.error("No Content", {
        description: "No email content available to copy"
      });
      return;
    }

    navigator.clipboard.writeText(analysisResult.email_content)
      .then(() => {
        toast.success("Copied", {
          description: "Email content copied to clipboard"
        });
      })
    .catch(() => {
        toast.error("Copy Failed", {
          description: "Unable to copy email content"
        });
      });
  };

  const downloadEmail = () => {
    if (!analysisResult?.email_content) {
      toast.error("No Content", {
        description: "No email content available to download"
      });
      return;
    }

    const blob = new Blob([analysisResult.email_content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');

    a.href = url;
    a.download = 'job_application_email.txt';
    document.body.appendChild(a);
    a.click();

    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);

    toast.success("Downloaded", {
      description: "Email content downloaded successfully"
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl bg-clip-text  bg-gradient-to-r from-indigo-600 to-purple-600">
            Resume ATS Optimizer
          </h1>
          <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
            Supercharge your job application with AI-powered resume analysis and personalized insights
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white shadow-2xl rounded-2xl overflow-hidden border border-gray-100">
          {/* Header */}
          <div className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-200">
            <div className="flex items-center space-x-4">
              <BookOpen className="w-10 h-10 text-indigo-600" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Smart Resume Analyzer</h2>
                <p className="text-gray-600">Optimize your resume for Applicant Tracking Systems</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            <form onSubmit={handleAnalyze} className="space-y-6">
              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Resume
                </label>
                <div className="flex items-center space-x-4">
                  <Input 
                    type="file" 
                    accept=".pdf"
                    onChange={handleFileUpload}
                    className="flex-grow file:mr-4 file:rounded-full file:border-0 file:bg-indigo-50 file:text-indigo-700 file:px-4 file:py-2 hover:file:bg-indigo-100"
                  />
                  <span className="text-sm text-gray-500 flex items-center">
                    {pdfFile ? (
                      <>
                        <Upload className="mr-2 h-4 w-4 text-green-600" />
                        {pdfFile.name}
                      </>
                    ) : (
                      'No PDF selected'
                    )}
                  </span>
                </div>
              </div>

              {/* Job Link */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Description URL
                </label>
                <Input 
                  type="text" 
                  placeholder="Paste job description link from LinkedIn, Indeed, or company website"
                  value={jobLink}
                  onChange={(e) => setJobLink(e.target.value)}
                  className="w-full focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              {/* Analyze Button */}
              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 text-white font-semibold py-3"
              >
                {isLoading ? 'Analyzing...' : 'Optimize My Resume'}
              </Button>
            </form>



            {/* Features Highlight */}
            <div className="mt-10 grid md:grid-cols-3 gap-6">
              <div className="bg-white border border-indigo-100 rounded-lg p-6 text-center shadow-md hover:shadow-xl transition-all duration-300">
                <TrendingUp className="mx-auto h-10 w-10 text-indigo-600 mb-4 animate-pulse" />
                <h3 className="font-bold text-lg text-gray-800 mb-2">ATS Optimization</h3>
                <p className="text-gray-600">Maximize resume compatibility with tracking systems</p>
              </div>
              <div className="bg-white border border-green-100 rounded-lg p-6 text-center shadow-md hover:shadow-xl transition-all duration-300">
                <Rocket className="mx-auto h-10 w-10 text-green-600 mb-4 animate-pulse" />
                <h3 className="font-bold text-lg text-gray-800 mb-2">Instant Insights</h3>
                <p className="text-gray-600">Get actionable recommendations in seconds</p>
              </div>
              <div className="bg-white border border-purple-100 rounded-lg p-6 text-center shadow-md hover:shadow-xl transition-all duration-300">
                <FileText className="mx-auto h-10 w-10 text-purple-600 mb-4 animate-pulse" />
                <h3 className="font-bold text-lg text-gray-800 mb-2">Comprehensive Report</h3>
                <p className="text-gray-600">Detailed analysis of resume strengths and gaps</p>
              </div>
            </div>

            {isLoading && <LoadingOverlay />}

            {/* Analysis Results */}
            {analysisResult && (
              <div className="mt-12">
                <Tabs defaultValue="analysis" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-gray-100 p-1 rounded-xl">
                    <TabsTrigger 
                      value="analysis" 
                      className="rounded-lg data-[state=active]:bg-indigo-600 data-[state=active]:text-white transition-colors"
                    >
                      Resume Analysis
                    </TabsTrigger>
                    <TabsTrigger 
                      value="email" 
                      className="rounded-lg data-[state=active]:bg-indigo-600 data-[state=active]:text-white transition-colors"
                    >
                      Application Email
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="analysis" className="mt-6">
                    <Card className="border-2 border-indigo-100 shadow-lg">
                      <CardContent className="p-6 bg-white space-y-4">
                        <div className="space-y-4">
                          <div className="bg-indigo-50 p-4 rounded-lg">
                            <h3 className="text-lg font-semibold text-indigo-800 mb-2">Match Percentage</h3>
                            <p className="text-2xl font-bold text-indigo-600">
                              {analysisResult.analysis.match_percentage}%
                            </p>
                          </div>

                          <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">Strengths</h3>
                            <ul className="list-disc list-inside text-gray-700 space-y-2">
                              {analysisResult.analysis.match_reasons.strengths.map((strength, index) => (
                                <li key={index}>{strength}</li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">Gaps</h3>
                            <ul className="list-disc list-inside text-gray-700 space-y-2">
                              {analysisResult.analysis.match_reasons.gaps.map((gap, index) => (
                                <li key={index}>{gap}</li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">Missing Keywords</h3>
                            <div className="flex flex-wrap gap-2">
                              {analysisResult.analysis.missing_keywords.map((keyword, index) => (
                                <span 
                                  key={index} 
                                  className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm"
                                >
                                  {keyword}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">Improvement Suggestions</h3>
                            <ul className="list-disc list-inside text-gray-700 space-y-2">
                              {analysisResult.analysis.improvement_suggestions.map((suggestion, index) => (
                                <li key={index}>{suggestion}</li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">Recommended Certifications</h3>
                            <div className="space-y-3">
                              {analysisResult.analysis.recommended_certifications.map((cert, index) => (
                                <div 
                                  key={index} 
                                  className="bg-green-50 p-3 rounded-lg flex justify-between items-center"
                                >
                                  <div>
                                    <h4 className="font-semibold text-green-800">{cert.name}</h4>
                                    <p className="text-sm text-green-600">{cert.platform}</p>
                                  </div>
                                  <a 
                                    href={cert.link} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-indigo-600 hover:underline"
                                  >
                                    Learn More
                                  </a>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  <TabsContent value="email" className="mt-6">
                    <Card className="border-2 border-indigo-100 shadow-lg">
                      <CardContent className="relative p-6 bg-white">
                        <pre className="bg-gray-50 p-4 rounded-md overflow-x-auto whitespace-pre-wrap break-words text-sm leading-relaxed border border-gray-200">
                          {analysisResult.email_content}
                        </pre>
                        <div className="flex justify-end space-x-2 mt-4">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={copyEmailToClipboard}
                            className="hover:bg-indigo-50 border-indigo-200"
                          >
                            <Copy className="mr-2 h-4 w-4 text-indigo-600" /> Copy
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={downloadEmail}
                            className="hover:bg-indigo-50 border-indigo-200"
                          >
                            <Download className="mr-2 h-4 w-4 text-green-600" /> Download
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}