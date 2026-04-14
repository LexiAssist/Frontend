"use client";

import { useState, useRef, useCallback } from "react";
import { FileText, X, Upload, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { FeatureHeader } from '@/components/FeatureHeader';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';
import { useGenerateQuiz, useQuizzes } from '@/hooks/useQuizzes';
import { motion, AnimatePresence } from 'framer-motion';

// Quiz types based on backend
interface QuizQuestion {
  id: string;
  question_text: string;
  question_type: 'multiple_choice' | 'true_false' | 'short_answer';
  options?: Array<{ text: string; is_correct: boolean }>;
  correct_answer?: string;
  explanation?: string;
  points: number;
}

interface GeneratedQuiz {
  title: string;
  description: string;
  questions: QuizQuestion[];
  time_limit_minutes: number;
}

type ViewState = 'upload' | 'ready' | 'generated' | 'taking' | 'results' | 'textInput';

function Header() {
  return (
    <header className="flex items-center justify-between mb-10">
      <h1 className="text-[28px] font-bold tracking-tight text-[#1a1a1a]">
        Quizzes
      </h1>
      <FeatureHeader />
    </header>
  );
}

function HeroBanner() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-[#df7361] mb-10">
      {/* Grid Pattern Overlay */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(0,0,0,0.15) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0,0,0,0.15) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative z-10 flex items-center gap-8 px-6 sm:px-8 lg:px-10 py-8 lg:py-10">
        {/* Illustration */}
        <div className="hidden sm:block flex-shrink-0">
          <div className="relative h-[160px] w-[200px] lg:h-[200px] lg:w-[240px] p-2">
            <svg viewBox="0 0 200 180" fill="none" className="h-full w-full">
              <rect x="20" y="40" width="140" height="100" rx="8" fill="white" fillOpacity="0.9" />
              <rect x="35" y="55" width="100" height="8" rx="4" fill="#df7361" fillOpacity="0.3" />
              <rect x="35" y="70" width="80" height="6" rx="3" fill="#df7361" fillOpacity="0.2" />
              <rect x="35" y="82" width="90" height="6" rx="3" fill="#df7361" fillOpacity="0.2" />
              <rect x="35" y="94" width="70" height="6" rx="3" fill="#df7361" fillOpacity="0.2" />
              <circle cx="160" cy="50" r="18" fill="white" />
              <path d="M152 50L157 55L168 44" stroke="#df7361" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              <ellipse cx="100" cy="165" rx="35" ry="10" fill="rgba(0,0,0,0.1)" />
              <circle cx="100" cy="110" r="25" fill="#2d3748" />
              <path d="M75 140 Q100 120 125 140 L125 170 L75 170 Z" fill="#2d3748" />
              <rect x="60" y="130" width="80" height="50" rx="4" fill="white" />
              <rect x="65" y="135" width="70" height="35" rx="2" fill="#e2e8f0" />
            </svg>
          </div>
        </div>

        {/* Text Content */}
        <div className="flex-1 max-w-md">
          <h2 className="text-2xl lg:text-[32px] font-bold text-white">Quizzes</h2>
          <p className="mt-3 text-sm lg:text-[15px] leading-relaxed text-white/95">
            Upload a document or enter text and we&apos;ll automatically generate questions to test your understanding of the content.
          </p>
        </div>
      </div>
    </div>
  );
}

function UploadSection({ 
  onFileSelect, 
  onTextInput 
}: { 
  onFileSelect: () => void;
  onTextInput: () => void;
}) {
  return (
    <div className="space-y-4">
      <button
        onClick={onFileSelect}
        className="w-full p-8 border-2 border-dashed border-[#3f835b] rounded-xl bg-[#3f835b]/5 hover:bg-[#3f835b]/10 transition-colors flex flex-col items-center gap-4"
      >
        <div className="w-16 h-16 rounded-full bg-[#3f835b] flex items-center justify-center">
          <Upload className="w-8 h-8 text-white" />
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold text-[#1a1a1a]">Click to upload a document</p>
          <p className="text-sm text-gray-500 mt-1">PDF, DOC, TXT (max 25MB)</p>
        </div>
      </button>
      
      <div className="text-center">
        <span className="text-sm text-gray-500">or</span>
      </div>
      
      <button
        onClick={onTextInput}
        className="w-full py-4 px-6 rounded-xl border-2 border-[#3f835b] text-[#3f835b] font-semibold hover:bg-[#3f835b]/5 transition-colors"
      >
        Type or paste your content
      </button>
    </div>
  );
}

function DocumentCard({ 
  name, 
  onRemove, 
  onSubmit, 
  isLoading 
}: { 
  name: string; 
  onRemove: () => void;
  onSubmit: () => void;
  isLoading: boolean;
}) {
  return (
    <div className="max-w-md">
      <h3 className="mb-4 text-base font-medium text-[#6b6f6c]">
        Document uploaded
      </h3>

      <div className="flex items-center gap-4 rounded-2xl bg-[#f0f0f0] p-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#3f835b]">
          <FileText className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="truncate text-[15px] font-semibold text-[#1a1a1a]">
            {name}
          </p>
          <p className="text-sm text-[#888d89]">PDF</p>
        </div>
        <button 
          onClick={onRemove}
          className="rounded-full p-2 text-[#888d89] transition hover:bg-white hover:text-[#1a1a1a]"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <Button
        onClick={onSubmit}
        isLoading={isLoading}
        className="mt-4 w-full rounded-full bg-[#3f835b] py-3.5 text-[15px] font-bold text-white shadow-md transition hover:bg-[#367a52] active:scale-[0.98]"
      >
        Generate Quiz
      </Button>
    </div>
  );
}

function TextInputSection({ 
  onSubmit, 
  onCancel, 
  isLoading 
}: { 
  onSubmit: (text: string) => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  const [text, setText] = useState('');

  return (
    <div className="max-w-2xl">
      <h3 className="mb-4 text-base font-medium text-[#6b6f6c]">
        Enter your study material
      </h3>
      
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste your notes, textbook excerpt, or any study material here..."
        className="w-full h-64 p-4 rounded-xl border border-gray-200 focus:border-[#3f835b] focus:ring-2 focus:ring-[#3f835b]/20 outline-none resize-none"
      />
      
      <div className="flex gap-3 mt-4">
        <Button
          onClick={onCancel}
          variant="outline"
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          onClick={() => onSubmit(text)}
          isLoading={isLoading}
          disabled={!text.trim()}
          className="flex-1 bg-[#3f835b] hover:bg-[#367a52]"
        >
          Generate Quiz
        </Button>
      </div>
    </div>
  );
}

function QuizDisplay({ 
  quiz, 
  onStart 
}: { 
  quiz: GeneratedQuiz;
  onStart: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-gray-200 p-6 lg:p-8"
    >
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[#1a1a1a]">{quiz.title}</h2>
          <p className="text-gray-600 mt-1">{quiz.description}</p>
        </div>
        <div className="flex items-center gap-2 text-gray-500">
          <Clock className="w-5 h-5" />
          <span>{quiz.time_limit_minutes} min</span>
        </div>
      </div>

      <div className="space-y-4 mb-8">
        <div className="flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-[#3f835b]" />
          <span className="text-gray-700">{quiz.questions.length} questions</span>
        </div>
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-[#3f835b]" />
          <span className="text-gray-700">Multiple choice & true/false</span>
        </div>
      </div>

      <Button
        onClick={onStart}
        className="w-full bg-[#3f835b] hover:bg-[#367a52] py-4 text-lg font-semibold rounded-xl"
      >
        Start Quiz
      </Button>
    </motion.div>
  );
}

function QuizTaker({ 
  quiz, 
  onComplete, 
  onExit 
}: { 
  quiz: GeneratedQuiz;
  onComplete: (answers: Record<string, string>) => void;
  onExit: () => void;
}) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const question = quiz.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;

  const handleAnswer = () => {
    if (!selectedOption) return;
    
    setAnswers(prev => ({ ...prev, [question.id]: selectedOption }));
    
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedOption(null);
    } else {
      onComplete({ ...answers, [question.id]: selectedOption });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-2xl mx-auto"
    >
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-500">
            Question {currentQuestion + 1} of {quiz.questions.length}
          </span>
          <span className="text-sm text-gray-500">
            {Math.round(progress)}%
          </span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-[#3f835b] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 lg:p-8">
        <h3 className="text-xl font-semibold text-[#1a1a1a] mb-6">
          {question.question_text}
        </h3>

        {question.options && (
          <div className="space-y-3">
            {question.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedOption(option.text)}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                  selectedOption === option.text
                    ? 'border-[#3f835b] bg-[#3f835b]/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="font-medium">{String.fromCharCode(65 + idx)}.</span>{' '}
                {option.text}
              </button>
            ))}
          </div>
        )}

        {question.question_type === 'true_false' && (
          <div className="flex gap-4">
            {['True', 'False'].map((option) => (
              <button
                key={option}
                onClick={() => setSelectedOption(option)}
                className={`flex-1 p-4 rounded-xl border-2 font-semibold transition-all ${
                  selectedOption === option
                    ? 'border-[#3f835b] bg-[#3f835b]/5 text-[#3f835b]'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        )}

        <div className="flex gap-3 mt-8">
          <Button
            onClick={onExit}
            variant="outline"
            className="flex-1"
          >
            Exit
          </Button>
          <Button
            onClick={handleAnswer}
            disabled={!selectedOption}
            className="flex-1 bg-[#3f835b] hover:bg-[#367a52]"
          >
            {currentQuestion === quiz.questions.length - 1 ? 'Finish' : 'Next'}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

function QuizResults({ 
  quiz, 
  answers, 
  onRetry, 
  onNewQuiz 
}: { 
  quiz: GeneratedQuiz;
  answers: Record<string, string>;
  onRetry: () => void;
  onNewQuiz: () => void;
}) {
  let correctCount = 0;
  quiz.questions.forEach(q => {
    if (answers[q.id] === q.correct_answer) {
      correctCount++;
    }
  });

  const score = Math.round((correctCount / quiz.questions.length) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-2xl mx-auto text-center"
    >
      <div className="bg-white rounded-2xl border border-gray-200 p-8 lg:p-12">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#3f835b]/10 flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-[#3f835b]" />
        </div>
        
        <h2 className="text-3xl font-bold text-[#1a1a1a] mb-2">Quiz Complete!</h2>
        <p className="text-gray-600 mb-8">
          You scored {correctCount} out of {quiz.questions.length} correct
        </p>

        <div className="text-5xl font-bold text-[#3f835b] mb-8">
          {score}%
        </div>

        <div className="flex gap-4 justify-center">
          <Button
            onClick={onRetry}
            variant="outline"
          >
            Retry Quiz
          </Button>
          <Button
            onClick={onNewQuiz}
            className="bg-[#3f835b] hover:bg-[#367a52]"
          >
            New Quiz
          </Button>
        </div>
      </div>

      {/* Review answers */}
      <div className="mt-8 text-left">
        <h3 className="text-lg font-semibold mb-4">Review Answers</h3>
        <div className="space-y-4">
          {quiz.questions.map((q, idx) => {
            const isCorrect = answers[q.id] === q.correct_answer;
            return (
              <div 
                key={q.id}
                className={`p-4 rounded-xl border ${
                  isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  {isCorrect ? (
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  ) : (
                    <X className="w-5 h-5 text-red-600 mt-0.5" />
                  )}
                  <div>
                    <p className="font-medium">{idx + 1}. {q.question_text}</p>
                    <p className="text-sm mt-1">
                      Your answer: <span className={isCorrect ? 'text-green-600' : 'text-red-600'}>{answers[q.id]}</span>
                    </p>
                    {!isCorrect && (
                      <p className="text-sm text-green-600 mt-1">
                        Correct answer: {q.correct_answer}
                      </p>
                    )}
                    {q.explanation && (
                      <p className="text-sm text-gray-600 mt-2">{q.explanation}</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

export default function QuizzesPage() {
  const [viewState, setViewState] = useState<ViewState>('upload');
  const [uploadedFile, setUploadedFile] = useState<{ name: string; content: string } | null>(null);
  const [generatedQuiz, setGeneratedQuiz] = useState<GeneratedQuiz | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuthStore();
  const generateMutation = useGenerateQuiz();
  const { data: existingQuizzes } = useQuizzes(10, 0);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setUploadedFile({
        name: file.name.replace(/\.[^/.]+$/, ""),
        content: content,
      });
      setViewState('ready');
    };
    
    if (file.type === 'text/plain') {
      reader.readAsText(file);
    } else {
      // For other files, just use filename as prompt
      setUploadedFile({
        name: file.name.replace(/\.[^/.]+$/, ""),
        content: `Generate a quiz about: ${file.name}`,
      });
      setViewState('ready');
    }
    
    event.target.value = '';
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setViewState('upload');
  };

  const handleGenerate = async (content: string) => {
    if (!user?.id) {
      toast.error('Please log in to generate quizzes');
      return;
    }

    try {
      const result = await generateMutation.mutateAsync({
        content,
        userId: user.id,
      });

      // Parse the generated quiz
      const parsedQuiz = parseQuizFromAI(result.quiz);
      setGeneratedQuiz(parsedQuiz);
      setViewState('generated');
      
      toast.success('Quiz generated successfully!');
    } catch (error) {
      console.error('Quiz generation error:', error);
    }
  };

  const handleStartQuiz = () => {
    setQuizAnswers({});
    setViewState('taking');
  };

  const handleCompleteQuiz = (answers: Record<string, string>) => {
    setQuizAnswers(answers);
    setViewState('results');
  };

  const handleRetry = () => {
    setQuizAnswers({});
    setViewState('taking');
  };

  const handleNewQuiz = () => {
    setUploadedFile(null);
    setGeneratedQuiz(null);
    setQuizAnswers({});
    setViewState('upload');
  };

  return (
    <div className="max-w-4xl">
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept=".pdf,.doc,.docx,.txt"
        onChange={handleFileChange}
      />

      <Header />

      <AnimatePresence mode="wait">
        {viewState === 'upload' && (
          <motion.div
            key="upload"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <HeroBanner />
            <UploadSection 
              onFileSelect={handleFileSelect}
              onTextInput={() => setViewState('textInput')}
            />
            
            {/* Existing quizzes */}
            {existingQuizzes && existingQuizzes.length > 0 && (
              <div className="mt-12">
                <h3 className="text-lg font-semibold mb-4">Your Quizzes</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {existingQuizzes.map((quiz: any) => (
                    <div 
                      key={quiz.id}
                      className="p-4 rounded-xl border border-gray-200 hover:border-[#3f835b] transition-colors cursor-pointer"
                    >
                      <h4 className="font-semibold text-[#1a1a1a]">{quiz.title}</h4>
                      <p className="text-sm text-gray-500 mt-1">{quiz.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {viewState === 'textInput' && (
          <motion.div
            key="textInput"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <HeroBanner />
            <TextInputSection
              onSubmit={handleGenerate}
              onCancel={() => setViewState('upload')}
              isLoading={generateMutation.isPending}
            />
          </motion.div>
        )}

        {viewState === 'ready' && uploadedFile && (
          <motion.div
            key="ready"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <HeroBanner />
            <DocumentCard
              name={uploadedFile.name}
              onRemove={handleRemoveFile}
              onSubmit={() => handleGenerate(uploadedFile.content)}
              isLoading={generateMutation.isPending}
            />
          </motion.div>
        )}

        {viewState === 'generated' && generatedQuiz && (
          <motion.div
            key="generated"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <QuizDisplay
              quiz={generatedQuiz}
              onStart={handleStartQuiz}
            />
          </motion.div>
        )}

        {viewState === 'taking' && generatedQuiz && (
          <motion.div
            key="taking"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <QuizTaker
              quiz={generatedQuiz}
              onComplete={handleCompleteQuiz}
              onExit={() => setViewState('generated')}
            />
          </motion.div>
        )}

        {viewState === 'results' && generatedQuiz && (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <QuizResults
              quiz={generatedQuiz}
              answers={quizAnswers}
              onRetry={handleRetry}
              onNewQuiz={handleNewQuiz}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Helper function to parse AI-generated quiz
function parseQuizFromAI(aiResponse: string): GeneratedQuiz {
  // This is a simplified parser - in production, you'd want more robust parsing
  const lines = aiResponse.split('\n').filter(line => line.trim());
  
  const questions: QuizQuestion[] = [];
  let currentQuestion: Partial<QuizQuestion> = {};
  let options: Array<{ text: string; is_correct: boolean }> = [];
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // Detect question (starts with number or Q:)
    if (trimmed.match(/^\d+[:.)]/)) {
      if (currentQuestion.question_text) {
        if (options.length > 0) {
          currentQuestion.options = options;
        }
        questions.push(currentQuestion as QuizQuestion);
      }
      
      currentQuestion = {
        id: `q-${questions.length}`,
        question_text: trimmed.replace(/^\d+[:.)]\s*/, ''),
        question_type: 'multiple_choice',
        points: 10,
      };
      options = [];
    }
    // Detect options (A. B. C. D. or - bullet points)
    else if (trimmed.match(/^[A-D][.)]/i) || trimmed.match(/^[-•]/)) {
      const text = trimmed.replace(/^[A-D][.)]\s*/i, '').replace(/^[-•]\s*/, '');
      options.push({ text, is_correct: false });
    }
    // Detect correct answer
    else if (trimmed.match(/correct|answer/i) && !trimmed.match(/^\d+/)) {
      const answer = trimmed.replace(/.*correct.*:/i, '').replace(/.*answer.*:/i, '').trim();
      currentQuestion.correct_answer = answer;
      
      // Mark the correct option
      options.forEach(opt => {
        if (opt.text.toLowerCase().includes(answer.toLowerCase()) || 
            answer.toLowerCase().includes(opt.text.toLowerCase())) {
          opt.is_correct = true;
        }
      });
    }
  }
  
  // Don't forget the last question
  if (currentQuestion.question_text) {
    if (options.length > 0) {
      currentQuestion.options = options;
    }
    questions.push(currentQuestion as QuizQuestion);
  }
  
  // If we couldn't parse any questions, create a fallback
  if (questions.length === 0) {
    questions.push({
      id: 'q-0',
      question_text: 'Sample question based on the provided content',
      question_type: 'multiple_choice',
      options: [
        { text: 'Option A', is_correct: true },
        { text: 'Option B', is_correct: false },
        { text: 'Option C', is_correct: false },
      ],
      correct_answer: 'Option A',
      points: 10,
    });
  }

  return {
    title: 'Generated Quiz',
    description: 'AI-generated quiz based on your study material',
    questions,
    time_limit_minutes: Math.max(5, questions.length * 2),
  };
}
