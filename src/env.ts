import { z } from 'zod';

// Check if we're in mock mode (frontend-only development)
export const isMockMode = 
  process.env.NEXT_PUBLIC_USE_MOCK_API === 'true' || 
  process.env.NEXT_PUBLIC_MOCK_MODE === 'true';

// Schema for required environment variables
const envSchema = z.object({
  NEXT_PUBLIC_API_GATEWAY_URL: z.string().url(),
  NEXT_PUBLIC_AI_PROXY_URL: z.string().url(),
});

// Default values for development/mock mode
const defaultEnv = {
  NEXT_PUBLIC_API_GATEWAY_URL: process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:8080',
  NEXT_PUBLIC_AI_PROXY_URL: process.env.NEXT_PUBLIC_AI_PROXY_URL || 'http://localhost:8000',
};

// Parse and validate environment variables
// In mock mode, use defaults if not provided
export const env = isMockMode 
  ? defaultEnv 
  : envSchema.parse({
      NEXT_PUBLIC_API_GATEWAY_URL: process.env.NEXT_PUBLIC_API_GATEWAY_URL,
      NEXT_PUBLIC_AI_PROXY_URL: process.env.NEXT_PUBLIC_AI_PROXY_URL,
    });

// Export mock mode flag for use in other modules
export { isMockMode as USE_MOCK };
