document.addEventListener("DOMContentLoaded", () => {
  const historyDiv = document.getElementById("history");
  const questionInput = document.getElementById("question");
  const micBtn = document.getElementById("mic-button");
  const sendBtn = document.getElementById("send-button");

  // Микрофоннан сөйлеу (speech-to-text)
  micBtn.addEventListener("click", () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("🎤 Бұл браузер микрофонды қолдамайды.");
      return;
    }

    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = "kk-KZ";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.start();

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      questionInput.value = transcript;
      sendQuestion(); // Автоматты түрде сұрақ жіберу
    };

    recognition.onerror = (event) => {
      alert("🎤 Микрофоннан оқу сәтсіз: " + event.error);
    };
  });

  // Enter арқылы сұрақ жіберу
  questionInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendQuestion();
    }
  });

  // Батырмамен сұрақ жіберу
  sendBtn.addEventListener("click", sendQuestion);
});

// Сұрақты серверге жіберу
async function sendQuestion() {
  const questionInput = document.getElementById("question");
  const historyDiv = document.getElementById("history");
  const question = questionInput.value.trim();

  if (question === "") return;

  // Пайдаланушы сұрағы
  const userMessage = document.createElement("div");
  userMessage.className = "message user";
  userMessage.textContent = "🧑‍💻: " + question;
  historyDiv.appendChild(userMessage);
  questionInput.value = "";

  // 🤖 Ойлануда...
  const thinkingMessage = document.createElement("div");
  thinkingMessage.className = "message bot thinking";
  thinkingMessage.textContent = "🤖 Ойлануда...";
  historyDiv.appendChild(thinkingMessage);
  historyDiv.scrollTop = historyDiv.scrollHeight;

  try {
    const response = await fetch("/ask", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message: question })
    });

    const data = await response.json();

    thinkingMessage.textContent = "🤖: " + data.response;
    thinkingMessage.classList.remove("thinking");
  } catch (error) {
    thinkingMessage.textContent = "❌ Қате орын алды. Қайталап көріңіз.";
    thinkingMessage.classList.add("error");
    console.error("Fetch error:", error);
  }

  // Scroll соңына
  historyDiv.scrollTop = historyDiv.scrollHeight;
}






//роль
let currentRole = "default";

document.getElementById("role").addEventListener("change", function () {
  currentRole = this.value;
});

function getRolePrompt(role) {
  switch (role) {
    case "psychologist":
      return "Сен психологсың. Мақсатың – пайдаланушыға психологиялық қолдау көрсету.";
    case "teacher":
      return "Сен қазақ тілі мен әдебиеті пәнінен ұстазсың. Қарапайым, нақты жауап бер.";
    case "wise":
      return "Сен дана қариясың, ескі қазақ нақыл сөздер мен мысалдар айт.";
    case "friend":
      return "Сен қарапайым доссың. Жылы, түсіністікпен сөйлес.";
    default:
      return "";
  }
}

// modify prompt before sending to backend
async function sendMessage() {
  const messageInput = document.getElementById("message");
  const message = messageInput.value.trim();
  if (!message) return;

  appendMessage("user", message);
  messageInput.value = "";

  const rolePrompt = getRolePrompt(currentRole);
  const finalMessage = rolePrompt ? `${rolePrompt}\n\n${message}` : message;

  const response = await fetch("/get", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ msg: finalMessage }),
  });

  const data = await response.json();
  appendMessage("bot", data.response);
}
document.addEventListener("DOMContentLoaded", () => {
  const historyDiv = document.getElementById("history");
  const questionInput = document.getElementById("question");
  const micBtn = document.getElementById("mic-button");
  const sendBtn = document.getElementById("send-button");

  // Микрофоннан сөйлеу (speech-to-text)
  // 🚀 Запрос разрешения на микрофон при загрузке
  navigator.mediaDevices.getUserMedia({ audio: true })
    .then((stream) => {
      console.log("🎤 Микрофон рұқсаты берілді.");
      stream.getTracks().forEach(track => track.stop());
    })
    .catch((err) => {
      console.warn("❌ Микрофонға рұқсат берілмеді: ", err);
      alert("🎤 Микрофонға рұқсат қажет. Браузерден рұқсат беріңіз.");
    });

  // 🎙️ Голосовой ввод
  let recognition;
  if ('webkitSpeechRecognition' in window) {
    recognition = new webkitSpeechRecognition();
    recognition.lang = 'kk-KZ'; // Қазақ тілі
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      questionInput.value = transcript;
    };

    recognition.onerror = (event) => {
      console.error("🎤 Қате:", event.error);
      alert("Микрофоннан оқу сәтсіз. Қайтадан көріңіз.");
    };
  } else {
    micBtn.disabled = true;
    alert("Браузер микрофонды қолдамайды.");
  }

  micBtn.addEventListener("click", () => {
    if (recognition) {
      recognition.start();
    }
  });

  // Enter арқылы сұрақ жіберу
  questionInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendQuestion();
    }
  });

  // Батырмамен сұрақ жіберу
  sendBtn.addEventListener("click", sendQuestion);
});

// Сұрақты серверге жіберу
async function sendQuestion() {
  const questionInput = document.getElementById("question");
  const historyDiv = document.getElementById("history");
  const question = questionInput.value.trim();

  if (question === "") return;

  // Пайдаланушы сұрағы
  const userMessage = document.createElement("div");
  userMessage.className = "message user";
  userMessage.textContent = "🧑‍💻: " + question;
  historyDiv.appendChild(userMessage);
  questionInput.value = "";

  // 🤖 Ойлануда...
  const thinkingMessage = document.createElement("div");
  thinkingMessage.className = "message bot thinking";
  thinkingMessage.textContent = "🤖 Ойлануда...";
  historyDiv.appendChild(thinkingMessage);
  historyDiv.scrollTop = historyDiv.scrollHeight;

  try {
    const response = await fetch("/ask", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message: question })
    });

    const data = await response.json();

    thinkingMessage.textContent = "🤖: " + data.response;
    thinkingMessage.classList.remove("thinking");
  } catch (error) {
    thinkingMessage.textContent = "❌ Қате орын алды. Қайталап көріңіз.";
    thinkingMessage.classList.add("error");
    console.error("Fetch error:", error);
  }

  // Scroll соңына
  historyDiv.scrollTop = historyDiv.scrollHeight;
}


// modify prompt before sending to backend
async function sendMessage() {
  const messageInput = document.getElementById("message");
  const message = messageInput.value.trim();
  if (!message) return;

  appendMessage("user", message);
  messageInput.value = "";

  const rolePrompt = getRolePrompt(currentRole);
  const finalMessage = rolePrompt ? `${rolePrompt}\n\n${message}` : message;

  const response = await fetch("/get", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ msg: finalMessage }),
  });

  const data = await response.json();
  appendMessage("bot", data.response);
}
