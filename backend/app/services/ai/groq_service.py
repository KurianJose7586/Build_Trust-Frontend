import os
import json
from groq import Groq
from dotenv import load_dotenv

# Load .env
dotenv_path = os.path.join(os.path.dirname(__file__), '../../../.env')
load_dotenv(dotenv_path)

class GroqService:
    def __init__(self):
        self.api_key = os.getenv("GROQ_API_KEY")
        self.model = "llama-3.3-70b-versatile"
        
        if not self.api_key:
            self.configured = False
            print("⚠️ Groq Service: OFFLINE (Missing API Key)")
            return
            
        self.client = Groq(api_key=self.api_key)
        self.configured = True
        print(f"🚀 Groq AI Service: ONLINE ({self.model})")

    async def get_chat_response(self, messages: list):
        if not self.configured:
            return '{"status": "QUESTION", "message": "AI Service not configured. Please check GROQ_API_KEY.", "chips": ["Okay"]}'

        try:
            completion = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                response_format={"type": "json_object"},
                temperature=0.2, # Lower temperature for stricter JSON
                max_tokens=1024
            )
            return completion.choices[0].message.content
        except Exception as e:
            print(f"❌ Groq API Error: {e}")
            raise e

ai_service = GroqService()
