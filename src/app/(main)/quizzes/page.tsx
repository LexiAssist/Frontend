'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useState } from 'react';
import { Icon } from '@/components/Icon';
import {
  Sparkles,
  FileText,
  Upload,
  ChevronRight,
  Target,
  Zap,
  BarChart3,
} from 'lucide-react';
import { toast } from 'sonner';

type QuestionType = 'multiple_choice' | 'true_false';

interface Question {
  id: string;
  type: QuestionType;
  question: string;
  options?: string[];
  correctAnswer: string | boolean;
  explanation?: string;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  timeLimit?: number;
}

interface QuizResult {
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeTaken: number;
}

const sampleQuestions: Question[] = [
  {
    id: '1',
    type: 'multiple_choice',
    question: 'What is the powerhouse of the cell?',
    options: ['Nucleus', 'Mitochondria', 'Ribosome', 'Endoplasmic Reticulum'],
    correctAnswer: 'Mitochondria',
    explanation: 'Mitochondria are often called the powerhouse of the cell because they generate most of the cell\'s supply of adenosine triphosphate (ATP).',
  },
  {
    id: '2',
    type: 'true_false',
    question: 'The Earth is the third planet from the Sun.',
    correctAnswer: true,
    explanation: 'Earth is indeed the third planet from the Sun, positioned between Venus and Mars.',
  },
  {
    id: '3',
    type: 'multiple_choice',
    question: 'What is the value of π (pi) to two decimal places?',
    options: ['3.12', '3.14', '3.16', '3.18'],
    correctAnswer: '3.14',
    explanation: 'Pi (π) is approximately equal to 3.14159..., so to two decimal places it is 3.14.',
  },
  {
    id: '4',
    type: 'multiple_choice',
    question: 'Who wrote "Romeo and Juliet"?',
    options: ['Charles Dickens', 'William Shakespeare', 'Jane Austen', 'Mark Twain'],
    correctAnswer: 'William Shakespeare',
    explanation: 'William Shakespeare wrote Romeo and Juliet around 1594-1596.',
  },
  {
    id: '5',
    type: 'true_false',
    question: 'Water boils at 90 degrees Celsius at sea level.',
    correctAnswer: false,
    explanation: 'Water boils at 100 degrees Celsius (212°F) at sea level.',
  },
];

export default function QuizzesPage() {
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | boolean | null>(null);
  const [answers, setAnswers] = useState<Record<string, string | boolean>>({});
  const [showResults, setShowResults] = useState(false);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [quizHistory, setQuizHistory] = useState<QuizResult[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [sourceText, setSourceText] = useState('');

  const startQuiz = () => {
    setCurrentQuiz({
      id: Date.now().toString(),
      title: 'General Knowledge Quiz',
      description: 'Test your knowledge across various subjects',
      questions: sampleQuestions,
      timeLimit: 10,
    });
    setCurrentQuestionIndex(0);
    setAnswers({});
    setShowResults(false);
    setSelectedAnswer(null);
  };

  const handleAnswer = (answer: string | boolean) => {
    setSelectedAnswer(answer);
    setAnswers((prev) => ({
      ...prev,
      [currentQuiz!.questions[currentQuestionIndex].id]: answer,
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < currentQuiz!.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      const nextQuestionId = currentQuiz!.questions[currentQuestionIndex + 1].id;
      setSelectedAnswer(answers[nextQuestionId] || null);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    if (!currentQuiz) return;

    let correct = 0;
    currentQuiz.questions.forEach((q) => {
      if (answers[q.id] === q.correctAnswer) {
        correct++;
      }
    });

    const result: QuizResult = {
      score: Math.round((correct / currentQuiz.questions.length) * 100),
      totalQuestions: currentQuiz.questions.length,
      correctAnswers: correct,
      timeTaken: 0,
    };

    setQuizResult(result);
    setQuizHistory((prev) => [result, ...prev].slice(0, 10));
    setShowResults(true);
    toast.success('Quiz completed!');
  };

  const handleGenerateQuiz = () => {
    if (!sourceText.trim()) {
      toast.error('Please enter some text to generate a quiz');
      return;
    }

    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      startQuiz();
      toast.success('Quiz generated from your text!');
    }, 1500);
  };

  const resetQuiz = () => {
    setCurrentQuiz(null);
    setShowResults(false);
    setQuizResult(null);
    setAnswers({});
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
  };

  const currentQuestion = currentQuiz?.questions[currentQuestionIndex];
  const isAnswered = selectedAnswer !== null;
  const isCorrect = currentQuestion && answers[currentQuestion.id] === currentQuestion.correctAnswer;

  if (showResults && quizResult) {
    return (
      <div className="space-y-4 max-w-2xl mx-auto">
        <Card className="text-center py-8 sm:py-12">
          <CardContent>
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 rounded-full bg-[#3c8350]/10 flex items-center justify-center">
              <Icon name="award" className="h-8 w-8 sm:h-10 sm:w-10 text-[#3c8350]" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
              {quizResult.score}%
            </h2>
            <p className="text-slate-600 mb-4 sm:mb-6">
              You got {quizResult.correctAnswers} out of {quizResult.totalQuestions} correct
            </p>
            <div className="flex justify-center gap-3">
              <Button
                variant="outline"
                onClick={resetQuiz}
                leftIcon={<Icon name="refresh" size={18} />}
              >
                Try Again
              </Button>
              <Button
                onClick={() => {
                  resetQuiz();
                  setSourceText('');
                }}
                leftIcon={<Sparkles size={18} />}
              >
                New Quiz
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Question Review" />
          <CardContent className="p-3 sm:p-4">
            <div className="space-y-3">
              {currentQuiz?.questions.map((q, idx) => {
                const userAnswer = answers[q.id];
                const correct = userAnswer === q.correctAnswer;
                return (
                  <div
                    key={q.id}
                    className={`p-3 sm:p-4 rounded-lg border ${
                      correct ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {correct ? (
                        <Icon name="check-circle" className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      ) : (
                        <Icon name="x" className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                      )}
                      <div className="min-w-0">
                        <p className="font-medium text-slate-900 text-sm">
                          {idx + 1}. {q.question}
                        </p>
                        <p className="text-sm mt-1">
                          <span className={correct ? 'text-green-700' : 'text-red-700'}>
                            Your answer: {String(userAnswer)}
                          </span>
                          {!correct && (
                            <span className="text-green-700 ml-3">
                              Correct: {String(q.correctAnswer)}
                            </span>
                          )}
                        </p>
                        {q.explanation && (
                          <p className="text-sm text-slate-600 mt-2">{q.explanation}</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (currentQuiz && currentQuestion) {
    return (
      <div className="space-y-4 max-w-2xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-700">
              Question {currentQuestionIndex + 1} of {currentQuiz.questions.length}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Icon name="clock" size={16} />
            <span>No time limit</span>
          </div>
        </div>

        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#3c8350] transition-all duration-300"
            style={{
              width: `${((currentQuestionIndex + 1) / currentQuiz.questions.length) * 100}%`,
            }}
          />
        </div>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="mb-4 sm:mb-6">
              <span className="inline-block px-2 py-1 text-xs font-medium bg-slate-100 text-slate-600 rounded mb-3">
                {currentQuestion.type === 'multiple_choice' ? 'Multiple Choice' : 'True/False'}
              </span>
              <h3 className="text-base sm:text-lg font-semibold text-slate-900">
                {currentQuestion.question}
              </h3>
            </div>

            <div className="space-y-2 sm:space-y-3">
              {currentQuestion.type === 'multiple_choice' ? (
                currentQuestion.options?.map((option) => (
                  <button
                    key={option}
                    onClick={() => handleAnswer(option)}
                    disabled={isAnswered}
                    className={`w-full p-3 sm:p-4 text-left rounded-lg border-2 transition-all ${
                      selectedAnswer === option
                        ? isCorrect
                          ? 'border-green-500 bg-green-50'
                          : 'border-red-500 bg-red-50'
                        : isAnswered && option === currentQuestion.correctAnswer
                        ? 'border-green-500 bg-green-50'
                        : 'border-slate-200 hover:border-[#3c8350] hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{option}</span>
                      {isAnswered && option === currentQuestion.correctAnswer && (
                        <Icon name="check-circle" className="h-5 w-5 text-green-600 flex-shrink-0" />
                      )}
                      {isAnswered && selectedAnswer === option && !isCorrect && (
                        <Icon name="x" className="h-5 w-5 text-red-600 flex-shrink-0" />
                      )}
                    </div>
                  </button>
                ))
              ) : (
                <div className="flex gap-3 sm:gap-4">
                  {[true, false].map((value) => (
                    <button
                      key={String(value)}
                      onClick={() => handleAnswer(value)}
                      disabled={isAnswered}
                      className={`flex-1 p-3 sm:p-4 text-center rounded-lg border-2 transition-all ${
                        selectedAnswer === value
                          ? isCorrect
                            ? 'border-green-500 bg-green-50'
                            : 'border-red-500 bg-red-50'
                          : isAnswered && value === currentQuestion.correctAnswer
                          ? 'border-green-500 bg-green-50'
                          : 'border-slate-200 hover:border-[#3c8350] hover:bg-slate-50'
                      }`}
                    >
                      <span className="font-medium text-sm">{value ? 'True' : 'False'}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {isAnswered && currentQuestion.explanation && (
              <div className={`mt-4 p-3 sm:p-4 rounded-lg ${isCorrect ? 'bg-green-50' : 'bg-red-50'}`}>
                <p className={`text-sm ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                  {isCorrect ? '✓ Correct! ' : '✗ Incorrect. '}
                  {currentQuestion.explanation}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button
            onClick={handleNext}
            disabled={!isAnswered}
            rightIcon={<ChevronRight size={18} />}
          >
            {currentQuestionIndex === currentQuiz.questions.length - 1
              ? 'Finish Quiz'
              : 'Next Question'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Quizzes</h1>
          <p className="mt-1 text-sm text-slate-600">
            Generate quizzes from your notes or take practice tests
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-3">
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 flex-shrink-0">
                <Icon name="award" className="h-5 w-5 text-purple-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-slate-600">Quizzes Taken</p>
                <p className="text-lg sm:text-xl font-bold text-slate-900">{quizHistory.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 flex-shrink-0">
                <Target className="h-5 w-5 text-green-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-slate-600">Avg. Score</p>
                <p className="text-lg sm:text-xl font-bold text-slate-900">
                  {quizHistory.length > 0
                    ? Math.round(
                        quizHistory.reduce((acc, r) => acc + r.score, 0) / quizHistory.length
                      )
                    : 0}
                  %
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-2 sm:col-span-1">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50 flex-shrink-0">
                <Zap className="h-5 w-5 text-orange-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-slate-600">Best Score</p>
                <p className="text-lg sm:text-xl font-bold text-slate-900">
                  {quizHistory.length > 0 ? Math.max(...quizHistory.map((r) => r.score)) : 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader
          title="Generate Custom Quiz"
          description="Paste your notes or upload a file to create a personalized quiz"
        />
        <CardContent className="p-4 sm:p-6 space-y-4">
          <textarea
            value={sourceText}
            onChange={(e) => setSourceText(e.target.value)}
            placeholder="Paste your notes, text, or study material here..."
            className="w-full h-24 sm:h-28 p-3 sm:p-4 text-sm text-slate-700 bg-slate-50 rounded-xl border border-slate-200 focus:border-[#3c8350] focus:ring-2 focus:ring-[#3c8350]/20 focus:outline-none resize-none"
          />
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-sm text-slate-500">
              {sourceText.length} characters
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                leftIcon={<Upload size={18} />}
                onClick={() => toast.info('File upload coming soon!')}
                className="text-sm"
              >
                <span className="hidden sm:inline">Upload File</span>
                <span className="sm:hidden">Upload</span>
              </Button>
              <Button
                onClick={handleGenerateQuiz}
                isLoading={isGenerating}
                leftIcon={<Sparkles size={18} />}
                disabled={!sourceText.trim()}
                className="text-sm"
              >
                {isGenerating ? 'Generating...' : 'Generate Quiz'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="Quick Practice" />
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#3c8350]/10 flex-shrink-0">
                <Icon name="brain" className="h-6 w-6 text-[#3c8350]" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">General Knowledge Quiz</h3>
                <p className="text-sm text-slate-500">{sampleQuestions.length} questions • Mixed topics</p>
              </div>
            </div>
            <Button onClick={startQuiz} rightIcon={<Icon name="arrow-right" size={18} />} className="text-sm">
              Start Quiz
            </Button>
          </div>
        </CardContent>
      </Card>

      {quizHistory.length > 0 && (
        <Card>
          <CardHeader title="Recent Attempts" />
          <CardContent className="p-3 sm:p-4">
            <div className="space-y-2 sm:space-y-3">
              {quizHistory.slice(0, 5).map((result, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <BarChart3 size={18} className="text-slate-400 flex-shrink-0" />
                    <span className="text-sm font-medium text-slate-700 truncate">
                      Quiz Attempt #{quizHistory.length - idx}
                    </span>
                  </div>
                  <span
                    className={`font-bold flex-shrink-0 ${
                      result.score >= 70
                        ? 'text-green-600'
                        : result.score >= 50
                        ? 'text-yellow-600'
                        : 'text-red-600'
                    }`}
                  >
                    {result.score}%
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
