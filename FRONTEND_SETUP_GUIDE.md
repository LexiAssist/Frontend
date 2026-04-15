# LexiAssist Frontend Setup & Integration Playbook

This document details the exact technical flow of how the Next.js frontend integrates with the LexiAssist microservices backend. It serves as the definitive guide for migrating from a "Mock/Dev" environment to a live Production integration.

## 1. Environment Variable Configuration

To force the frontend to communicate with the actual Go backend, the `lexi-assist/Frontend/.env.local` file must strictly enforce the Go API Gateway (Port `8080`) as the absolute source of truth for **all** incoming traffic, preventing bypass routes directly to the Python AI.

Create the `.env.local` file with the following configurations:

```env
# 1. Disable Mock Mode
NEXT_PUBLIC_USE_MOCK_API=false
NEXT_PUBLIC_MOCK_MODE=false

# 2. Point general RPC traffic to the Gateway
NEXT_PUBLIC_API_GATEWAY_URL=http://localhost:8080

# 3. Secure AI Proxy Routing
# Do NOT route to http://localhost:8000. 
# Route all AI commands to the API Gateway so it can perform JWT validation and rate-limiting 
# before privately proxying to the Python Orchestrator!
NEXT_PUBLIC_AI_PROXY_URL=http://localhost:8080
```

## 2. Secure Authentication Handshake

The frontend communicates with the backend exclusively via **Bearer RS256 JSON Web Tokens (JWT)**.

### The Interceptor Flow (`src/services/http.ts`)
1. **Initial Login**: The user authenticates at `/login`. The Node.js client receives an `access_token` (15 min lifespan) and a `refresh_token` (30 day lifespan).
2. **State Management**: The tokens are loaded into Zustand memory (`authStore.ts`).
3. **Interceptor Trap**: Every outgoing `axios` request runs through the request interceptor. If `isTokenExpired()` evaluates to true, the Axios client actively suspends the outgoing HTTP request.
4. **Silent Refresh**: Axios silently fires `/api/v1/auth/refresh` to the Go Gateway, rotates the token locally, injects the *new* valid token into the HTTP Headers, and seamlessly releases the suspended request without the user ever noticing.

## 3. The Proxy Architecture (Frontend → Go → Python)

Because the frontend exclusively targets `localhost:8080`, this is the lifecycle of a complex AI action (like generating a Quiz):

| System Level | Action | Responsibility |
|--------------|--------|----------------|
| **Frontend** | User clicks "Generate Quiz". Axios attaches Bearer JWT and sends `POST localhost:8080/api/v1/study/quiz` | UX / Data collection |
| **Go Gateway** | Examines the JWT header. Validates the RS256 signature against the Database's public key. Asserts rate limits via Redis. | Security & Traffic Control |
| **Go Reverse Proxy** | If valid, rewrites the request internally (Docker network) to the Python Evaluation Service (`localhost:5006`). | Routing |
| **Python Service** | Receives validated traffic, executes the deep learning algorithm/Gemini LLM prompt, and returns a JSON schema. | Model Execution |
| **Frontend** | Receives the structured data, strips the API envelope (`{ "data": { ... } }`), and populates React state. | Visualization |

## 4. Validating the Integration

To ensure the frontend is successfully bridged:
1. Ensure the Docker Compose backend stack is running (`curl http://localhost:8080/health`).
2. Run `npm run dev` in the `Frontend/` directory.
3. Access `http://localhost:3000/login`.
4. Submit valid credentials (e.g. `e2etest@example.com`).
5. Open the Browser Network Tab:
   - You should see an outbound call to `http://localhost:8080/api/v1/auth/login`.
   - The response must be a `HTTP 200` returning `access_token`.
   - The React router will then push you to the authenticated Dashboard.
