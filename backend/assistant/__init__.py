from .openai_assistant import OpenAIAssistant
from .gemini_assistant import GeminiAssistant
from .claude_assistant import ClaudeAssistant

def get_assistant_response(message, assistant):
    if assistant == "openai":
        return OpenAIAssistant().ask(message)
    elif assistant == "gemini":
        return GeminiAssistant().ask(message)
    elif assistant == "claude":
        return ClaudeAssistant().ask(message)
    else:
        return "Unknown assistant" 