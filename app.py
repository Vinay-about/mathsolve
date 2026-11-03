
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from openai import OpenAI

app = Flask(__name__)

# GitHub Pages website origin
allowed_origins = [
    item.strip()
    for item in os.getenv("FRONTEND_ORIGIN", "").split(",")
    if item.strip()
]

CORS(
    app,
    resources={
        r"/api/*": {
            "origins": allowed_origins
        }
    }
)

# Basic request limit
limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits=["10 per minute"],
    storage_uri="memory://"
)

# API key is read only from Render environment
api_key = os.getenv("OPENAI_API_KEY")

client = OpenAI(api_key=api_key) if api_key else None

MODEL = os.getenv("OPENAI_MODEL", "gpt-6-luna")


@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "status": "online",
        "message": "Math Genius AI Backend is running"
    })


@app.route("/api/solve", methods=["POST"])
@limiter.limit("10 per minute")
def solve_math():

    if client is None:
        return jsonify({
            "error": "AI service is not configured yet."
        }), 503

    data = request.get_json(silent=True) or {}

    question = data.get("question", "").strip()
    chapter = data.get("chapter", "All Chapters")
    grade = data.get("grade", "All Classes")
    language = data.get("language", "hi")

    if not question:
        return jsonify({
            "error": "Please enter a maths question."
        }), 400

    if len(question) > 3000:
        return jsonify({
            "error": "Question is too long. Maximum 3000 characters."
        }), 400

    if language not in ["hi", "en", "both"]:
        language = "hi"

    language_instruction = {
        "hi": "Explain completely in simple Hindi.",
        "en": "Explain completely in simple English.",
        "both": "Explain in both Hindi and English."
    }[language]

    instructions = """
You are Math Genius AI, a careful mathematics tutor.

Solve the student's mathematics question accurately.

Rules:
1. Explain step by step.
2. Show formulas used.
3. Explain calculations clearly.
4. Check the final answer.
5. If information is missing, ask for clarification.
6. Never invent a diagram or unreadable question.
7. Match the explanation to the student's class level.
8. Use simple educational language.
9. For proof questions, give a clear logical proof.
10. If the question is not mathematics, politely ask for a maths question.

""" + language_instruction

    user_prompt = f"""
Class: {grade}
Chapter: {chapter}

Student's question:
{question}

Give the solution with:
- Given information
- Formula or concept
- Step-by-step solution
- Final answer
"""

    try:
        response = client.responses.create(
            model=MODEL,
            instructions=instructions,
            input=user_prompt,
            max_output_tokens=1400
        )

        answer = response.output_text

        if not answer:
            return jsonify({
                "error": "The AI did not return an answer. Try again."
            }), 502

        return jsonify({
            "answer": answer
        })

    except Exception:
        app.logger.exception("AI request failed")

        return jsonify({
            "error": "AI service error. Please try again later."
        }), 502


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    app.run(host="0.0.0.0", port=port)
  
