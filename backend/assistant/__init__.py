from .openai_assistant import OpenAIAssistant
from .gemini_assistant import GeminiAssistant

# def get_assistant_response(message, assistant):
    # return "Заглушка ответа ассистента"

def get_assistant_response(message, assistant):
    if assistant == "openai":
        return OpenAIAssistant().ask(message)
    elif assistant == "gemini":
        return GeminiAssistant().ask(message)
    else:
        return "Unknown assistant" 