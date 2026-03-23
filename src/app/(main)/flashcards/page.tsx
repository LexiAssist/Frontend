'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useState } from 'react';
import { Icon } from '@/components/Icon';
import {
  Shuffle,
  Save,
  Sparkles,
  BookOpen,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

interface Flashcard {
  id: string;
  front: string;
  back: string;
  category?: string;
}

interface StudySet {
  id: string;
  title: string;
  description: string;
  cards: Flashcard[];
  createdAt: Date;
}

const sampleCards: Flashcard[] = [
  {
    id: '1',
    front: 'What is photosynthesis?',
    back: 'The process by which plants convert light energy into chemical energy (glucose), using carbon dioxide and water, releasing oxygen as a byproduct.',
    category: 'Biology',
  },
  {
    id: '2',
    front: 'What is the Pythagorean theorem?',
    back: 'In a right-angled triangle, the square of the hypotenuse equals the sum of the squares of the other two sides: a² + b² = c²',
    category: 'Mathematics',
  },
  {
    id: '3',
    front: 'What is the capital of France?',
    back: 'Paris is the capital and most populous city of France.',
    category: 'Geography',
  },
  {
    id: '4',
    front: 'What is Newton\'s First Law?',
    back: 'An object at rest stays at rest and an object in motion stays in motion with the same speed and direction unless acted upon by an unbalanced force.',
    category: 'Physics',
  },
  {
    id: '5',
    front: 'What is mitosis?',
    back: 'A type of cell division that results in two daughter cells each having the same number and kind of chromosomes as the parent nucleus.',
    category: 'Biology',
  },
];

export default function FlashcardsPage() {
  const [cards, setCards] = useState<Flashcard[]>(sampleCards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [studySets, setStudySets] = useState<StudySet[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCardFront, setNewCardFront] = useState('');
  const [newCardBack, setNewCardBack] = useState('');

  const currentCard = cards[currentIndex];

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % cards.length);
  };

  const handlePrevious = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
  };

  const handleShuffle = () => {
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsShuffled(!isShuffled);
    toast.success(isShuffled ? 'Cards in order' : 'Cards shuffled');
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    if (isShuffled) {
      setCards(sampleCards);
      setIsShuffled(false);
    }
  };

  const handleAddCard = () => {
    if (!newCardFront.trim() || !newCardBack.trim()) {
      toast.error('Please fill in both sides');
      return;
    }

    const newCard: Flashcard = {
      id: Date.now().toString(),
      front: newCardFront,
      back: newCardBack,
    };

    setCards((prev) => [...prev, newCard]);
    setNewCardFront('');
    setNewCardBack('');
    setShowCreateModal(false);
    toast.success('Card added successfully');
  };

  const handleSaveSet = () => {
    const newSet: StudySet = {
      id: Date.now().toString(),
      title: 'My Study Set',
      description: `${cards.length} cards`,
      cards,
      createdAt: new Date(),
    };
    setStudySets((prev) => [newSet, ...prev]);
    toast.success('Study set saved');
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Flashcards</h1>
          <p className="mt-1 text-sm text-slate-600">
            Study with AI-generated flashcards
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCreateModal(true)}
            leftIcon={<Icon name="plus" size={16} />
          >
            Add Card
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSaveSet}
            leftIcon={<Icon name="save" size={16} />
          >
            Save Set
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-slate-500">
        <span>Card {currentIndex + 1} of {cards.length}</span>
        <div className="flex gap-2">
          <button
            onClick={handleShuffle}
            className={`p-2 rounded-lg transition-colors ${
              isShuffled ? 'bg-[#3c8350] text-white' : 'hover:bg-slate-100'
            }`}
            title="Shuffle"
          >
            <Shuffle size={18} />
          </button>
          <button
            onClick={handleReset}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
            title="Reset"
          >
            <Icon name="refresh" size={18} />
          </button>
        </div>
      </div>

      <div className="relative h-56 sm:h-72 lg:h-80" style={{ perspective: '1000px' }}>
        <div
          onClick={handleFlip}
          className={`relative w-full h-full cursor-pointer transition-transform duration-500 ${
            isFlipped ? '[transform:rotateY(180deg)]' : ''
          }`}
          style={{ transformStyle: 'preserve-3d' }}
        >
          <Card
            className={`absolute inset-0 hover:shadow-lg transition-shadow ${
              isFlipped ? 'opacity-0' : 'opacity-100'
            }`}
            style={{ backfaceVisibility: 'hidden' }}
          >
            <CardContent className="h-full flex flex-col items-center justify-center p-6 sm:p-8 text-center">
              <span className="text-xs font-medium text-[#3c8350] uppercase tracking-wider mb-3 sm:mb-4">
                {currentCard?.category || 'General'}
              </span>
              <h3 className="text-lg sm:text-xl font-semibold text-slate-900">
                {currentCard?.front}
              </h3>
              <p className="mt-3 sm:mt-4 text-sm text-slate-400">
                Click to flip
              </p>
            </CardContent>
          </Card>

          <Card
            className={`absolute inset-0 bg-[#3c8350] text-white hover:shadow-lg transition-shadow ${
              isFlipped ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ 
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            <CardContent className="h-full flex flex-col items-center justify-center p-6 sm:p-8 text-center">
              <h3 className="text-base sm:text-lg leading-relaxed">
                {currentCard?.back}
              </h3>
              <p className="mt-3 sm:mt-4 text-sm text-white/70">
                Click to flip back
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 sm:gap-4">
        <Button
          variant="outline"
          onClick={handlePrevious}
          leftIcon={<Icon name="chevron-left" size={18} />}
          className="text-sm"
        >
          <span className="hidden sm:inline">Previous</span>
        </Button>
        <Button
          onClick={handleFlip}
          leftIcon={<Icon name="refresh" size={18} />}
          className="text-sm"
        >
          Flip Card
        </Button>
        <Button
          variant="outline"
          onClick={handleNext}
          rightIcon={<Icon name="chevron-right" size={18} />}
          className="text-sm"
        >
          <span className="hidden sm:inline">Next</span>
        </Button>
      </div>

      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3">
        <Card className="cursor-pointer hover:shadow-md transition-all">
          <CardContent className="p-3 sm:p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 flex-shrink-0">
              <Sparkles className="h-5 w-5 text-blue-600" />
            </div>
            <div className="min-w-0">
              <p className="font-medium text-slate-900 text-sm">AI Generate</p>
              <p className="text-xs sm:text-sm text-slate-500">Create cards automatically</p>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-all">
          <CardContent className="p-3 sm:p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 flex-shrink-0">
              <Shuffle className="h-5 w-5 text-purple-600" />
            </div>
            <div className="min-w-0">
              <p className="font-medium text-slate-900 text-sm">Shuffle Mode</p>
              <p className="text-xs sm:text-sm text-slate-500">Randomize card order</p>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-all">
          <CardContent className="p-3 sm:p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 flex-shrink-0">
              <Icon name="layers" className="h-5 w-5 text-green-600" />
            </div>
            <div className="min-w-0">
              <p className="font-medium text-slate-900 text-sm">Study Sets</p>
              <p className="text-xs sm:text-sm text-slate-500">Organize your cards</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {studySets.length > 0 && (
        <Card>
          <CardHeader title="Your Study Sets" />
          <CardContent className="p-3 sm:p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              {studySets.map((set) => (
                <div
                  key={set.id}
                  className="p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div className="min-w-0">
                      <h4 className="font-medium text-slate-900 truncate">{set.title}</h4>
                      <p className="text-sm text-slate-500">{set.description}</p>
                    </div>
                    <BookOpen size={18} className="text-slate-400 flex-shrink-0 ml-2" />
                  </div>
                  <p className="text-xs text-slate-400 mt-2">
                    Created {new Date(set.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md mx-4">
            <CardHeader
              title="Create New Card"
              action={
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-1 hover:bg-slate-100 rounded"
                >
                  <X size={20} className="text-slate-500" />
                </button>
              }
            />
            <CardContent className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Front (Question)
                </label>
                <textarea
                  value={newCardFront}
                  onChange={(e) => setNewCardFront(e.target.value)}
                  placeholder="Enter the question..."
                  className="w-full p-3 text-sm border border-slate-200 rounded-lg focus:border-[#3c8350] focus:ring-2 focus:ring-[#3c8350]/20 focus:outline-none resize-none h-20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Back (Answer)
                </label>
                <textarea
                  value={newCardBack}
                  onChange={(e) => setNewCardBack(e.target.value)}
                  placeholder="Enter the answer..."
                  className="w-full p-3 text-sm border border-slate-200 rounded-lg focus:border-[#3c8350] focus:ring-2 focus:ring-[#3c8350]/20 focus:outline-none resize-none h-20"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleAddCard}
                  leftIcon={<Icon name="check" size={16} />}
                >
                  Add Card
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
