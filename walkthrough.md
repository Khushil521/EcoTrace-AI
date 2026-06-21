# Walkthrough – EcoTrace-AI Sustainability Assistant

## Introduction

EcoTrace-AI is a Flask-based web application that helps users understand, monitor, and reduce their carbon footprint through intelligent sustainability recommendations and environmental insights.

The platform combines carbon footprint tracking, eco-habit monitoring, and a rule-based recommendation engine to provide personalized eco-friendly guidance. Users can interact with the system through a modern web interface and receive actionable suggestions for adopting sustainable habits and reducing environmental impact.

The application includes security guard rails, activity tracking, sustainability recommendations, and an interactive chat interface. The frontend is built using HTML, CSS, and JavaScript with a responsive glassmorphism-inspired design and interactive user experience.

---

## Problem Statement

Many individuals want to adopt environmentally responsible habits but lack awareness of how their daily activities impact the environment. Existing carbon footprint calculators often provide static information without personalized guidance or interactive support.

EcoTrace-AI addresses this challenge by providing:

* Carbon footprint awareness and tracking
* Personalized sustainability recommendations
* Interactive environmental assistance
* Eco-habit monitoring and encouragement
* An engaging conversational experience

By combining sustainability tracking with intelligent recommendations, EcoTrace-AI helps users make informed decisions that contribute to a greener future.

---

## What Was Implemented

### Eco Recommendation Engine

* Implemented a rule-based sustainability recommendation system.
* Generates environmental guidance based on user queries.
* Provides practical eco-friendly suggestions.
* Delivers educational information about sustainability and carbon footprints.

### In-Memory Data Management

Implemented storage for:

* Chat History
* Carbon Footprint Logs
* Active Eco Habits
* Security Logs

### Security Guard Rails

Created a validation layer that:

* Blocks unsafe or prohibited prompts
* Prevents excessively long requests
* Logs blocked messages for auditing purposes
* Maintains safe system interactions

### API Endpoints

#### POST /api/agent/chat

* Validates user input
* Processes environmental queries
* Returns sustainability-focused responses

#### GET /api/agent/security-logs

* Retrieves blocked request logs
* Supports security monitoring and auditing

#### Additional Endpoints

* Clear Chat functionality
* Agent status handling
* User interaction management

### Frontend Enhancements

Implemented:

* Chat bubbles
* Loading indicators
* Response latency display
* Glassmorphism user interface
* Smooth animations
* Custom scrollbars
* Responsive design

---

## Architecture

### System Architecture

User
↓
Web Application (HTML, CSS, JavaScript)
↓
Flask Backend
↓
Eco Recommendation Engine
↓
Carbon Footprint Calculator
↓
In-Memory Storage & Security Logs

### Component Overview

#### User

The user interacts with the platform through a modern web interface to ask environmental questions, track activities, and receive sustainability guidance.

#### Web Application

Built using:

* HTML5
* CSS3
* JavaScript

Responsibilities:

* User interaction
* Chat interface rendering
* Displaying recommendations
* Managing user experience

#### Flask Backend

Acts as the central controller responsible for:

* API handling
* Request validation
* Business logic
* Security enforcement
* Data processing

#### Eco Recommendation Engine

Responsibilities:

* Answer sustainability-related questions
* Provide eco-friendly recommendations
* Generate environmental insights
* Encourage sustainable habits

#### Carbon Footprint Calculator

Responsible for:

* Activity analysis
* Carbon footprint estimation
* Sustainability assessment

#### In-Memory Storage & Security Logs

Stores:

* Chat history
* Carbon footprint records
* Eco habit information
* Security logs

---

## Technologies Used

### Backend

* Python
* Flask

### Frontend

* HTML5
* CSS3
* JavaScript

### Sustainability Engine

* Rule-Based Recommendation Engine
* Carbon Footprint Calculator

### Configuration

* python-dotenv
* Environment Variables

### Deployment

* Docker
* Google Cloud Run

---

## Verification

The implementation was verified through the following checks:

* Flask server starts successfully
* Sustainability recommendation engine generates responses correctly
* Security logs record blocked messages
* Chat interface displays user and system messages properly
* Loading indicators function correctly
* Response latency is displayed accurately
* Responsive design works across different screen sizes

---

## Key Features

### Sustainability Assistant

* Provides sustainability guidance
* Answers environmental questions
* Encourages eco-friendly habits
* Delivers educational insights

### Carbon Footprint Tracking

* Tracks environmental impact
* Monitors user activities
* Encourages sustainable habits
* Promotes eco-friendly decision-making

### Security & Guard Rails

* Blocks unsafe prompts
* Validates incoming requests
* Logs suspicious activity
* Protects application integrity

### Modern User Experience

* Glassmorphism design
* Interactive chat interface
* Smooth animations
* Responsive layout
* Enhanced accessibility

---

## Future Improvements

Planned enhancements include:

* Persistent storage using MongoDB
* User authentication and profiles
* Advanced analytics and reporting
* Enhanced recommendation accuracy
* Real-time activity monitoring
* Unit and integration testing
* Cloud deployment with HTTPS

---

## Conclusion

EcoTrace-AI demonstrates how technology can be applied to sustainability challenges by combining carbon footprint awareness, environmental education, and intelligent recommendations into a single user-friendly platform.

The project empowers users to make environmentally conscious decisions while providing an engaging and educational experience.

**EcoTrace-AI – Track Today, Transform Tomorrow 🌱**
