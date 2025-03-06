"use client";
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Message {
  content: string;
  isUser: boolean;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_GIT_RENDER_URL;

export default function Home() {
  const [sessionId, setSessionId] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Check for an existing session in localStorage on component mount
  useEffect(() => {
    const savedSession = localStorage.getItem('githubChatSession');
    if (savedSession) {
      const { sessionId, repoUrl } = JSON.parse(savedSession);
      setSessionId(sessionId);
      setRepoUrl(repoUrl);
    } else {
      // Auto-generate a session id if not found
      const newSessionId = crypto.randomUUID();
      setSessionId(newSessionId);
      localStorage.setItem('githubChatSession', JSON.stringify({ sessionId: newSessionId, repoUrl: '' }));
    }
  }, []);

  // Auto-scroll to bottom whenever messages update
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const ingestRepository = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/ingest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repo_url: repoUrl, session_id: sessionId }),
      });
      if (!response.ok) throw new Error('Ingestion failed');

      // Save session info in localStorage for persistence
      localStorage.setItem('githubChatSession', JSON.stringify({ sessionId, repoUrl }));

      // Clear any old messages and display a system message
      setMessages([
        {
          content: `Repository ${repoUrl} ingested successfully! Ask me anything about it.`,
          isUser: false,
        },
      ]);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to ingest repository');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    // Append the user's message
    const updatedMessages = [...messages, { content: question, isUser: true }];
    setMessages(updatedMessages);
    setQuestion('');

    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, question }),
      });
      if (!response.ok) throw new Error('Chat failed');

      const data = await response.json();
      // Append the bot's response
      setMessages([...updatedMessages, { content: data.response, isUser: false }]);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to get response');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-4">
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>GitHub Repository Chat</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Input
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="Enter GitHub repository URL"
              />
              <Input
                value={sessionId}
                placeholder="Session ID"
                className="w-40"
                disabled
              />
              <Button
                onClick={ingestRepository}
                disabled={isLoading || !repoUrl || !sessionId}
              >
                {isLoading ? 'Processing...' : 'Ingest Repo'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Chat</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96 rounded-md border p-4" ref={scrollRef}>
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`mb-4 p-4 rounded-lg ${
                    message.isUser
                      ? 'bg-blue-100 ml-auto max-w-[80%]'
                      : 'bg-gray-100 mr-auto max-w-[80%]'
                  }`}
                >
                  <p className={message.isUser ? 'text-blue-800' : 'text-gray-800'}>
                    {message.content}
                  </p>
                </div>
              ))}
            </ScrollArea>
          </CardContent>
          <CardFooter>
            <form onSubmit={handleChat} className="flex w-full gap-4">
              <Input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask about the repository..."
                disabled={!sessionId}
              />
              <Button type="submit" disabled={!sessionId}>
                Send
              </Button>
            </form>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
