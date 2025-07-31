from flask import Flask, render_template, request, jsonify
import os
import requests
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
API_KEY = os.getenv("OPENROUTER_API_KEY")
API_URL = "https://openrouter.ai/api/v1/chat/completions"

headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/ask", methods=["POST"])
def ask():
    data = request.get_json()
    user_message = data.get("message", "")

    payload = {
        "model": "z-ai/glm-4.5-air:free",
        "messages": [
            {"role": "system","content": "Сен тек қазақ тілінде жауап беретін көмекші ботсың. Ешқашан басқа тілде жауап берме. Түсінікті, нақты, қысқа жауап бер. Ешқандай ағылшын немесе орыс сөзі қолданба."},
            {"role": "user", "content": user_message}
        ]
    }

    response = requests.post(API_URL, headers=headers, json=payload)

    if response.status_code == 200:
        answer = response.json()["choices"][0]["message"]["content"]
        return jsonify({"response": answer})
    else:
        return jsonify({
            "response": f"Қате орын алды: Error code {response.status_code} - {response.text}"
        })

if __name__ == "__main__":
    app.run(debug=True)