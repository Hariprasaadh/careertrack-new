'use client';
import { useState, useEffect, useRef } from 'react';
// Define SpeechRecognition interfaces for TypeScript
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
  interpretation: Record<string, unknown>;
  emma: Document | null;
}
interface SpeechRecognitionResult {
  0: SpeechRecognitionAlternative;
  isFinal: boolean;
  length: number;
  [index: number]: SpeechRecognitionAlternative;
}


interface SpeechRecognitionResultList {
  0: SpeechRecognitionResult;
  length: number;
  [index: number]: SpeechRecognitionResult;
  }
interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onresult: (event: SpeechRecognitionEvent) => void;
  onstart: (event: Event) => void;
  onend: (event: Event) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onaudiostart: (event: Event) => void;
  onaudioend: (event: Event) => void;
  onnomatch: (event: SpeechRecognitionEvent) => void;
  onsoundstart: (event: Event) => void;
  onsoundend: (event: Event) => void;
  onspeechstart: (event: Event) => void;
  onspeechend: (event: Event) => void;
  start: () => void;
  stop: () => void;
  abort: () => void;
}
interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}
// Extend the Window interface to include SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
    faceLandmarksDetection: unknown; // For face-api.js or similar
  }
}
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  SendIcon, 
  User2, 
  FileText, 
  BarChart3, 
  Mic, 
  MicOff, 
  Camera, 
  Video,
  VideoOff 
} from 'lucide-react';
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";
import React from "react";

import { HumanDetection } from "@/components/humanDetection";

// Define types
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface FeedbackResponse {
  communication_skills: number;
  technical_knowledge: number;
  confidence_level: number;
  overall_score: number;
  detailed_feedback: string;
  facial_expressions?: {
    eye_contact: number;
    smile_frequency: number;
    overall_engagement: number;
    comments: string;
  };
}

// Face analysis data structure
interface FaceAnalysisData {
  eyeContact: number;
  smileFrequency: number;
  engagement: number;
  faceDetected: boolean;
  lastSnapshot?: string; // base64 image for the feedback
}

// API Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_INT_RENDER_URL;



const HireBot = () => {
  // App states
  const [appState, setAppState] = useState<'welcome' | 'uploading' | 'interview' | 'feedback'>('welcome');
  const [sessionId, setSessionId] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackResponse | null>(null);
  
  // Voice recognition states
  const [isListening, setIsListening] = useState(false);
  const speechRecognitionRef = useRef<SpeechRecognition | null>(null);
  
  // Camera and face tracking states
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraSupported, setCameraSupported] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [faceAnalysis, setFaceAnalysis] = useState<FaceAnalysisData>({
    eyeContact: 0,
    smileFrequency: 0,
    engagement: 0,
    faceDetected: false
  });

  // Fixed: Use single state for face detection data
  const faceDetectionInterval = useRef<NodeJS.Timeout | null>(null);
  const snapshots = useRef<string[]>([]);
  
  // Get user from Clerk
  const { user } = useUser();
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Check if voice recognition is supported
  const voiceSupported = typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  // Fixed: Proper camera support check with cleanup
  useEffect(() => {
    let mediaStream: MediaStream | null = null;
    
    const checkCameraSupport = async () => {
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
        setCameraSupported(true);
      } catch (error) {
        setCameraSupported(false);
        toast.error(`Camera access denied or not available, ${error}`);
      } finally {
        if (mediaStream) {
          mediaStream.getTracks().forEach(track => track.stop());
        }
      }
    };

    if (typeof navigator !== 'undefined' && navigator.mediaDevices) {
      checkCameraSupport();
    }

    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Fixed: Proper speech recognition setup with stable references
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      const handleResult = (event: SpeechRecognitionEvent) => {
        const currentResult = event.results[event.resultIndex];
        const transcript = currentResult[0].transcript;
        
        if (currentResult.isFinal) {
          // Replace instead of append to avoid duplication
          setInputMessage(transcript + ' ');
          recognition.stop();
          setIsListening(false);
          
        } else {
          // Only update with interim results if we're not already showing final results
          setInputMessage(transcript);
        }
      };

      recognition.onresult = handleResult;
      speechRecognitionRef.current = recognition;
    }

    return () => {
      speechRecognitionRef.current?.abort();
    };
  }, []); // Empty dependency array for one-time setup

  // Fixed: Face detection cleanup
  useEffect(() => {
    let isMounted = true;
    
    const loadFaceDetection = async () => {
      try {
        if (isMounted) {
          // Face detection initialization
          console.log('Face detection initialized');
        }
      } catch (error) {
        if (isMounted) {
          console.error('Face detection init error:', error);
          toast.error('Face detection failed to initialize');
        }
      }
    };

    if (cameraSupported) {
      loadFaceDetection();
    }

    return () => {
      isMounted = false;
      if (faceDetectionInterval.current) {
        clearInterval(faceDetectionInterval.current);
      }
    };
  }, [cameraSupported]);

  // Fixed: Camera toggle with proper cleanup
  const toggleCamera = useCallback(async () => {
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setCameraActive(false);
      if (faceDetectionInterval.current) {
        clearInterval(faceDetectionInterval.current);
        faceDetectionInterval.current = null;
      }
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: 640, height: 480, facingMode: "user" }
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setCameraActive(true);
          
          // Start face detection with cleanup
          if (!faceDetectionInterval.current) {
            faceDetectionInterval.current = setInterval(async () => {
              await detectFace();
            }, 1000);
          }
        }
      } catch (err) {
        toast.error(`Camera access denied ${err}`);
      }
    }
  }, []);

  const detectFace = async () => {
    if (!videoRef.current || !canvasRef.current || !cameraActive) return;

    try {
      const simulatedDetection = Math.random() > 0.1;
      setFaceAnalysis(prev => ({
        ...prev,
        eyeContact: simulatedDetection ? Math.min(prev.eyeContact + Math.random() * 0.1, 1) : prev.eyeContact,
        smileFrequency: simulatedDetection && Math.random() > 0.7 
          ? Math.min(prev.smileFrequency + 0.1, 1)
          : prev.smileFrequency,
        engagement: simulatedDetection ? Math.min(prev.engagement + Math.random() * 0.05, 1) : prev.engagement,
        faceDetected: simulatedDetection
      }));

      
      // Draw face rectangle on canvas (in a real implementation)
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        
        if (simulatedDetection) {
          // Simulate face box
          const x = canvasRef.current.width * 0.3 + (Math.random() * 10 - 5);
          const y = canvasRef.current.height * 0.3 + (Math.random() * 10 - 5);
          const width = canvasRef.current.width * 0.4;
          const height = canvasRef.current.height * 0.4;
          
          ctx.strokeStyle = '#4CAF50';
          ctx.lineWidth = 3;
          ctx.strokeRect(x, y, width, height);
        }
      }
      
    } catch (error) {
      console.error('Face detection error:', error);
    }
  };


  // Take a snapshot from the video
  const takeSnapshot = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    try {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        ctx.drawImage(videoRef.current, 0, 0);
        const imageData = canvasRef.current.toDataURL('image/jpeg', 0.7);
        snapshots.current.push(imageData);
        if (snapshots.current.length > 10) {
          snapshots.current.shift();
        }
      }
    } catch (error) {
      console.error('Error taking snapshot:', error);
    }
  };

  // Toggle speech recognition
  const toggleListening = () => {
    const recognition = speechRecognitionRef.current;
    if (!recognition) return;
    
    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      setInputMessage('');
      recognition.start();
      setIsListening(true);
    }
  };

  // Scroll to bottom of chat when messages change
  useEffect(() => {
    if (appState === 'interview') {
      scrollToBottom();
    }
  }, [messages, appState]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (!selectedFile.name.endsWith('.pdf')) {
        toast('Please select a PDF file');
        return;
      }
      setFile(selectedFile);
    }
  };

  // Upload resume and start interview
  const handleUploadResume = async () => {
    if (!file) {
      toast('No file selected');
      return;
    }
    setIsLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch(`${API_BASE_URL}/upload-resume`, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to upload resume');
      }
      const data = await response.json();
      setSessionId(data.session_id);
      setMessages([{ role: 'assistant', content: data.initial_question }]);
      setAppState('interview');
      speakText(data.initial_question);
      console.log('Resume uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload resume');
    } finally {
      setIsLoading(false);
    }
  };

  // Text-to-speech for responses
  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Start demo interview
  const handleStartDemo = async () => {
    setSessionId('s1');
    setIsLoading(true);
    
    try {
      const initialQuestion = "Hello! I'm HireBot, your AI interviewer today. I'll be asking you questions based on your resume. Let's start with: Could you tell me a bit about your experience as a Senior Developer at XYZ Corp?";
      setMessages([{ role: 'assistant', content: initialQuestion }]);
      setAppState('interview');
      speakText(initialQuestion);
    } catch (error) {
      console.error('Demo start error:', error);
      toast.error('Failed to start demo interview');
    } finally {
      setIsLoading(false);
    }
  };

  // Send message during interview
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;
    
    if (isListening && speechRecognitionRef.current) {
      speechRecognitionRef.current.stop();
      setIsListening(false);
    }
    
    const userMessage = inputMessage;
    setInputMessage('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);
    
    if (cameraActive) {
      takeSnapshot();
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/chat/${sessionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to send message');
      }
      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
      speakText(data.response);
    } catch (error) {
      console.error('Send message error:', error);
      toast.error('Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  // End interview and get feedback
  const handleEndInterview = async () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (isListening && speechRecognitionRef.current) {
      speechRecognitionRef.current.stop();
      setIsListening(false);
    }
    await handleGetFeedback();
  };

  // Get feedback with enhanced face analysis
  const handleGetFeedback = async () => {
    setIsLoading(true);
    
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/feedback/${sessionId}`, {
        method: 'GET',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to get feedback');
      }
      
      const data = await response.json();
      
      const enhancedFeedback: FeedbackResponse = {
        ...data,
        facial_expressions: {
          eye_contact: Math.round(faceAnalysis.eyeContact * 10),
          smile_frequency: Math.round(faceAnalysis.smileFrequency * 10),
          overall_engagement: Math.round(faceAnalysis.engagement * 10),
          comments: generateFacialFeedback(faceAnalysis)
        }
      };
      
      setFeedback(enhancedFeedback);
      setAppState('feedback');
    } catch (error) {
      console.error('Feedback error:', error);
      toast.error('Failed to get feedback');
    } finally {
      setIsLoading(false);
    }
  };

  // Generate feedback based on facial analysis
  const generateFacialFeedback = (analysis: FaceAnalysisData): string => {
    const comments = [];
    
    if (analysis.eyeContact > 0.8) {
      comments.push("You maintained excellent eye contact throughout the interview, which conveys confidence and engagement.");
    } else if (analysis.eyeContact > 0.5) {
      comments.push("Your eye contact was good, but could be more consistent to show greater confidence.");
    } else {
      comments.push("Try to maintain more consistent eye contact, as this helps establish rapport with the interviewer.");
    }
    
    if (analysis.smileFrequency > 0.7) {
      comments.push("You smiled appropriately throughout the interview, which helps create a positive impression.");
    } else if (analysis.smileFrequency > 0.4) {
      comments.push("Consider smiling a bit more during your responses to appear more approachable and confident.");
    } else {
      comments.push("Try to incorporate more positive facial expressions like smiling to appear more enthusiastic about the role.");
    }
    
    if (analysis.engagement > 0.7) {
      comments.push("Your facial expressions showed high engagement with the interview questions.");
    } else if (analysis.engagement > 0.4) {
      comments.push("Your facial expressions were generally engaged, but could show more enthusiasm at key moments.");
    } else {
      comments.push("Work on showing more engagement through your facial expressions to demonstrate your interest in the position.");
    }
    
    return comments.join(" ");
  };

  // Reset to welcome screen
  const handleReset = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (isListening && speechRecognitionRef.current) {
      speechRecognitionRef.current.stop();
      setIsListening(false);
    }
    if (cameraActive) {
      toggleCamera();
    }
    setAppState('welcome');
    setSessionId('');
    setFile(null);
    setMessages([]);
    setFeedback(null);
  
    snapshots.current = [];
  };

  // Continue interview from feedback
  const handleContinueInterview = () => {
    setAppState('interview');
  };

  // Render welcome screen
  const renderWelcomeScreen = () => (
    <div className="container flex flex-col items-center justify-center min-h-[80vh] py-12 space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">HireBot Voice & Video Interview Practice</h1>
        <p className="text-xl text-muted-foreground max-w-[42rem] mx-auto">
          Prepare for your next job interview with our AI-powered voice and video mock interview system.
        </p>
        {user && (
          <div className="flex items-center justify-center gap-2 mt-4">
            <div className="h-10 w-10 rounded-full overflow-hidden">
              {user.imageUrl ? (
                <img 
                    src={user.imageUrl} 
                    alt={user.fullName || "User"} 
                    className="h-full w-full object-cover"
                    /* nextjs/no-img-element is being ignored for simplicity */
                />
              ) : (
                <div className="h-full w-full bg-primary flex items-center justify-center">
                  <User2 className="h-6 w-6 text-primary-foreground" />
                </div>
              )}
            </div>
            <span className="text-lg font-medium">Welcome, {user.firstName || "User"}</span>
          </div>
        )}
      </div>
      
      <Tabs defaultValue="upload" className="w-full max-w-md">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload">Upload Resume</TabsTrigger>
          <TabsTrigger value="demo">Try Demo</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upload Your Resume</CardTitle>
              <CardDescription>
                Upload your PDF resume to start a personalized video interview
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid w-full items-center gap-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="resume">Resume (PDF)</Label>
                  <Input
                    id="resume"
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    disabled={isLoading}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                onClick={handleUploadResume}
                disabled={!file || isLoading}
              >
                {isLoading ? 'Uploading...' : 'Start Video Interview'}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="demo">
          <Card>
            <CardHeader>
              <CardTitle>Try Demo Video Interview</CardTitle>
              <CardDescription>
                Start with a sample resume to experience how the system works
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                The demo uses a pre-loaded sample resume for a software engineer with experience at XYZ Corp and ABC Inc.
              </p>
              {!voiceSupported && (
                <p className="text-sm font-medium text-red-500 mb-2">
                  Your browser doesn&apos;t support voice recognition. Please try Chrome, Edge, or Safari.
                </p>
              )}
              {!cameraSupported && (
                <p className="text-sm font-medium text-red-500">
                  Your browser doesn&apos;t support camera access. Please try Chrome, Edge, or Safari.
                </p>
              )}
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                onClick={handleStartDemo}
                disabled={isLoading}
              >
                {isLoading ? 'Starting...' : 'Start Demo Interview'}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
        <div className="flex flex-col items-center p-6 bg-muted rounded-lg">
          <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center mb-4">
            <FileText className="h-6 w-6 text-primary-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">Upload Resume</h3>
          <p className="text-center text-muted-foreground">
            Upload your resume for a personalized interview experience
          </p>
        </div>
        
        <div className="flex flex-col items-center p-6 bg-muted rounded-lg">
          <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center mb-4">
            <Camera className="h-6 w-6 text-primary-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">Video Interview</h3>
          <p className="text-center text-muted-foreground">
            Get feedback on your facial expressions and body language
          </p>
        </div>
        
        <div className="flex flex-col items-center p-6 bg-muted rounded-lg">
          <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center mb-4">
            <BarChart3 className="h-6 w-6 text-primary-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">Comprehensive Feedback</h3>
          <p className="text-center text-muted-foreground">
            Receive detailed feedback on your verbal and visual performance
          </p>
        </div>
      </div>
    </div>
  );

  // Render interview screen with chat and video feed
  const renderInterviewScreen = () => (
    <div className="container py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="w-full h-[80vh] flex flex-col">
            <CardHeader className="px-6 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <CardTitle>Voice Interview Session</CardTitle>
                {user && (
                  <div className="flex items-center ml-4">
                    <div className="h-6 w-6 rounded-full overflow-hidden mr-2">
                      {user.imageUrl ? (
                        <img 
                            src={user.imageUrl} 
                            alt={user.fullName || "User"} 
                            className="h-full w-full object-cover"
                            /* nextjs/no-img-element is being ignored for simplicity */
                        />
                      ) : (
                        <div className="h-full w-full bg-primary flex items-center justify-center">
                          <User2 className="h-3 w-3 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                    <span className="text-sm font-medium">{user.firstName || "User"}</span>
                  </div>
                )}
              </div>
              <div className="flex space-x-2">
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={handleEndInterview}
                  disabled={isLoading}
                >
                  End Interview
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={toggleCamera}
                  disabled={!cameraSupported || isLoading}
                >
                  {cameraActive ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={toggleListening}
                  disabled={!voiceSupported || isLoading}
                >
                  {isListening ? < Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-4">
              {messages.map((msg, index) => (
                <div key={index} className={`mb-2 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                  <div className={`inline-block px-4 py-2 rounded ${msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'}`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </CardContent>
            <CardFooter className="flex items-center gap-2 px-4">
              <Input 
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your answer..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button 
                onClick={handleSendMessage}
                disabled={isLoading || !inputMessage.trim()}
              >
                <SendIcon className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </div>
        <div className="lg:col-span-1">
  <div className="relative h-[480px] w-[640px]">
    <video 
      ref={videoRef} 
      className="rounded-lg"
      width="640" 
      height="480" 
      autoPlay 
      playsInline 
      muted
    />
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 pointer-events-none"
      width="640"
      height="480"
    />
    {videoRef.current && canvasRef.current ? (
      <HumanDetection videoRef={videoRef as React.RefObject<HTMLVideoElement>} canvasRef={canvasRef as React.RefObject<HTMLCanvasElement>} />
    ) : null}
  </div>
</div>
      </div>
    </div>
  );
  
  // Render feedback screen
  const renderFeedbackScreen = () => (
    <div className="container py-12">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Interview Feedback</CardTitle>
          <CardDescription>
            Here&apos;s your performance review based on your responses and body language.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {feedback ? (
            <div className="space-y-4">
              <div>
                <strong>Communication Skills:</strong> {feedback.communication_skills}/10
              </div>
              <div>
                <strong>Technical Knowledge:</strong> {feedback.technical_knowledge}/10
              </div>
              <div>
                <strong>Confidence Level:</strong> {feedback.confidence_level}/10
              </div>
              <div>
                <strong>Overall Score:</strong> {feedback.overall_score}/10
              </div>
              <div>
                <strong>Detailed Feedback:</strong> {feedback.detailed_feedback}
              </div>
              
            </div>
          ) : (
            <p>No feedback available.</p>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button onClick={handleContinueInterview}>Continue Interview</Button>
          <Button variant="destructive" onClick={handleReset}>Restart</Button>
        </CardFooter>
      </Card>
    </div>
  );

  return (
    <>
      {appState === 'welcome' && renderWelcomeScreen()}
      {appState === 'interview' && renderInterviewScreen()}
      {appState === 'feedback' && renderFeedbackScreen()}
    </>
  );
};

export default HireBot;
import { useCallback } from 'react';

