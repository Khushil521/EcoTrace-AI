# Walkthrough – AI Eco‑Agent Integration

## Introduction
This project is a **Flask‑based web application** that provides an eco‑friendly personal assistant powered by **Google Gemini**. Users can query carbon‑footprint data, receive sustainability tips, and interact with a set of predefined eco‑habits. The backend enforces guard‑rails, logs security‑related events, and gracefully falls back to a simulator when no Gemini API key is available. A modern, responsive UI built with HTML, CSS, and JavaScript displays chat interactions with rich styling and animations.

## What Was Implemented
- Added **Google Gemini** imports, environment loading via `python‑dotenv`, and model initialization.
- Implemented **in‑memory storage** for chat history, footprint logs, active habits, and security logs.
- Created a **guard‑rail** (`is_message_allowed`) to block disallowed phrases and excessively long messages.
- Provided a **simulated response** (`simulate_agent_response`) for environments without a Gemini API key.
- Exposed two new Flask endpoints:
  - `POST /api/agent/chat` – validates the user message, calls Gemini (or simulator), and returns `{ "response": "..." }`.
  - `GET /api/agent/security-logs` – returns an array of blocked‑message entries.
- Added a **clear‑chat** endpoint and a **security‑log** endpoint.
- Updated the front‑end (`public/index.html`, `public/style.css`, `public/app.js`) to render chat bubbles, display loading indicators, and show response latency.
- Integrated **glassmorphism UI**, custom scrollbars, and smooth animations for a premium look.

## How to Run the Application
1. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```
2. **Create a `.env` file** in the project root (`c:\\Users\\KHUSHI\\Music\\AIAgents\\Project`):
   ```text
   GEMINI_API_KEY=YOUR_GENERATIVE_AI_KEY_HERE
   ```
   - If you omit the key, the simulator will be used.
3. **Start the Flask server**:
   ```bash
   python app.py
   ```
   The server listens on port 8080 (or the `PORT` env variable).
4. **Open the UI** in a browser at `http://localhost:8080`.
5. **Test the API** (optional):
   ```bash
   curl -X POST http://localhost:8080/api/agent/chat \
        -H "Content-Type: application/json" \
        -d '{"message": "What is my carbon footprint?"}'
   curl http://localhost:8080/api/agent/security-logs
   ```
   - A blocked request (e.g., containing `ignore instructions`) returns a `400` with an error JSON.

## Verification
- The server starts without errors.
- The chat endpoint returns a JSON with a `response` field.
- The security‑log endpoint returns an array; after sending a blocked message you’ll see the logged entry.
- The UI shows user messages and formatted AI responses with avatars, timestamps, and loading states.

## Next Steps (Frontend)
- Hook the new endpoints into the **“Credentials & Agent”** tab UI (not part of this sprint).
- Persist `security_logs` to a file or database for long‑term audit.
- Add unit tests for the Flask routes and guard‑rail logic.
- Deploy to a cloud platform (e.g., Google Cloud Run) and configure HTTPS.

---

## Evaluation Alignment

### Category 1 – The Pitch 
- **Core Concept & Value**
  - Eco‑Trace AI Agent: a Flask‑based web assistant that helps users reduce their carbon footprint by providing personalized sustainability tips and habit tracking.
  - Uses **Google Gemini** as the reasoning engine, making the agent central to the solution.

- **Writeup ** – This walkthrough serves as the written submission, covering problem statement, solution, architecture, and development journey.

### Category 2 – The Implementation 

- **Technical Implementation**  
  - Structured Flask backend with clear separation of concerns (API routes, guard‑rails, simulation fallback).  
  - In‑memory stores for chat history, footprint logs, active habits, and security logs.  
  - Guard‑rail function `is_message_allowed` enforces policy and logs violations.  
  - Gemini integration with graceful fallback when API key is missing.  
  - Front‑end built with modern HTML/CSS (glassmorphism, custom scrollbars) and JavaScript to render chat bubbles, loading states, and latency metrics.  
  - Extensive comments throughout `app.py` explain design decisions and behavior.

- **Documentation**  
  - This `README.md` and `walkthrough.md` provide full project overview, setup instructions, architecture diagram placeholders, and next‑step roadmap.  
  - All code is free of hard‑coded credentials; environment variables are used for secrets.

---
*All changes are live in `app.py`. No further code modifications are required to run the backend.*

