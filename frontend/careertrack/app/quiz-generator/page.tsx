"use client";

import { useState, useEffect } from "react";
import Head from "next/head";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  BookOpen,
  CheckCircle,
  Lightbulb,
  Loader2,
  Save,
  RotateCcw,
  Timer,
  Award,
  ArrowRight,
  History,
} from "lucide-react";
import { toast } from "sonner";

import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface Question {
  mcq: string;
  options: { [key: string]: string };
  correct: string;
  explanation?: string;
}

interface QuizHistoryEntry {
  date: string;
  score: number;
  total: number;
  level: string;
  topic: string;
}

// New helper component: a bar chart displaying quiz history scores
function QuizHistoryGraph({ quizHistory }: { quizHistory: QuizHistoryEntry[] }) {
  const labels = quizHistory.map((entry) => entry.date);
  const dataValues = quizHistory.map((entry) =>
    Math.round((entry.score / entry.total) * 100)
  );

  const data = {
    labels,
    datasets: [
      {
        label: "Score (%)",
        data: dataValues,
        backgroundColor: "rgba(59, 130, 246, 0.5)", // Tailwind blue-500 semi-transparent
        borderColor: "rgba(59, 130, 246, 1)",
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Quiz History Scores",
      },
    },
  };

  return (
    <div className="p-4">
      <Bar data={data} options={options} />
    </div>
  );
}

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentTab, setCurrentTab] = useState("content");
  const [formData, setFormData] = useState({
    text_content: "",
    num_questions: 5,
    quiz_level: "Medium",
    include_explanations: true,
  });
  const [showResults, setShowResults] = useState(false);
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: string }>({});
  const [score, setScore] = useState(0);
  const [quizTimer, setQuizTimer] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [quizHistory, setQuizHistory] = useState<QuizHistoryEntry[]>([]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerActive) {
      interval = setInterval(() => {
        setQuizTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerActive]);

  useEffect(() => {
    // Start timer when questions are loaded
    if (questions.length > 0 && !showResults) {
      setQuizTimer(0);
      setIsTimerActive(true);
    }
}, [questions, showResults]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: name === "num_questions" ? parseInt(value) : value,
    }));
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleTabChange = (value: string) => {
    setCurrentTab(value);
    setFormData((prev) => ({
      ...prev,
      text_content: "",
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setQuestions([]);
    setShowResults(false);
    setUserAnswers({});

    const API_URL =
      process.env.NEXT_PUBLIC_QUIZ_RENDER_URL || "http://localhost:3000/api";

    try {
      // Simulate API call for demonstration
      setTimeout(() => {
        const sampleQuestions = generateSampleQuestions(
          formData.num_questions,
          formData.quiz_level,
          formData.include_explanations
        );
        setQuestions(sampleQuestions);
        setIsLoading(false);
      }, 1500);

      const response = await fetch(`${API_URL}/generate-quiz`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Error generating quiz");
      }

      const data = await response.json();
      setQuestions(data.mcqs);
    } catch (error) {
      console.error("Error generating quiz:", error);
      toast.error("Quiz generation failed", {
        description:
          error instanceof Error ? error.message : "Please try again later",
      });
      setIsLoading(false);
    }
  };

  const generateSampleQuestions = (
    count: number,
    level: string,
    includeExplanations: boolean
  ): Question[] => {
    const questions: Question[] = [];
    const topic = currentTab === "content" ? "General Knowledge" : formData.text_content;

    for (let i = 0; i < count; i++) {
    const question: Question = {
        mcq: `Sample question ${i + 1} about ${topic} at ${level} difficulty level?`,
        options: {
          a: `Option A for question ${i + 1}`,
          b: `Option B for question ${i + 1}`,
          c: `Option C for question ${i + 1}`,
          d: `Option D for question ${i + 1}`,
        },
        correct: ["a", "b", "c", "d"][Math.floor(Math.random() * 4)],
      };

      if (includeExplanations) {
        question.explanation = `This is an explanation for question ${i + 1}. The correct answer is ${question.correct.toUpperCase()} because it accurately describes the concept being tested.`;
      }

      questions.push(question);
    }

    return questions;
  };

  const handleAnswerSelect = (questionIndex: number, answer: string) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionIndex]: answer,
    }));
  };

  const handleSubmitQuiz = () => {
    setIsTimerActive(false);
    let correctAnswers = 0;
    questions.forEach((question, index) => {
      if (userAnswers[index] === question.correct) {
        correctAnswers++;
      }
    });
    setScore(correctAnswers);
    setShowResults(true);

    const newHistoryEntry = {
      date: new Date().toLocaleDateString(),
      score: correctAnswers,
      total: questions.length,
      level: formData.quiz_level,
      topic:
        formData.text_content.substring(0, 20) +
        (formData.text_content.length > 20 ? "..." : ""),
    };

    setQuizHistory((prev) => [newHistoryEntry, ...prev.slice(0, 9)]);
  };

  const handleReset = () => {
    setQuestions([]);
    setUserAnswers({});
    setShowResults(false);
    setQuizTimer(0);
    setIsTimerActive(false);
  };

  const isQuizComplete =
    questions.length > 0 &&
    Object.keys(userAnswers).length === questions.length;
  const quizProgress =
    questions.length > 0
      ? Math.round((Object.keys(userAnswers).length / questions.length) * 100)
      : 0;

  const getScoreMessage = () => {
    const percentage = Math.round((score / questions.length) * 100);
    if (percentage >= 90) return "Excellent!";
    if (percentage >= 70) return "Good job!";
    if (percentage >= 50) return "Nice attempt!";
    return "Keep practicing!";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Head>
        <title>Quiz Generator</title>
      </Head>

      <div className="container mx-auto px-4 py-8">
        <main className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left Column: Quiz Options and History */}
          <div className="lg:col-span-2 space-y-8">
          <Card className="rounded-lg border-blue-100 shadow-md overflow-hidden p-0">
            <CardHeader className="bg-blue-600 text-white p-6">
              <CardTitle className="flex items-center">
                <BookOpen className="mr-2 h-6 w-6" />
                Create Your Quiz
              </CardTitle>
              <CardDescription className="text-blue-100/90">
                Generate MCQs in seconds from any text or topic
              </CardDescription>
              </CardHeader>
              <CardContent className="p-6 pt-0"> 
                <form onSubmit={handleSubmit}>
                  <Tabs
                    value={currentTab}
                    onValueChange={handleTabChange}
                    className="w-full mb-6"
                  >
                    <TabsList className="grid grid-cols-2 w-full">
                      <TabsTrigger value="content">From Content</TabsTrigger>
                      <TabsTrigger value="gate">GATE PYQs</TabsTrigger>
                    </TabsList>
                    <TabsContent value="content" className="mt-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="text_content"
                          className="flex items-center gap-1"
                        >
                          Paste your learning content
                          <Badge className="ml-1 text-xs" variant="secondary">
                            Required
                          </Badge>
                        </Label>
                        <Textarea
                          id="text_content"
                          name="text_content"
                          placeholder="Paste paragraphs, chapters, or lecture notes here..."
                          className="min-h-40 resize-none"
                          value={formData.text_content}
                          onChange={handleInputChange}
                          required
                        />
                        <div className="text-xs text-gray-500 flex justify-between">
                          <span>Min: 100 characters</span>
                          <span>{formData.text_content.length} characters</span>
                        </div>
                      </div>
                    </TabsContent>
                    <TabsContent value="gate" className="mt-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="gate_topic"
                          className="flex items-center gap-1"
                        >
                          Enter the GATE topic
                          <Badge className="ml-1 text-xs" variant="secondary">
                            Required
                          </Badge>
                        </Label>
                        <Input
                          id="text_content"
                          name="text_content"
                          placeholder="e.g., Data Structures, Operating Systems, Computer Networks"
                          value={formData.text_content}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </TabsContent>
                  </Tabs>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="space-y-2">
                      <Label htmlFor="num_questions">
                        Number of Questions
                      </Label>
                      <Select
                        value={formData.num_questions.toString()}
                        onValueChange={(value) =>
                          handleSelectChange("num_questions", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="5" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="3">3</SelectItem>
                          <SelectItem value="5">5</SelectItem>
                          <SelectItem value="7">7</SelectItem>
                          <SelectItem value="10">10</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="quiz_level">Difficulty Level</Label>
                      <Select
                        value={formData.quiz_level}
                        onValueChange={(value) =>
                          handleSelectChange("quiz_level", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Medium" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Easy">Easy</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="Hard">Hard</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center mb-6">
                    <input
                      type="checkbox"
                      id="include_explanations"
                      className="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={formData.include_explanations}
                      onChange={(e) =>
                        handleCheckboxChange("include_explanations", e.target.checked)
                      }
                    />
                    <Label
                      htmlFor="include_explanations"
                      className="text-sm text-gray-700"
                    >
                      Include explanations for correct answers
                    </Label>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={isLoading || !formData.text_content}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating Quiz...
                      </>
                    ) : (
                      <>
                        Generate Quiz
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {quizHistory.length > 0 && (
              <>
                <Card className="border-blue-100 shadow-md">
                  <CardHeader className="bg-gray-50 rounded-t-lg">
                    <CardTitle className="flex items-center text-gray-800">
                      <History className="mr-2 h-5 w-5" />
                      Quiz History
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {quizHistory.map((item, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center text-sm p-2 border-b last:border-0"
                        >
                          <div>
                            <div className="font-medium">{item.topic}</div>
                            <div className="text-gray-500">
                              {item.date} • {item.level}
                            </div>
                          </div>
                          <Badge
                            variant={
                              item.score / item.total >= 0.7 ? "default" : "secondary"
                            }
                          >
                            {item.score}/{item.total}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* New Graph Card for Quiz History */}
                <Card className="border-blue-100 shadow-md">
                  <CardHeader className="bg-blue-50 rounded-t-lg">
                    <CardTitle className="flex items-center text-gray-800">
                      <History className="mr-2 h-5 w-5" />
                      Quiz History Graph
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <QuizHistoryGraph quizHistory={quizHistory} />
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* Right Column: Quiz Questions & Results */}
          <div className="lg:col-span-3">
            {questions.length === 0 && !isLoading ? (
              <div className="flex flex-col items-center justify-center h-full p-12 text-center bg-white rounded-lg border border-blue-100 shadow-md">
                <Lightbulb className="h-12 w-12 text-blue-500 mb-4" />
                <h2 className="text-2xl font-bold text-blue-800 mb-2">
                  Ready to Generate Your Quiz?
                </h2>
                <p className="text-gray-600 mb-6 max-w-md">
                  Enter your content or choose a GATE topic, then select your
                preferences and click &quot;Generate Quiz&quot;
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-md">
                  <div className="flex flex-col items-center p-4 bg-blue-50 rounded-lg">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mb-2">
                      1
                    </div>
                    <p className="text-sm font-medium text-center">
                      Add Content
                    </p>
                  </div>
                  <div className="flex flex-col items-center p-4 bg-blue-50 rounded-lg">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mb-2">
                      2
                    </div>
                    <p className="text-sm font-medium text-center">
                      Set Options
                    </p>
                  </div>
                  <div className="flex flex-col items-center p-4 bg-blue-50 rounded-lg">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mb-2">
                      3
                    </div>
                    <p className="text-sm font-medium text-center">
                      Get Quiz
                    </p>
                  </div>
                </div>
              </div>
            ) : (
<Card className="rounded-lg border-blue-100 shadow-md overflow-hidden p-0">
<CardHeader className="bg-blue-600 text-white p-6">
<div className="flex justify-between items-center">
                    <CardTitle>Your Generated Quiz</CardTitle>
                    {isTimerActive && (
                      <Badge
                        variant="outline"
                        className="bg-white text-blue-800 flex items-center gap-1"
                      >
                        <Timer className="mr-1 h-3 w-3" />
                        {formatTime(quizTimer)}
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="text-blue-100">
                    {questions.length > 0
                      ? `${questions.length} questions, ${formData.quiz_level} difficulty`
                      : "Loading your quiz..."}
                  </CardDescription>
                  {questions.length > 0 && !showResults && (
                    <div className="mt-2">
                      <Progress value={quizProgress} className="h-2 bg-blue-300" />
                      <div className="flex justify-between text-xs mt-1">
                        <span>
                          {Object.keys(userAnswers).length} of {questions.length} answered
                        </span>
                        <span>{quizProgress}% complete</span>
                      </div>
                    </div>
                  )}
                </CardHeader>
                <CardContent className="pt-6">
                  {isLoading ? (
                    <div className="flex flex-col items-center justify-center p-12">
                      <Loader2 className="h-12 w-12 text-blue-500 animate-spin mb-4" />
                      <p className="text-gray-600">
                        Generating your quiz questions...
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        This may take a few moments
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      {questions.map((question, index) => (
                        <div
                          key={index}
                          className="border border-blue-100 rounded-lg p-4 transition-all hover:shadow-md"
                        >
                          <div className="flex gap-2 mb-4">
                            <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0">
                              {index + 1}
                            </div>
                            <p className="font-medium">{question.mcq}</p>
                          </div>
                          <RadioGroup
                            value={userAnswers[index] || ""}
                            onValueChange={(value) =>
                              handleAnswerSelect(index, value)
                            }
                            className="space-y-3"
                            disabled={showResults}
                          >
                            {Object.entries(question.options).map(([key, value]) => (
                              <div
                                key={key}
                                className={`flex items-center space-x-2 p-2 rounded-md ${
                                  showResults && question.correct === key
                                    ? "bg-green-50"
                                    : showResults &&
                                      userAnswers[index] === key &&
                                      userAnswers[index] !== question.correct
                                    ? "bg-red-50"
                                    : ""
                                }`}
                              >
                                <RadioGroupItem
                                  value={key}
                                  id={`q${index}-${key}`}
                                  className={
                                    showResults
                                      ? question.correct === key
                                        ? "border-green-500 text-green-500"
                                        : userAnswers[index] === key
                                        ? "border-red-500 text-red-500"
                                        : ""
                                      : ""
                                  }
                                />
                                <Label
                                  htmlFor={`q${index}-${key}`}
                                  className={`flex-grow ${
                                    showResults
                                      ? question.correct === key
                                        ? "text-green-600 font-medium"
                                        : userAnswers[index] === key
                                        ? "text-red-600"
                                        : ""
                                      : ""
                                  }`}
                                >
                                  <span className="font-semibold mr-2">
                                    {key.toUpperCase()}:
                                  </span>{" "}
                                  {value}
                                  {showResults && question.correct === key && (
                                    <CheckCircle className="inline-block ml-2 h-4 w-4 text-green-600" />
                                  )}
                                </Label>
                              </div>
                            ))}
                          </RadioGroup>
                          {showResults && userAnswers[index] !== question.correct && (
                            <div className="mt-2 flex items-start gap-2 text-sm text-red-600 bg-red-50 p-2 rounded">
                              <AlertCircle className="h-4 w-4 mt-0.5" />
                              <span>
                                Correct answer is{" "}
                                <strong>{question.correct.toUpperCase()}</strong>
                              </span>
                            </div>
                          )}
                          {showResults && question.explanation && (
                            <div className="mt-3 p-3 bg-blue-50 rounded-md text-sm">
                              <div className="font-medium text-blue-800 mb-1">
                                Explanation:
                              </div>
                              <p>{question.explanation}</p>
                            </div>
                          )}
                        </div>
                      ))}

                      {questions.length > 0 && !showResults && (
                        <Button
                          onClick={handleSubmitQuiz}
                          className="w-full mt-6 bg-blue-600 hover:bg-blue-700"
                          disabled={!isQuizComplete}
                        >
                          Submit Quiz
                        </Button>
                      )}

                      {showResults && (
                        <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg text-center">
                          <Award className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                          <h3 className="text-xl font-bold mb-1 text-blue-800">
                            Quiz Results
                          </h3>
                          <p className="text-sm text-blue-600 mb-4">
                            Completed in {formatTime(quizTimer)}
                          </p>
                          <div className="mb-4">
                            <div className="text-3xl font-bold text-blue-800">
                              {score} / {questions.length}
                            </div>
                            <div className="flex items-center justify-center gap-2">
                              <Progress
                                value={(score / questions.length) * 100}
                                className="h-2 w-32 bg-blue-200"
                              />
                              <span className="text-gray-600 text-sm">
                                {Math.round((score / questions.length) * 100)}%
                              </span>
                            </div>
                            <p className="text-blue-600 font-medium mt-2">
                              {getScoreMessage()}
                            </p>
                          </div>
                          <div className="flex gap-2 justify-center">
                            <Button
                              onClick={handleReset}
                              className="bg-white text-blue-600 border border-blue-200 hover:bg-blue-50"
                            >
                              <RotateCcw className="h-4 w-4 mr-1" />
                              Create New Quiz
                            </Button>
                            <Button className="bg-blue-600 hover:bg-blue-700">
                              <Save className="h-4 w-4 mr-1" />
                              Save Quiz
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
