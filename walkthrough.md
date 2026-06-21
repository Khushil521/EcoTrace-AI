# Walkthrough – AI Eco-Agent Integration

## Introduction

EcoTrace-AI is a Flask-based web application that helps users understand, track, and reduce their carbon footprint through AI-powered conversations and sustainability recommendations. The application combines Google Gemini AI with carbon footprint tracking to provide personalized eco-friendly guidance and promote sustainable living habits.

The platform includes security guard rails, activity tracking, sustainability recommendations, and an intelligent chat interface. To ensure reliability, the system gracefully falls back to a simulator when a Gemini API key is unavailable. The application features a modern responsive interface built using HTML, CSS, and JavaScript with glassmorphism styling and interactive animations.

---

## Problem Statement

Many individuals want to adopt environmentally responsible habits but lack awareness of how their daily activities impact the environment. Existing carbon footprint calculators often provide static information without personalized guidance or interactive support.

EcoTrace-AI addresses this challenge by providing:

* Carbon footprint awareness and tracking.
* Personalized sustainability recommendations.
* AI-powered environmental assistance.
* Eco-habit monitoring and encouragement.
* An interactive conversational experience.

By combining AI with sustainability tracking, EcoTrace-AI helps users make informed decisions that contribute to a greener future.

---

## What Was Implemented

### Google Gemini Integration

* Integrated Google Gemini AI for intelligent conversational responses.
* Configured environment variable support using python-dotenv.
* Added automatic fallback simulation when Gemini API credentials are unavailable.

### In-Memory Data Management

Implemented storage for:

* Chat History
* Carbon Footprint Logs
* Active Eco Habits
* Security Logs

### Security Guard Rails

Created a validation layer that:

* Blocks unsafe or prohibited prompts.
* Prevents excessively long requests.
* Logs blocked messages for auditing purposes.
* Maintains safe AI interactions.

### API Endpoints

Implemented the following endpoints:

#### POST /api/agent/chat

* Validates user input.
* Processes requests using Gemini AI.
* Returns AI-generated sustainability responses.

#### GET /api/agent/security-logs

* Retrieves blocked request logs.
* Supports security monitoring and auditing.

#### Additional Endpoints

* Clear Chat functionality.
* Agent status handling.
* User interaction management.

### Frontend Enhancements

Implemented:

* Chat bubbles.
* Loading indicators.
* Response latency display.
* Glassmorphism user interface.
* Smooth animations.
* Custom scrollbars.
* Responsive design.

---

## Architecture

### System Architecture

```text
User
  ↓
Frontend (HTML, CSS, JavaScript)
  ↓
Flask Backend
  ↓
AI Eco Agent
(Google Gemini AI + Simulator Fallback)
  ↓
Carbon Footprint Calculator
  ↓
Data Storage & Security Logs
```

### Component Overview

#### User

The user interacts with the platform through a modern web interface to ask environmental questions, track habits, and receive sustainability guidance.

#### Frontend

Built using:

* HTML5
* CSS3
* JavaScript

Responsibilities:

* User interaction.
* Chat interface rendering.
* Displaying recommendations.
* Managing user experience.

#### Flask Backend

Acts as the central controller responsible for:

* API handling.
* Request validation.
* Business logic.
* Communication with Gemini AI.
* Security enforcement.

#### AI Eco Agent

Powered by Google Gemini AI.

Responsibilities:

* Answer sustainability questions.
* Provide eco-friendly recommendations.
* Generate conversational responses.
* Educate users about environmental impact.

When Gemini credentials are unavailable, the application switches to simulator mode to maintain functionality.

#### Carbon Footprint Calculator

Responsible for:

* Activity analysis.
* Carbon footprint estimation.
* Sustainability assessment.

#### Data Storage & Security Logs

Stores:

* Chat history.
* Carbon footprint records.
* Eco habit information.
* Security logs.

---

## Technologies Used

### Backend

* Python
* Flask

### Artificial Intelligence

* Google Gemini AI
* Simulator Fallback Engine

### Frontend

* HTML5
* CSS3
* JavaScript

### Configuration

* python-dotenv
* Environment Variables

### Deployment

* Docker
* Google Cloud Run

---

## How to Run the Application

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Configure Environment Variables

Create a `.env` file in the project root:

```text
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
```

If no API key is provided, the application automatically uses the built-in simulator.

### 3. Start the Application

```bash
python app.py
```

The application runs on:

```text
http://localhost:8080
```

### 4. Open the Application

Visit:

```text
http://localhost:8080
```

### 5. Test the API

```bash
curl -X POST http://localhost:8080/api/agent/chat \
-H "Content-Type: application/json" \
-d '{"message":"What is my carbon footprint?"}'
```

```bash
curl http://localhost:8080/api/agent/security-logs
```

---

## Verification

The implementation was verified through the following checks:

* Flask server starts successfully.
* Gemini AI generates responses correctly.
* Simulator fallback works when API credentials are unavailable.
* Security logs record blocked messages.
* Chat interface displays user and AI messages properly.
* Loading indicators function correctly.
* Response latency is displayed accurately.
* Responsive design works across different screen sizes.

---

## Key Features

### AI Eco Agent

* Powered by Google Gemini AI.
* Provides sustainability guidance.
* Answers environmental questions.
* Supports natural language interactions.

### Carbon Footprint Tracking

* Tracks environmental impact.
* Monitors user activities.
* Encourages sustainable habits.
* Promotes eco-friendly decision-making.

### Security & Guard Rails

* Blocks unsafe prompts.
* Validates incoming requests.
* Logs suspicious activity.
* Protects application integrity.

### Modern User Experience

* Glassmorphism design.
* Interactive chat interface.
* Smooth animations.
* Responsive layout.
* Enhanced accessibility.

---

## Future Improvements

Planned enhancements include:

* Integration with the Credentials & Agent dashboard.
* Persistent storage using MongoDB.
* Advanced analytics and reporting.
* Enhanced recommendation accuracy.
* User authentication and profiles.
* Unit and integration testing.
* Cloud deployment with HTTPS.
* Real-time activity monitoring.

---

# Evaluation Alignment

## Category 1 – The Pitch

### Core Concept & Value

EcoTrace-AI is an intelligent sustainability assistant that helps users understand, monitor, and reduce their carbon footprint through AI-powered conversations, personalized recommendations, and eco-habit tracking.

### Why AI?

Google Gemini AI enables natural language conversations, allowing users to ask sustainability-related questions and receive meaningful, context-aware environmental guidance.

### Problem Statement

Many people are interested in sustainable living but lack the tools and knowledge required to understand their environmental impact. EcoTrace-AI bridges this gap through education, activity tracking, and AI-powered recommendations.

### Why Agents?

The AI Eco Agent acts as an intelligent assistant that continuously helps users:

* Understand sustainability concepts.
* Analyze environmental impact.
* Receive personalized recommendations.
* Build better eco-friendly habits.

This makes the agent a central component of the overall solution.

---

## Category 2 – The Implementation

### Technical Implementation

The solution includes:

* Flask-based backend architecture.
* Google Gemini AI integration.
* Simulator fallback mechanism.
* Security guard rails.
* Carbon footprint tracking system.
* Sustainability recommendation engine.
* Responsive frontend interface.
* Environment-based configuration management.
* Docker-ready deployment support.

### Documentation

The project documentation includes:

* Project overview.
* Problem statement.
* Architecture explanation.
* Setup instructions.
* API documentation.
* Security considerations.
* Future roadmap.

All sensitive credentials are managed securely through environment variables, ensuring no secrets are hard-coded within the source code.

---

## Conclusion

EcoTrace-AI demonstrates how artificial intelligence can be applied to sustainability challenges by combining conversational AI, carbon footprint awareness, and habit tracking into a single user-friendly platform. The project empowers users to make environmentally conscious decisions while providing an engaging and educational experience.

**EcoTrace-AI – Track Today, Transform Tomorrow**
