# Updated Eco AI Assistant with Graph Workflow Engine

import os
# Reminder: store your Gemini API key in a .env file (GEMINI_API_KEY=your_key). The key is loaded at runtime via python-dotenv and never hard‑coded.

import re
from flask import Flask, jsonify, request, send_from_directory, Blueprint
import subprocess
from dotenv import load_dotenv
load_dotenv()
from prometheus_flask_exporter import PrometheusMetrics

# In-memory storage
chat_history: list[dict] = []  # each entry: {"role": "user"|"assistant", "content": str}
footprint_logs = []
active_user_habits = []
security_logs = []
# Initialize aentigrity CLI wrapper (no external API key needed)

def run_aentigrity(prompt: str) -> str:
    """Invoke the aentigrity CLI to get a response for the given prompt."""
    try:
        result = subprocess.run(
            ["aentigrity", "run", "--prompt", prompt],
            capture_output=True,
            text=True,
            timeout=10,
        )
        if result.returncode == 0:
            return result.stdout.strip()
        else:
            print("aentigrity CLI error:", result.stderr)
            return simulate_agent_response(prompt)
    except Exception as e:
        print("aentigrity invocation exception:", e)
        return simulate_agent_response(prompt)

# Removed Gemini API configuration and model listing – aentigrity CLI is used instead.
# genai.configure(api_key=os.getenv('GEMINI_API_KEY'))
# # Removed Gemini model listing – using aentigrity CLI for LLM calls


# Removed genai model listing – no Gemini API used
print("========================\n")
# Eco habits data (unchanged)
ECO_HABITS = [
    {
        "id": "meatless_monday",
        "name": "Meatless Mondays",
        "category": "Food",
        "description": "Avoid meat once a week to lower agricultural impact.",
        "co2Savings": 400,
        "icon": "utensils"
    },
    {
        "id": "led_upgrade",
        "name": "Upgrade to LED Bulbs",
        "category": "Energy",
        "description": "Replace incandescent lighting with energy-efficient LEDs.",
        "co2Savings": 150,
        "icon": "lightbulb"
    },
    {
        "id": "bike_commute",
        "name": "Bike/Walk to Work",
        "category": "Transportation",
        "description": "Walk or bike instead of driving for your daily commute.",
        "co2Savings": 900,
        "icon": "bike"
    },
    {
        "id": "cold_wash",
        "name": "Wash Laundry in Cold Water",
        "category": "Energy",
        "description": "Use cold water cycles for washing clothes.",
        "co2Savings": 75,
        "icon": "droplets"
    },
    {
        "id": "smart_thermostat",
        "name": "Install Smart Thermostat",
        "category": "Energy",
        "description": "Automate heating and cooling to reduce wasted energy.",
        "co2Savings": 320,
        "icon": "thermometer"
    },
    {
        "id": "composting",
        "name": "Compost Organic Waste",
        "category": "Waste",
        "description": "Divert organic waste from landfills to reduce methane.",
        "co2Savings": 120,
        "icon": "leaf"
    },
    {
        "id": "reduce_flights",
        "name": "One Less Short-Haul Flight",
        "category": "Transportation",
        "description": "Substitute one short-haul flight with train travel or video call.",
        "co2Savings": 180,
        "icon": "plane"
    },
    {
        "id": "line_dry",
        "name": "Line Dry Clothes",
        "category": "Energy",
        "description": "Air dry clothes instead of using a high-energy clothes dryer.",
        "co2Savings": 200,
        "icon": "wind"
    }
]

# Helper functions for Gemini tools (unchanged)
def get_eco_habits():
    """Return the list of eco habits."""
    return ECO_HABITS

def get_footprint_data():
    """Return the latest footprint entry or empty dict."""
    return footprint_logs[-1] if footprint_logs else {}

def get_historical_logs():
    """Return all footprint logs."""
    return footprint_logs

def generate_json_plan(selectedHabits, targetCO2):
    """Create a simple JSON plan based on selected habits and target CO2 reduction."""
    savings = sum(h["co2Savings"] for h in ECO_HABITS if h["id"] in selectedHabits)
    return {
        "selectedHabits": selectedHabits,
        "targetCO2": targetCO2,
        "estimatedSavingsKgCO2": savings,
        "timestamp": time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())
    }

# Flask app setup
app = Flask(__name__, static_folder='public', static_url_path='')
metrics = PrometheusMetrics(app)

# Load environment variables
load_dotenv()

# Gemini model initialization (unchanged)
model = None  # Force simulator; no Gemini API key used

# Guard‑rail configuration
DISALLOWED_PHRASES = [
    "ignore instructions",
    "system override",
    "developer mode",
    "<script>",
    "</script>"
]

def is_message_allowed(msg: str) -> bool:
    lowered = msg.lower()
    for phrase in DISALLOWED_PHRASES:
        if phrase in lowered:
            return False
    if len(msg) > 1000:
        return False
    return True

# Simple simulation when Gemini is unavailable
def simulate_agent_response(user_msg):
    # Simple rule‑based mock with added calculation explanation and environmental topics
    lowered = user_msg.lower()
    if "footprint" in lowered:
        return "Your current carbon footprint is calculated from your latest data."
    # Handle variations of "latest data" including common typo "lates"
    if "calculate" in lowered or "latest data" in lowered or "lates data" in lowered:
        return "The latest carbon‑footprint data is computed from the most recent entry you submitted via the /api/footprint endpoint. It aggregates the values for energy, transportation, food, and waste, sums them, and reports the totalCO2 field as the footprint in kilograms of CO₂ equivalent."
    if "air pollution" in lowered:
        return "Air pollution refers to the presence of harmful substances in the atmosphere, such as particulate matter (PM2.5, PM10), nitrogen oxides, sulfur oxides, carbon monoxide, ozone, and volatile organic compounds. These pollutants can cause respiratory problems, cardiovascular disease, and contribute to climate change. Reducing emissions from vehicles, industry, and burning fossil fuels helps improve air quality."
    if "protect" in lowered and "environment" in lowered:
        return "You can protect the environment by reducing energy use, opting for public transport or cycling, minimizing waste, recycling, conserving water, supporting renewable energy, and choosing sustainable products. Small daily habits add up to big impact."
    if "habit" in lowered:
        return "Here are some eco‑habits you can adopt: " + ", ".join([h["name"] for h in ECO_HABITS])
    return "I’m here to help with your eco‑tracking. Ask me about footprints or habits!"

# ---------- Graph Workflow Engine ----------
class GraphWorkflowEngine:
    """A lightweight graph‑based workflow for routing user messages.

    Nodes:
    1. pre_screen – redacts PII / blocks injection.
    2. llm – calls Gemini (or simulation).
    3. post_process – placeholder for future tool routing.
    """
    def __init__(self):
        # Pre‑screen regex can be configured via env; default simple email/phone patterns
        self.redaction_regex = os.getenv('PII_REDACTION_REGEX') or r"(?:[\w.+-]+@[\w.-]+\.[a-zA-Z]{2,})|(?:\+?\d{1,3}[\s-]?\d{3}[\s-]?\d{3,4})"
        self.redaction_placeholder = "[REDACTED]"

    def pre_screen(self, message: str) -> tuple[str, bool]:
        """Redact PII and detect injection patterns.
        Returns cleaned_message and a flag indicating whether the message was blocked.
        """
        # Block disallowed phrases first
        if not is_message_allowed(message):
            return "", True
        # Redact PII using regex
        cleaned = re.sub(self.redaction_regex, self.redaction_placeholder, message)
        return cleaned, False

    def llm_call(self, cleaned_message: str) -> str:
        if not cleaned_message:
            return "Message blocked by security guardrails."
        if model:
            prompt = f"""
            You are EcoTrace AI Assistant.
            Answer questions about carbon footprint, sustainability, and eco‑friendly lifestyle.
            User Question: {cleaned_message}
            """
            try:
                response = model.generate_content(prompt)
                return getattr(response, "text", "I could not generate a response.")
            except Exception as e:
                return f"Gemini Error: {str(e)}"
        else:
            # Use aentigrity CLI as backend
            return simulate_agent_response(cleaned_message)

    def handle_message(self, user_msg: str) -> dict:
        cleaned, blocked = self.pre_screen(user_msg)
        if blocked:
            reply = "Message blocked by security guardrails."
            flagged = True
        else:
            reply = self.llm_call(cleaned)
            flagged = False
        # Store history
        chat_history.append({"role": "user", "content": user_msg})
        chat_history.append({"role": "assistant", "content": reply})
        return {"response": reply, "flagged": flagged}

# Instantiate the engine
workflow_engine = GraphWorkflowEngine()

# ---------- HITL Blueprint ----------
hitl_bp = Blueprint('hitl', __name__)

# In‑memory queue for flagged messages
hitl_queue: list[dict] = []

@hitl_bp.route('/api/hitl/queue', methods=['GET'])
def get_hitl_queue():
    return jsonify(hitl_queue)

@hitl_bp.route('/api/hitl/resolve', methods=['POST'])
def resolve_hitl():
    data = request.get_json() or {}
    msg_id = data.get('id')
    decision = data.get('decision')  # "allow" or "block"
    for item in hitl_queue:
        if item.get('id') == msg_id:
            item['resolution'] = decision
            item['resolved_at'] = time.time()
            break
    return jsonify({"message": "Resolution recorded"})

app.register_blueprint(hitl_bp)

# ---------- Routes ----------
@app.route('/')
def index():
    return app.send_static_file('index.html')

# Existing habit APIs (unchanged)
@app.route('/api/habits', methods=['GET'])
def get_habits():
    return jsonify(ECO_HABITS)

@app.route('/api/habits', methods=['POST'])
def sync_habits():
    data = request.get_json() or {}
    global active_user_habits
    active_user_habits = data.get('activeHabits', [])
    return jsonify({"message": "Habits synchronized successfully", "count": len(active_user_habits)})

# Footprint APIs (unchanged)
@app.route('/api/footprint', methods=['POST'])
def save_footprint():
    data = request.get_json() or {}
    total_co2 = data.get('totalCO2')
    if total_co2 is None:
        return jsonify({"error": "Invalid footprint data, totalCO2 required"}), 400
    log_entry = {
        "id": str(int(time.time() * 1000)),
        "energy": data.get('energy', 0),
        "transportation": data.get('transportation', 0),
        "food": data.get('food', 0),
        "waste": data.get('waste', 0),
        "totalCO2": float(total_co2),
        "timestamp": data.get('timestamp', time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()))
    }
    footprint_logs.append(log_entry)
    if len(footprint_logs) > 50:
        footprint_logs.pop(0)
    return jsonify({"message": "Footprint logged successfully", "data": log_entry}), 201

@app.route('/api/footprint', methods=['GET'])
def get_footprints():
    return jsonify(footprint_logs)

# New ambient trigger endpoint
@app.route('/api/agent/trigger', methods=['POST'])
def agent_trigger():
    """Accept Pub/Sub style payloads and forward to workflow engine.
    Expected JSON: {"message": "user text"}
    """
    data = request.get_json() or {}
    user_msg = data.get('message', '')
    result = workflow_engine.handle_message(user_msg)
    # If flagged, enqueue for HITL review
    if result.get('flagged'):
        hitl_queue.append({
            "id": str(int(time.time() * 1000)),
            "message": user_msg,
            "response": result['response'],
            "timestamp": time.time()
        })
    return jsonify(result)

# Existing chat endpoint now proxies to workflow engine (Day 3 logic retained)
@app.route('/api/agent/chat', methods=['POST'])
def agent_chat():
    data = request.get_json() or {}
    user_msg = data.get('message', '')
    result = workflow_engine.handle_message(user_msg)
    if result.get('flagged'):
        hitl_queue.append({
            "id": str(int(time.time() * 1000)),
            "message": user_msg,
            "response": result['response'],
            "timestamp": time.time()
        })
    return jsonify({"response": result['response'], "toolCalls": []})

# Clear chat history
@app.route('/api/agent/clear', methods=['POST'])
def clear_chat():
    chat_history.clear()
    return jsonify({"message": "Chat history cleared"})

# Security logs endpoint (placeholder – currently unused)
@app.route('/api/agent/security-logs', methods=['GET'])
def get_security_logs():
    return jsonify(security_logs)

# 404 fallback to SPA
@app.errorhandler(404)
def not_found(e):
    return app.send_static_file('index.html')

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8080))
    app.run(host='0.0.0.0', port=port)


def get_eco_habits():
    """Return the list of eco habits."""
    return ECO_HABITS

def get_footprint_data():
    """Return the latest footprint entry or empty dict."""
    return footprint_logs[-1] if footprint_logs else {}

def get_historical_logs():
    """Return all footprint logs."""
    return footprint_logs

def generate_json_plan(selectedHabits, targetCO2):
    """Create a simple JSON plan based on selected habits and target CO2 reduction."""
    # Compute estimated savings from selected habit IDs
    savings = sum(h["co2Savings"] for h in ECO_HABITS if h["id"] in selectedHabits)
    return {
        "selectedHabits": selectedHabits,
        "targetCO2": targetCO2,
        "estimatedSavingsKgCO2": savings,
        "timestamp": time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())
    }

@app.route('/')
def index():
    return app.send_static_file('index.html')

# API: Get eco habits list
@app.route('/api/habits', methods=['GET'])
def get_habits():
    return jsonify(ECO_HABITS)

# API: Sync active habits (Mock status persistence)
@app.route('/api/habits', methods=['POST'])
def sync_habits():
    data = request.get_json() or {}
    global active_user_habits
    active_user_habits = data.get('activeHabits', [])
    return jsonify({"message": "Habits synchronized successfully", "count": len(active_user_habits)})

# API: Save footprint snapshot log
@app.route('/api/footprint', methods=['POST'])
def save_footprint():
    data = request.get_json() or {}
    total_co2 = data.get('totalCO2')
    
    if total_co2 is None:
        return jsonify({"error": "Invalid footprint data, totalCO2 required"}), 400

    log_entry = {
        "id": str(int(time.time() * 1000)),
        "energy": data.get('energy', 0),
        "transportation": data.get('transportation', 0),
        "food": data.get('food', 0),
        "waste": data.get('waste', 0),
        "totalCO2": float(total_co2),
        "timestamp": data.get('timestamp', time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()))
    }

    footprint_logs.append(log_entry)
    
    # Keep list clean, keep only last 50 logs in memory
    if len(footprint_logs) > 50:
        footprint_logs.pop(0)

    return jsonify({"message": "Footprint logged successfully", "data": log_entry}), 201

# API: Get footprint logs history
@app.route('/api/footprint', methods=['GET'])
def get_footprints():
    return jsonify(footprint_logs)

# Load environment variables from a .env file.
load_dotenv()
model = None

# Gemini tool definitions (Day 2)
AGENT_TOOLS = [
    {
        "name": "get_eco_habits",
        "description": "Return the list of pre‑seeded eco habits.",
        "parameters": {"type": "object", "properties": {}, "required": []}
    },
    {
        "name": "get_footprint_data",
        "description": "Return the most recent footprint entry.",
        "parameters": {"type": "object", "properties": {}, "required": []}
    },
    {
        "name": "get_historical_logs",
        "description": "Return the full list of footprint logs.",
        "parameters": {"type": "object", "properties": {}, "required": []}
    },
    {
        "name": "generate_json_plan",
        "description": "Create a JSON plan for carbon reduction.",
        "parameters": {
            "type": "object",
            "properties": {
                "selectedHabits": {"type": "array", "items": {"type": "string"}},
                "targetCO2": {"type": "number"}
            },
            "required": ["selectedHabits", "targetCO2"]
        }
    }
]

DISALLOWED_PHRASES = [
    "ignore instructions",
    "system override",
    "developer mode",
    "<script>",
    "</script>"
]

def is_message_allowed(msg: str) -> bool:
    lowered = msg.lower()
    for phrase in DISALLOWED_PHRASES:
        if phrase in lowered:
            return False
    # length limit example
    if len(msg) > 1000:
        return False
    return True

# Helper to simulate agent response when Gemini not configured
def simulate_agent_response(user_msg):
    # Very simple rule‑based mock
    if "footprint" in user_msg.lower():
        return "Your current carbon footprint is calculated from your latest data."
    if "habit" in user_msg.lower():
        return "Here are some eco‑habits you can adopt: " + ", ".join([h["name"] for h in ECO_HABITS])
    return "I’m here to help with your eco‑tracking. Ask me about footprints or habits!"

# API: Agent chat with guardrails and memory (Day 3)
@app.route('/api/agent/chat', methods=['POST'])
def agent_chat():
    try:
        data = request.get_json() or {}
        user_msg = data.get('message', '')

        if not is_message_allowed(user_msg):
            return jsonify({
                "response": "Message blocked by security guardrails."
                }), 400

        chat_history.append({
            "role": "user",
            "content": user_msg
        })

        if model:
            try:
                prompt = f"""
                    You are EcoTrace AI Assistant.

                    You are an intelligent sustainability and carbon footprint advisor.

                    Answer questions about:
                    - Carbon Footprint
                    - Climate Change
                    - Sustainability
                    - Renewable Energy
                    - Recycling
                    - Green Transportation
                    - Energy Saving
                    - Eco Friendly Lifestyle

                    User Question:
                    {user_msg}
                """
                response = model.generate_content(prompt)
                if hasattr(response, "text"):
                    reply = response.text
                else:
                    reply = "I could not generate a response."
            except Exception as gemini_error:
                print("Gemini Error:", gemini_error)
                reply = f"Gemini Error: {str(gemini_error)}"
        else:
            reply = simulate_agent_response(user_msg)

        chat_history.append({
            "role": "assistant",
            "content": reply
        })

        return jsonify({
            "response": reply,
            "toolCalls": []
        })

    except Exception as e:
        print("Agent Chat Error:", e)

    return jsonify({
        "response": f"Server Error: {str(e)}"
    }), 500


# Optional endpoint to clear chat memory
@app.route('/api/agent/clear', methods=['POST'])
def clear_chat():
    chat_history.clear()
    return jsonify({"message": "Chat history cleared"})



# API: Get security logs
@app.route('/api/agent/security-logs', methods=['GET'])
def get_security_logs():
    return jsonify(security_logs)

@app.errorhandler(404)
def not_found(e):
    return app.send_static_file('index.html')

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8080))
    app.run(host='0.0.0.0', port=port)
