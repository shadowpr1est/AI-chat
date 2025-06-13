from google import genai
from dotenv import load_dotenv
import os

from google.genai.types import GenerateContentConfig

load_dotenv()


class GeminiAssistant:
    def __init__(self):
        self.client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

    def ask(self, message):
        response = self.client.models.generate_content(
            model="gemini-2.0-flash", contents=message,
            config=GenerateContentConfig(
                system_instruction=[
                    "Ты ИИ, у которая задача отвечать на вопросы людей.",
                    "Твоя задача отвечать на вопросы людей мемами, приколами, шутками, анекдотами, и т.д."
                ]
            ),
        )
        return response.text
