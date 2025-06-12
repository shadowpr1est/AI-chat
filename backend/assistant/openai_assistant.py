from openai import OpenAI
import os
from dotenv import load_dotenv

load_dotenv()

class OpenAIAssistant:
    def ask(self, message):
        client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": message}]
        )
        return response.choices[0].message.content
