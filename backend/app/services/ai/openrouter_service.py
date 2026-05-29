import os
import httpx
import json
from dotenv import load_dotenv

load_dotenv()

class OpenRouterService:
    def __init__(self):
        self.api_key = os.getenv("OPENROUTER_API_KEY")
        self.model = "google/gemma-4-31b-it:free" 
        self.base_url = "https://openrouter.ai/api/v1/chat/completions"
        
        if not self.api_key:
            self.configured = False
            return
        self.configured = True

    async def get_chat_response(self, messages: list):
        if not self.configured:
            return "AI Service is not configured. Please check your API key."

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "HTTP-Referer": "https://buildtrust.me",
            "X-Title": "Build_Trust CRM",
            "Content-Type": "application/json"
        }

        payload = {
            "model": self.model,
            "messages": messages
        }

        async with httpx.AsyncClient(follow_redirects=True) as client:
            try:
                response = await client.post(self.base_url, headers=headers, json=payload, timeout=30.0)
                response.raise_for_status()
                result = response.json()
                return result['choices'][0]['message']['content']
            except Exception as e:
                print(f"AI Service Error: {e}")
                return "I'm sorry, I'm having trouble connecting to my brain right now. Please try again in a moment."

    async def get_cost_estimate(self, description: str):
        # Legacy support for single-shot estimate if needed
        messages = [
            {"role": "system", "content": "Return ONLY a JSON object with trade, area, material_cost, labor_hours, total_estimate."},
            {"role": "user", "content": f"Estimate for: {description}"}
        ]
        response_text = await self.get_chat_response(messages)
        try:
            clean_json = response_text.strip().replace('```json', '').replace('```', '')
            return json.loads(clean_json)
        except:
            return {"error": "Could not parse AI response"}

ai_service = OpenRouterService()
