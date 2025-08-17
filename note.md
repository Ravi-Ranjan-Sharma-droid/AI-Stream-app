## Minimum full stack AI application with stream in NEXTJS -- Chai aur Code

### AI App
- A full stack AI application typically consists of a frontend, backend, and AI components.
#### Frontend
- Sends requests(fetch req, axios req) to backend and receives responses from backend
  - Layout
  - Components
  - Pages

#### Backend
- Handles database interactions and business logic
  - Machine Learning / AI
  - Database
- API routes
#### Ai
- use ollama, openai, huggingface
- they give (Key + SDK)

> **Note:** If key is gone to frontend, it can be exposed. Keep it secret! Use environment variables to store keys securely.

#### Next.js provides a way to manage environment variables using a `.env.local` file. This file should not be committed to version control and can be used to store sensitive information like API keys.

Next.js gives a folder structure for the project, including a `pages` directory for the frontend and an `api` directory for the backend.

api folder structure:
- `pages/api` - This is where you define your API routes.
- Each file in this directory corresponds to an API endpoint.
- `route.js` - This file defines the API route for the application.

#### Next.js responsibilities:
- Server-side rendering
- Static site generation
- API routes
- File-based routing
