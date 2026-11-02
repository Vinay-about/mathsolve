
const questionBox = document.getElementById("question");
const answerBox = document.getElementById("answer");
const statusBox = document.getElementById("status");

// MATH SOLVER

document.getElementById("solveBtn").addEventListener("click", solveQuestion);

function solveQuestion() {
    const question = questionBox.value.trim();
    const language = document.getElementById("language").value;

    if (!question) {
        answerBox.textContent = "Please enter a maths question.";
        return;
    }

    const q = question.toLowerCase();

    let answer = "";

    if (
        q.includes("every integer is a rational number") ||
        q.includes("integer is a rational")
    ) {
        answer =
`THEOREM: Every integer is a rational number.

Step 1:
Let n be any integer.

Step 2:
We can write n as:

n = n/1

Step 3:
Here, numerator = n and denominator = 1.

Both are integers and denominator is not zero.

Step 4:
A rational number is any number that can be written as p/q, where p and q are integers and q ≠ 0.

Therefore, n is a rational number.

Hence proved.`;

    } else if (math && /^[0-9+\-*/().%\s^]+$/.test(question)) {
        try {
            const result = math.evaluate(question);
            answer =
`Step 1: Given expression
${question}

Step 2: Calculate

Step 3: Final Answer = ${result}`;
        } catch (error) {
            answer = "Please check your mathematical expression.";
        }

    } else {
        answer =
`This question needs an AI Math Solver.

Your question:
${question}

Chapter: ${document.getElementById("chapter").value}

Note: This basic version supports the built-in theorem and numerical calculations. Connect a secure AI backend to solve more types of questions.`;
    }

    if (language === "en") {
        answerBox.textContent = answer;
    } else if (language === "hi") {
        answerBox.textContent = answer
            .replace("THEOREM:", "प्रमेय:")
            .replace("Step 1:", "चरण 1:")
            .replace("Step 2:", "चरण 2:")
            .replace("Step 3:", "चरण 3:")
            .replace("Step 4:", "चरण 4:")
            .replace("Hence proved.", "अतः सिद्ध हुआ।")
            .replace("Final Answer", "अंतिम उत्तर");
    } else {
        answerBox.textContent =
            answer + "\n\n--------------------\n\nHindi: ऊपर दिए गए चरणों से उत्तर समझें।";
    }
}

// SCIENTIFIC CALCULATOR

const calcInput = document.getElementById("calcInput");

document.querySelectorAll("[data-value]").forEach(button => {
    button.addEventListener("click", () => {
        calcInput.value += button.dataset.value;
    });
});

document.getElementById("clearCalc").addEventListener("click", () => {
    calcInput.value = "";
    document.getElementById("calcAnswer").textContent = "";
});

document.getElementById("calculateBtn").addEventListener("click", () => {
    try {
        const result = math.evaluate(calcInput.value);
        document.getElementById("calcAnswer").textContent =
            "Answer: " + result;
    } catch (error) {
        document.getElementById("calcAnswer").textContent =
            "Invalid calculation!";
    }
});

// VOICE QUESTION INPUT

document.getElementById("voiceBtn").addEventListener("click", () => {
    const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
        statusBox.textContent =
            "Voice input is not supported in this browser. Try Chrome.";
        return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "en-IN";
    recognition.continuous = false;
    recognition.interimResults = false;

    statusBox.textContent = "Listening... Speak your question.";

    recognition.onresult = event => {
        questionBox.value =
            event.results[0][0].transcript;
        statusBox.textContent = "Voice question captured!";
    };

    recognition.onerror = () => {
        statusBox.textContent = "Voice input failed. Please try again.";
    };

    recognition.onend = () => {
        if (statusBox.textContent === "Listening... Speak your question.") {
            statusBox.textContent = "Voice input ended.";
        }
    };

    recognition.start();
});

// PHOTO QUESTION SCANNER

document.getElementById("photoInput").addEventListener("change", async event => {
    const file = event.target.files[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
        statusBox.textContent = "Please select an image file.";
        return;
    }

    statusBox.textContent = "Reading photo... Please wait.";

    try {
        const result = await Tesseract.recognize(file, "eng");

        questionBox.value = result.data.text.trim();

        statusBox.textContent =
            "Photo text captured. Please check it before solving.";

    } catch (error) {
        statusBox.textContent =
            "Could not read the photo. Try a clearer image.";
    }
});
