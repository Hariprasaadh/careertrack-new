"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/utils/supabase/client";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { format, isToday, isYesterday, subDays } from "date-fns";
import { toast } from "sonner";

type Todo = {
  id: string;
  text: string;
  completed: boolean;
  created_at: string;
  user_id: string;
};

type Session = {
  id: string;
  session_type: string;
  start_time: string;
  end_time: string;
  duration: number;
  created_at: string;
  user_id: string;
};

type TimeFrame = "today" | "week" | "all";

export default function Dashboard() {
  const { user } = useUser();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [newTodo, setNewTodo] = useState("");
  const [loading, setLoading] = useState(true);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [timeFrame, setTimeFrame] = useState<TimeFrame>("week");

  const fetchTodos = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });

    if (error) {
      toast.error("Error fetching todos");
    } else {
      setTodos(data || []);
    }
    setLoading(false);
  };

  const fetchSessions = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });

    if (error) {
      toast.error("Error fetching sessions");
      console.error("Sessions fetch error:", error);
    } else {
      setSessions(data || []);
    }
    setSessionsLoading(false);
  };

  useEffect(() => {
    if (user?.id) {
      fetchTodos();
      fetchSessions();
    }
  }, [user]);

  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;

    const supabase = createClient();
    const { error } = await supabase
      .from('todos')
      .insert({
        text: newTodo,
        user_id: user?.id,
        completed: false
      });

    if (error) {
      toast.error("Failed to add todo");
    } else {
      setNewTodo("");
      fetchTodos();
      toast.success("Task added successfully");
    }
  };

  const toggleTodo = async (id: string) => {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;

    const supabase = createClient();
    const { error } = await supabase
      .from('todos')
      .update({ completed: !todo.completed })
      .eq('id', id);

    if (error) {
      toast.error("Update failed");
    } else {
      fetchTodos();
    }
  };

  const deleteTodo = async (id: string) => {
    const supabase = createClient();
    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error("Delete failed");
    } else {
      fetchTodos();
      toast.success("Task deleted");
    }
  };

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    if (isToday(date)) {
      return `Today at ${format(date, 'h:mm a')}`;
    } else if (isYesterday(date)) {
      return `Yesterday at ${format(date, 'h:mm a')}`;
    } else {
      return format(date, 'MMM dd, yyyy - h:mm a');
    }
  };

  const getFilteredSessions = (): Session[] => {
    const now = new Date();
    
    if (timeFrame === "today") {
      return sessions.filter(session => isToday(new Date(session.start_time)));
    } else if (timeFrame === "week") {
      const oneWeekAgo = subDays(now, 7);
      return sessions.filter(session => new Date(session.start_time) >= oneWeekAgo);
    } else {
      return sessions;
    }
  };

  const calculateStats = () => {
    const filteredSessions = getFilteredSessions();
    const workSessions = filteredSessions.filter(s => s.session_type === 'work');
    const breakSessions = filteredSessions.filter(s => s.session_type === 'break');
    
    const totalWorkDuration = workSessions.reduce((sum, session) => sum + session.duration, 0);
    const totalBreakDuration = breakSessions.reduce((sum, session) => sum + session.duration, 0);
    
    return {
      totalSessions: filteredSessions.length,
      workSessions: workSessions.length,
      breakSessions: breakSessions.length,
      totalWorkDuration,
      totalBreakDuration,
      totalDuration: totalWorkDuration + totalBreakDuration,
      averageWorkDuration: workSessions.length ? Math.round(totalWorkDuration / workSessions.length) : 0
    };
  };

  const stats = calculateStats();
  const filteredSessions = getFilteredSessions();
  const completedTodos = todos.filter(todo => todo.completed);
  const pendingTodos = todos.filter(todo => !todo.completed);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 p-4 md:p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left column - Tasks */}
          <div className="w-full md:w-1/2 space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Add New Task</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={addTodo} className="flex gap-2">
                  <Input 
                    value={newTodo}
                    onChange={(e) => setNewTodo(e.target.value)}
                    placeholder="What needs to be done?"
                    className="flex-1"
                  />
                  <Button type="submit">Add</Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <CardTitle>Tasks</CardTitle>
                  <div className="flex gap-2">
                    <Badge variant="outline">{pendingTodos.length} pending</Badge>
                    <Badge variant="outline">{completedTodos.length} completed</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading ? (
                  <div className="text-center text-muted-foreground py-6">Loading tasks...</div>
                ) : todos.length === 0 ? (
                  <div className="text-center text-muted-foreground py-6">No tasks yet</div>
                ) : (
                  <div>
                    {pendingTodos.length > 0 && (
                      <div className="space-y-2 mb-4">
                        <h3 className="text-sm font-medium text-muted-foreground">Pending</h3>
                        {pendingTodos.map((todo) => (
                          <div key={todo.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted/80 transition-colors">
                            <div className="flex items-center gap-3 flex-1">
                              <Checkbox 
                                id={`todo-${todo.id}`}
                                checked={todo.completed}
                                onCheckedChange={() => toggleTodo(todo.id)}
                              />
                              <div className="flex-1">
                                <label htmlFor={`todo-${todo.id}`} className="text-sm font-medium">
                                  {todo.text}
                                </label>
                                <p className="text-xs text-muted-foreground">
                                  {formatDate(todo.created_at)}
                                </p>
                              </div>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => deleteTodo(todo.id)}
                              className="h-8 w-8"
                            >
                              <TrashIcon className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {completedTodos.length > 0 && (
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium text-muted-foreground">Completed</h3>
                        {completedTodos.map((todo) => (
                          <div key={todo.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                            <div className="flex items-center gap-3 flex-1">
                              <Checkbox 
                                id={`todo-completed-${todo.id}`}
                                checked={todo.completed}
                                onCheckedChange={() => toggleTodo(todo.id)}
                              />
                              <div className="flex-1">
                                <label htmlFor={`todo-completed-${todo.id}`} className="text-sm font-medium line-through text-muted-foreground">
                                  {todo.text}
                                </label>
                                <p className="text-xs text-muted-foreground">
                                  {formatDate(todo.created_at)}
                                </p>
                              </div>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => deleteTodo(todo.id)}
                              className="h-8 w-8"
                            >
                              <TrashIcon className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right column - Pomodoro */}
          <div className="w-full md:w-1/2 space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Pomodoro Statistics</CardTitle>
                <CardDescription>Track your productivity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <div className="text-2xl font-bold">{stats.workSessions}</div>
                    <div className="text-sm text-muted-foreground">Focus Sessions</div>
                  </div>
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <div className="text-2xl font-bold">{formatDuration(stats.totalWorkDuration)}</div>
                    <div className="text-sm text-muted-foreground">Total Focus Time</div>
                  </div>
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <div className="text-2xl font-bold">{stats.breakSessions}</div>
                    <div className="text-sm text-muted-foreground">Break Sessions</div>
                  </div>
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <div className="text-2xl font-bold">{formatDuration(stats.averageWorkDuration)}</div>
                    <div className="text-sm text-muted-foreground">Avg. Focus Duration</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle>Pomodoro Sessions</CardTitle>
                  <Tabs value={timeFrame} onValueChange={(value) => setTimeFrame(value as TimeFrame)}>
                    <TabsList>
                      <TabsTrigger value="today">Today</TabsTrigger>
                      <TabsTrigger value="week">Week</TabsTrigger>
                      <TabsTrigger value="all">All</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {sessionsLoading ? (
                  <div className="text-center text-muted-foreground py-6">Loading sessions...</div>
                ) : filteredSessions.length === 0 ? (
                  <div className="text-center text-muted-foreground py-6">No sessions in this timeframe</div>
                ) : (
                  <div className="grid gap-3">
                    {filteredSessions.map((session) => (
                      <div key={session.id} className="p-3 bg-muted/50 rounded-lg border-l-4 border-l-solid" style={{
                        borderLeftColor: session.session_type === 'work' ? '#FF6B6B' : '#4ECDC4'
                      }}>
                        <div className="flex justify-between items-center mb-1">
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                            session.session_type === 'work' ? 'bg-red-100 text-red-800' : 'bg-teal-100 text-teal-800'
                          }`}>
                            {session.session_type === 'work' ? 'Focus' : 'Break'}
                          </span>
                          <span className="text-sm font-medium">{formatDuration(session.duration)}</span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {formatDate(session.start_time)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
              <CardFooter className="border-t pt-4 flex justify-center">
                <Button variant="outline" onClick={() => fetchSessions()} size="sm">
                  <RefreshIcon className="h-4 w-4 mr-2" />
                  Refresh Sessions
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function TrashIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  );
}

function RefreshIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M3 21v-5h5" />
    </svg>
  );
}