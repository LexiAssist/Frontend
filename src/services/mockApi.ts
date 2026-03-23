// Mock API service for development without backend
import type { User, LoginCredentials, RegisterCredentials, AuthResponse } from '@/types';

const MOCK_DELAY = 500;

const mockUser: User = {
  id: '1',
  name: 'Test User',
  email: 'test@lexiassist.com',
  avatar: '',
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const isMockMode = (): boolean => {
  return process.env.NEXT_PUBLIC_MOCK_MODE === 'true';
};

export const mockAuthApi = {
  async login(credentials: LoginCredentials): Promise<{ data: AuthResponse }> {
    await delay(MOCK_DELAY);
    
    // Accept any credentials for development
    return {
      data: {
        user: {
          id: '1',
          name: credentials.email.split('@')[0],
          email: credentials.email,
          avatar: '',
        },
        token: 'mock-jwt-token',
      },
    };
  },

  async register(credentials: RegisterCredentials): Promise<{ data: AuthResponse }> {
    await delay(MOCK_DELAY);
    
    return {
      data: {
        user: {
          id: '2',
          name: credentials.name,
          email: credentials.email,
          avatar: '',
        },
        token: 'mock-jwt-token',
      },
    };
  },

  async logout(): Promise<void> {
    await delay(MOCK_DELAY);
  },

  async getCurrentUser(): Promise<{ data: User }> {
    await delay(MOCK_DELAY);
    
    // Simulate getting user from stored token
    return { data: mockUser };
  },
};

// Mock API for materials
export const mockMaterialsApi = {
  async getMaterials() {
    await delay(MOCK_DELAY);
    return {
      data: [
        { id: '1', title: 'Sample Document.pdf', type: 'pdf', createdAt: new Date().toISOString() },
      ],
    };
  },
};

// Mock API for flashcards
export const mockFlashcardsApi = {
  async getFlashcards() {
    await delay(MOCK_DELAY);
    return {
      data: [
        { id: '1', front: 'What is photosynthesis?', back: 'The process by which plants convert light energy into chemical energy.', deckId: '1' },
      ],
    };
  },
};
