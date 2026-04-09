const WORKER_URL = "https://lorea.gogulampativenkatatejacollege.workers.dev/";

const chatWindow = document.getElementById("chatWindow");
const userInput = document.getElementById("userInput");
const questionDisplay = document.getElementById("questionDisplay");
const questionText = document.getElementById("questionText");

const SYSTEM_PROMPT = `
You are a L'Oréal Beauty Advisor.

ONLY talk about:
- skincare
- makeup
- haircare
- beauty

If unrelated → say:
"I'm here for beauty advice only!"
`;

let history = [
  { role: "system", content: SYSTEM_PROMPT }
];

function addMessage(text, type) {
  const div = document.createElement("div");
  div.className = "msg " + type;
  div.innerText = text;
  chatWindow.appendChild(div);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function askSuggestion(btn) {
  userInput.value = btn.innerText;
  sendMessage();
}

async function sendMessage() {
  const text = userInput.value.trim();
  if (!text) return;

  addMessage(text, "user");
  questionDisplay.classList.remove("hidden");
  questionText.innerText = text;

  userInput.value = "";

  history.push({ role: "user", content: text });

  try {
    const res = await fetch(WORKER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ messages: history })
    });

    const data = await res.json();
    const reply = data.choices[0].message.content;

    addMessage(reply, "ai");
    history.push({ role: "assistant", content: reply });

  } catch (err) {
    addMessage("Error connecting to AI", "ai");
    console.error(err);
  }
}