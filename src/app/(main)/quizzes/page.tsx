'use client';

import Image from 'next/image';
import { useMemo, useState } from 'react';
import {
  CheckCircle2,
  Moon,
  RefreshCw,
  Settings,
} from 'lucide-react';

type QuizState = 'taking' | 'results' | 'review';

type QuizQuestion = {
  id: string;
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
};

const documentTitle = 'History of Hitler';

const quizQuestions: QuizQuestion[] = [
  {
    id: 'q1',
    questionText:
      'What political, economic, and social factors enabled Adolf Hitler to gain widespread support in Germany?',
    options: [
      'Hitler gained support due to political instability and economic hardship.',
      "Germany's success in World War I",
      'Strong international approval of German democracy',
      'Advances in space technology',
      'A booming tourism industry',
    ],
    correctAnswerIndex: 0,
  },
  {
    id: 'q2',
    questionText: 'What was the name of the failed coup attempt by Hitler and the Nazi Party in 1923?',
    options: [
      'The Beer Hall Putsch',
      'Operation Valkyrie',
      'Treaty of Munich',
      'The Berlin Spring',
      'The Weimar Revolt',
    ],
    correctAnswerIndex: 0,
  },
  {
    id: 'q3',
    questionText: 'Which book did Hitler write while imprisoned after the failed 1923 coup attempt?',
    options: [
      'The Third Reich',
      'Mein Kampf',
      'Das Kapital',
      'German Destiny',
      'The New Order',
    ],
    correctAnswerIndex: 1,
  },
];

function PageHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-between">
      <h1 className="text-[28px] font-semibold leading-[1.2] tracking-[-0.02em] text-[#272A28]">
        {title}
      </h1>
      <div className="flex items-center gap-4">
        <button
          type="button"
          className="rounded-full p-1.5 text-black transition hover:bg-slate-100"
          aria-label="Open settings"
        >
          <Settings className="h-7 w-7" />
        </button>
        <button
          type="button"
          className="rounded-full p-1.5 text-black transition hover:bg-slate-100"
          aria-label="Toggle dark mode"
        >
          <Moon className="h-7 w-7" />
        </button>
      </div>
    </div>
  );
}

function ResultArtwork({ passed }: { passed: boolean }) {
  return (
    <div className="relative h-[176px] w-[176px] overflow-hidden rounded-full shadow-sm">
      <Image
        src="/images/quizzes.jpg"
        alt="Quiz result illustration"
        fill
        className="object-cover"
      />
    </div>
  );
}

export default function QuizzesPage() {
  const [quizState, setQuizState] = useState<QuizState>('taking');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});

  const totalQuestions = quizQuestions.length;
  const activeQuestion = quizQuestions[currentQuestion];

  const score = useMemo(
    () =>
      quizQuestions.reduce((acc, question) => {
        return acc + (userAnswers[question.id] === question.correctAnswerIndex ? 1 : 0);
      }, 0),
    [userAnswers]
  );

  const passed = score / totalQuestions > 0.5;

  const selectAnswer = (optionIndex: number) => {
    setUserAnswers((current) => ({
      ...current,
      [activeQuestion.id]: optionIndex,
    }));
  };

  const goPrevious = () => {
    setCurrentQuestion((current) => Math.max(0, current - 1));
  };

  const goNext = () => {
    if (currentQuestion === totalQuestions - 1) {
      setQuizState('results');
      return;
    }

    setCurrentQuestion((current) => current + 1);
  };

  const resetQuiz = () => {
    setQuizState('taking');
    setCurrentQuestion(0);
    setUserAnswers({});
  };

  return (
    <div className="mx-auto w-full max-w-[1008px] pb-8 pt-8">
      <div className="space-y-10">
        <PageHeader
          title={quizState === 'review' ? `${documentTitle}: Answer Review` : 'Quizzes'}
        />

        {quizState === 'taking' ? (
          <div className="space-y-10">
            <div className="rounded-lg border border-[#e7e7e7] bg-white px-9 py-8 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
              <h2 className="text-[20px] font-semibold text-black">{documentTitle}</h2>

              <p className="pt-6 text-[16px] leading-[1.45] text-black">
                <span className="text-[var(--primary-500)]">
                  Question {currentQuestion + 1}/{totalQuestions}
                </span>{' '}
                {activeQuestion.questionText}
              </p>

              <div className="space-y-5 pt-6">
                {activeQuestion.options.map((option, optionIndex) => {
                  const selected = userAnswers[activeQuestion.id] === optionIndex;

                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => selectAnswer(optionIndex)}
                      className={[
                        'flex min-h-[48px] w-full items-center rounded-md border bg-white px-6 py-4 text-left text-[16px] leading-[1.3] text-black transition',
                        selected
                          ? 'border-[var(--primary-500)] ring-1 ring-[var(--primary-500)]'
                          : 'border-[#e9e9e9] hover:border-[#d9d9d9]',
                      ].join(' ')}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end gap-6">
              {currentQuestion > 0 ? (
                <button
                  type="button"
                  onClick={goPrevious}
                  className="inline-flex h-[42px] min-w-[98px] items-center justify-center rounded-full border border-[var(--primary-500)] bg-white px-7 text-[15px] font-semibold text-[var(--primary-500)] transition hover:bg-[var(--primary-50)]"
                >
                  Previous
                </button>
              ) : null}

              <button
                type="button"
                onClick={goNext}
                className="inline-flex h-[42px] min-w-[76px] items-center justify-center rounded-full bg-[var(--primary-500)] px-8 text-[15px] font-semibold text-white transition hover:bg-[var(--primary-600)]"
              >
                {currentQuestion === totalQuestions - 1 ? 'Submit' : 'Next'}
              </button>
            </div>
          </div>
        ) : null}

        {quizState === 'results' ? (
          <div className="flex min-h-[70vh] flex-col items-center justify-center text-center">
            <ResultArtwork passed={passed} />

            <h2 className="pt-8 text-[30px] font-bold tracking-tight text-[#272A28]">
              You Scored
            </h2>
            <p
              className={[
                'pt-2 text-[30px] font-semibold',
                passed ? 'text-[#16a34a]' : 'text-[#dc2626]',
              ].join(' ')}
            >
              {score}/{totalQuestions}
            </p>
            <p className="pt-2 text-[18px] font-semibold text-black">
              {passed ? 'Great Work!' : 'You can definitely do better!'}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-8">
              <button
                type="button"
                onClick={resetQuiz}
                className="inline-flex h-[44px] items-center justify-center gap-2 rounded-full border border-[var(--primary-500)] bg-white px-7 text-[15px] font-semibold text-[var(--primary-500)] transition hover:bg-[var(--primary-50)]"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Try Again</span>
              </button>
              <button
                type="button"
                onClick={() => setQuizState('review')}
                className="inline-flex h-[44px] items-center justify-center gap-2 rounded-full bg-[var(--primary-500)] px-7 text-[15px] font-semibold text-white transition hover:bg-[var(--primary-600)]"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Check Answers</span>
              </button>
            </div>
          </div>
        ) : null}

        {quizState === 'review' ? (
          <div className="max-h-[72vh] space-y-8 overflow-y-auto pr-2">
            {quizQuestions.map((question, questionIndex) => {
              const selectedAnswer = userAnswers[question.id];

              return (
                <div
                  key={question.id}
                  className="rounded-lg border border-[#e7e7e7] bg-white px-9 py-8 shadow-[0_1px_2px_rgba(15,23,42,0.03)]"
                >
                  <p className="text-[16px] leading-[1.45] text-black">
                    <span className="text-[var(--primary-500)]">
                      Question {questionIndex + 1}/{totalQuestions}
                    </span>{' '}
                    {question.questionText}
                  </p>

                  <div className="space-y-5 pt-6">
                    {question.options.map((option, optionIndex) => {
                      const isCorrect = optionIndex === question.correctAnswerIndex;
                      const isWrongSelection =
                        selectedAnswer === optionIndex &&
                        optionIndex !== question.correctAnswerIndex;

                      return (
                        <div
                          key={option}
                          className={[
                            'flex min-h-[48px] items-center rounded-md border px-6 py-4 text-[16px] leading-[1.3]',
                            isCorrect
                              ? 'border-[#16a34a] bg-[#16a34a] text-white'
                              : isWrongSelection
                                ? 'border-2 border-[#ef4444] bg-white text-black'
                                : 'border-[#e9e9e9] bg-white text-black',
                          ].join(' ')}
                        >
                          {option}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}
