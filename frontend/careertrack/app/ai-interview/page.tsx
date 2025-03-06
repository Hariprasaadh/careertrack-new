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
}
}
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SendIcon, User2, Bot, FileText, BarChart3, Mic, MicOff, LogOut } from 'lucide-react';
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";

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
}

// API Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_INT_RENDER_URL;

const HireBot = () => {
  // App states
  const [appState, setAppState] = useState<'welcome' | 'uploading' | 'interview' | 'feedback'>('welcome');
  const [sessionId, setSessionId] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackResponse | null>(null);
  
  // Voice recognition states
  const [isListening, setIsListening] = useState(false);
const [speechRecognition, setSpeechRecognition] = useState<SpeechRecognition | null>(null);
  const [voiceSupported, setVoiceSupported] = useState(true);
  
  // Get user from Clerk
  const { user } = useUser();
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check if browser supports SpeechRecognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        
        recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = Array.from(event.results)
        .map(result => result[0])
        .map(result => result.transcript)
        .join('');
          
        // Only update if we have a final result or a decent length transcript
        if (event.results[0].isFinal || transcript.length > 5) {
            setInputMessage(transcript);
          }
        };
        
        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.error('Speech recognition error', event.error);
          setIsListening(false);
          toast.error(`Microphone error: ${event.error}`);
        };
        
        recognition.onend = () => {
          setIsListening(false);
        };
        
        setSpeechRecognition(recognition);
      } else {
        setVoiceSupported(false);
        toast.error('Speech recognition not supported in this browser');
      }
    }
    
    // Cleanup
    return () => {
      if (speechRecognition) {
        speechRecognition.abort();
      }
    };
}, [speechRecognition]);

  // Toggle speech recognition
  const toggleListening = () => {
    if (!speechRecognition) return;
    
    if (isListening) {
      speechRecognition.stop();
      setIsListening(false);
    } else {
      setInputMessage('');
      speechRecognition.start();
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
      toast('No file selected')
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
      
      // Read the initial question out loud
      speakText(data.initial_question);
      
      console.log('Resume uploaded successfully');
    } catch (error) {
        console.error('Upload error:', error);
        toast.error('Failed to upload resume');
    } finally {
      setIsLoading(false);
    }
  };

  // Text-to-speech function for interviewer responses
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
      // For demo session, we'll use a predefined message
      const initialQuestion = "Hello! I'm HireBot, your AI interviewer today. I'll be asking you questions based on your resume. Let's start with: Could you tell me a bit about your experience as a Senior Developer at XYZ Corp?";
      setMessages([{ role: 'assistant', content: initialQuestion }]);
      setAppState('interview');
      
      // Read the initial question out loud
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

    // Stop listening if active
    if (isListening && speechRecognition) {
      speechRecognition.stop();
      setIsListening(false);
    }

    const userMessage = inputMessage;
    setInputMessage('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/chat/${sessionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to send message');
      }

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
      
      // Read the response out loud
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
    // Stop any ongoing speech synthesis
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    
    // Stop listening if active
    if (isListening && speechRecognition) {
      speechRecognition.stop();
      setIsListening(false);
    }
    
    await handleGetFeedback();
  };

  // Get feedback
  const handleGetFeedback = async () => {
    setIsLoading(true);
    
    // Stop any ongoing speech synthesis
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
      setFeedback(data);
      setAppState('feedback');
    } catch (error) {
        console.error('Feedback error:', error);
        toast.error('Failed to get feedback');
    } finally {
      setIsLoading(false);
    }
  };

  // Reset to welcome screen
  const handleReset = () => {
    // Stop any ongoing speech synthesis
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    
    // Stop listening if active
    if (isListening && speechRecognition) {
      speechRecognition.stop();
      setIsListening(false);
    }
    
    setAppState('welcome');
    setSessionId('');
    setFile(null);
    setMessages([]);
    setFeedback(null);
  };

  // Continue interview from feedback
  const handleContinueInterview = () => {
    setAppState('interview');
  };

  // Render welcome screen
  const renderWelcomeScreen = () => (
    <div className="container flex flex-col items-center justify-center min-h-[80vh] py-12 space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">HireBot Voice Interview Practice</h1>
        <p className="text-xl text-muted-foreground max-w-[42rem] mx-auto">
          Prepare for your next job interview with our AI-powered voice mock interview system.
        </p>
        {user && (
          <div className="flex items-center justify-center gap-2 mt-4">
            <div className="h-10 w-10 rounded-full overflow-hidden">
              {user.imageUrl ? (
                <img 
                  src={user.imageUrl} 
                  alt={user.fullName || "User"} 
                  className="h-full w-full object-cover" 
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
                Upload your PDF resume to start a personalized voice interview
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
                {isLoading ? 'Uploading...' : 'Start Voice Interview'}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="demo">
          <Card>
            <CardHeader>
              <CardTitle>Try Demo Voice Interview</CardTitle>
              <CardDescription>
                Start with a sample resume to experience how the system works
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                The demo uses a pre-loaded sample resume for a software engineer with experience at XYZ Corp and ABC Inc.
              </p>
              {!voiceSupported && (
                <p className="text-sm font-medium text-red-500">
                Your browser doesn&apos;t support voice recognition. Please try Chrome, Edge, or Safari.
                </p>
              )}
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                onClick={handleStartDemo}
                disabled={isLoading}
              >
                {isLoading ? 'Starting...' : 'Start Demo Voice Interview'}
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
            <Mic className="h-6 w-6 text-primary-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">Voice Interview</h3>
          <p className="text-center text-muted-foreground">
            Speak your responses in a realistic voice interview with our AI interviewer
          </p>
        </div>
        
        <div className="flex flex-col items-center p-6 bg-muted rounded-lg">
          <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center mb-4">
            <BarChart3 className="h-6 w-6 text-primary-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">Get Feedback</h3>
          <p className="text-center text-muted-foreground">
            Receive detailed feedback on your performance to improve
          </p>
        </div>
      </div>
    </div>
  );

  // Render interview screen
  const renderInterviewScreen = () => (
    <div className="container py-8">
      <Card className="w-full h-[80vh] flex flex-col max-w-4xl mx-auto">
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
              className="flex items-center gap-1"
            >
              <LogOut className="h-4 w-4 mr-1" />
              End Interview
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleGetFeedback}
              disabled={isLoading || messages.length < 4}
            >
              Get Feedback
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleReset}
            >
              New Interview
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden px-6 pb-0">
          <ScrollArea className="h-full pr-4">
            <div className="space-y-4 pb-4">
              {messages.map((message, i) => (
                <div
                  key={i}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`flex items-start gap-2 max-w-[80%] ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    } p-3 rounded-lg`}
                  >
                    <div className="h-8 w-8 rounded-full flex items-center justify-center shrink-0">
                      {message.role === 'user' ? (
                        user && user.imageUrl ? (
                          <img 
                            src={user.imageUrl} 
                            alt={user.fullName || "User"} 
                            className="h-8 w-8 rounded-full object-cover" 
                          />
                        ) : (
                          <User2 className="h-5 w-5" />
                        )
                      ) : (
                        <Bot className="h-5 w-5" />
                      )}
                    </div>
                    <div className="text-sm">{message.content}</div>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
          </ScrollArea>
        </CardContent>
        <CardFooter className="p-4 border-t">
          <form onSubmit={handleSendMessage} className="flex w-full items-center space-x-2">
            <Input
              placeholder={isListening ? "Listening..." : "Type or speak your response..."}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              disabled={isLoading}
              className={`flex-1 ${isListening ? 'border-green-500 border-2' : ''}`}
            />
            <Button 
              type="button" 
              size="icon" 
              variant={isListening ? "destructive" : "secondary"}
              onClick={toggleListening}
              disabled={!voiceSupported || isLoading}
              title={isListening ? "Stop listening" : "Start listening"}
            >
              {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
            <Button type="submit" size="icon" disabled={isLoading || !inputMessage.trim()}>
              <SendIcon className="h-4 w-4" />
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );

  // Render feedback screen
  const renderFeedbackScreen = () => (
    <div className="container py-8">
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle>Interview Feedback</CardTitle>
            {user && (
              <div className="flex items-center ml-4">
                <div className="h-6 w-6 rounded-full overflow-hidden mr-2">
                  {user.imageUrl ? (
                    <img 
                      src={user.imageUrl} 
                      alt={user.fullName || "User"} 
                      className="h-full w-full object-cover" 
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
          <Button variant="ghost" size="sm" onClick={handleReset}>
            New Interview
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {feedback && (
            <>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Communication Skills</span>
                    <span className="text-sm font-medium">{feedback.communication_skills}/10</span>
                  </div>
                  <Progress value={feedback.communication_skills * 10} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Technical Knowledge</span>
                    <span className="text-sm font-medium">{feedback.technical_knowledge}/10</span>
                  </div>
                  <Progress value={feedback.technical_knowledge * 10} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Confidence Level</span>
                    <span className="text-sm font-medium">{feedback.confidence_level}/10</span>
                  </div>
                  <Progress value={feedback.confidence_level * 10} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Overall Score</span>
                    <span className="text-sm font-medium">{feedback.overall_score.toFixed(1)}/10</span>
                  </div>
                  <Progress value={feedback.overall_score * 10} className="h-2" />
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-2">Detailed Feedback</h3>
                <div className="bg-muted p-4 rounded-md">
                  <p className="text-sm">{feedback.detailed_feedback}</p>
                </div>
              </div>
            </>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={handleContinueInterview}
          >
            Continue Interview
          </Button>
          <Button onClick={handleReset}>Start New Interview</Button>
        </CardFooter>
      </Card>
    </div>
  );

  // Render based on current app state
  switch (appState) {
    case 'welcome':
      return renderWelcomeScreen();
    case 'interview':
      return renderInterviewScreen();
    case 'feedback':
      return renderFeedbackScreen();
    default:
      return renderWelcomeScreen();
  }
};

export default HireBot;