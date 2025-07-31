from fireworks import LLM

llm = LLM(model="llama-v3-70b-instruct", deployment_type="auto")

response = llm.chat.completions.create(
    messages=[{"role": "user", "content": "Сәлем! Сен кімсің?"}]
)

print(response.choices[0].message.content)
