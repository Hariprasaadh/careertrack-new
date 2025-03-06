"use client";

import React, { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Send, Upload, AlertCircle, Brain } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUser } from "@clerk/nextjs";

const API_URL = process.env.NEXT_PUBLIC_PDF_RENDER_URL;

interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

export default function Home() {
  const { user } = useUser();
  const [sessionId, setSessionId] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [question, setQuestion] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<boolean>(false);
  const [loadingDots, setLoadingDots] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    handleSessionCreate();
  }, []);

  useEffect(() => {
    let dotCount = 0;
    let interval: NodeJS.Timeout;
    
    if (isProcessing) {
      interval = setInterval(() => {
        dotCount = (dotCount + 1) % 4;
        setLoadingDots('.'.repeat(dotCount));
      }, 500);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isProcessing]);

  // Scroll to bottom when chat history updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isProcessing, loadingDots]);

  const handleSessionCreate = () => {
    const newSessionId = uuidv4();
    setSessionId(newSessionId);
    setFile(null);
    setQuestion('');
    setChatHistory([]);
    setError(null);
    setUploadSuccess(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== 'application/pdf') {
        setError('Only PDF files are supported');
        return;
      }
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!sessionId || !file) {
      setError(sessionId ? 'Please select a PDF file' : 'Session ID missing');
      return;
    }

    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_URL}/upload/${sessionId}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Upload failed');
      }

      setUploadSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleAsk = async () => {
    if (!sessionId || !uploadSuccess || !question.trim()) return;

    const userMessage: ChatMessage = {
      id: uuidv4(),
      content: question,
      isUser: true,
      timestamp: new Date(),
    };
    
    setChatHistory(prev => [...prev, userMessage]);
    setQuestion('');
    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/ask/${sessionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      });

      if (!response.ok) throw new Error('Request failed');
      const data = await response.json();

      const aiMessage: ChatMessage = {
        id: uuidv4(),
        content: data.response,
        isUser: false,
        timestamp: new Date(),
      };
      setChatHistory(prev => [...prev, aiMessage]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed');
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (API_URL) {
      console.log("API URL:", API_URL);
    } else {
      console.warn("API URL not configured");
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!API_URL && (
          <Alert variant="default" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Configuration Error</AlertTitle>
            <AlertDescription>Missing API URL configuration</AlertDescription>
          </Alert>
        )}

        <div className="mb-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">PDF Research Assistant</h1>
            {sessionId && (
              <p className="text-sm text-gray-500">Session: {sessionId.substring(0, 8)}...</p>
            )}
          </div>
          <Button onClick={handleSessionCreate} variant="outline">
            New Session
          </Button>
        </div>

        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="upload">Upload PDF</TabsTrigger>
            <TabsTrigger value="ask" disabled={!uploadSuccess}>Ask Questions</TabsTrigger>
          </TabsList>

          <TabsContent value="upload">
            <Card>
              <CardHeader>
                <CardTitle>Upload Research Paper</CardTitle>
                <CardDescription>
                  Upload a PDF document to start asking questions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid w-full max-w-md items-center gap-1.5">
                    <Label htmlFor="pdf-upload">PDF File</Label>
                    <Input
                      id="pdf-upload"
                      type="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                    />
                    {file && (
                      <p className="text-sm text-gray-500">
                        Selected: {file.name} ({Math.round(file.size / 1024)}KB)
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex items-center gap-4">
                <Button
                  onClick={handleUpload}
                  disabled={!file || isUploading}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload PDF
                    </>
                  )}
                </Button>
                {uploadSuccess && (
                  <span className="text-green-600 flex items-center gap-2">
                    <Brain className="h-4 w-4" />
                    Ready for questions
                  </span>
                )}
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="ask">
            <Card className="h-[600px] sm:h-[700px] flex flex-col">
              <CardHeader className="pb-4">
                <CardTitle>Paper Discussion</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Chat with the AI about the research paper content
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0 overflow-hidden flex-1">
                <ScrollArea className="h-[calc(100%-80px)] sm:h-[calc(100%-70px)]">
                  <div className="flex flex-col p-4 gap-4">
                    {chatHistory.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} gap-3`}
                      >
                        {!message.isUser && (
                          <Avatar className="flex-shrink-0">
                            <AvatarFallback className="bg-blue-500 text-white text-xs">
                              <Brain className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div
                          className={`max-w-[85%] rounded-xl p-3 ${
                            message.isUser
                              ? 'bg-gray-100 ml-auto'
                              : 'bg-blue-50'
                          }`}
                        >
                          <div className="prose prose-sm max-w-none break-words">
                            <ReactMarkdown>
                              {message.content}
                            </ReactMarkdown>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {message.timestamp.toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                        {message.isUser && (
                          <Avatar className="flex-shrink-0">
                            {user ? (
                              <AvatarImage src={user.imageUrl} alt={user.fullName || "User"} />
                            ) : null}
                            <AvatarFallback className="bg-primary text-primary-foreground">
                              {user?.firstName?.[0] || (
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                  className="h-4 w-4"
                                  fill="none"
                                  stroke="currentColor" 
                                  strokeWidth="2"
                                  strokeLinecap="round" 
                                  strokeLinejoin="round"
                                >
                                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                                  <circle cx="12" cy="7" r="4" />
                                </svg>
                              )}
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    ))}
                    {isProcessing && (
                      <div className="flex gap-3">
                        <Avatar className="flex-shrink-0">
                          <AvatarFallback className="bg-blue-500 text-white text-xs">
                            <Brain className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="bg-blue-50 rounded-xl p-3 max-w-[85%]">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Analyzing paper{loadingDots}
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} /> {/* Scroll anchor */}
                  </div>
                </ScrollArea>
                <div className="border-t p-4 bg-white">
                  <div className="flex items-center gap-2">
                    <Input
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      placeholder="Ask about the paper..."
                      onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleAsk()}
                      className="flex-1 min-w-[100px]"
                    />
                    <Button
                      onClick={handleAsk}
                      disabled={!question.trim() || isProcessing}
                      size="icon"
                      className="flex-shrink-0"
                    >
                      {isProcessing ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 pl-1">
                    Example: &quot;What methodology did the researchers use?&quot;
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}