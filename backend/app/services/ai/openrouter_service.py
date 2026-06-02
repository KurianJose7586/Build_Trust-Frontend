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
            response = await client.post(self.base_url, headers=headers, json=payload, timeout=30.0)
            
            if response.status_code != 200:
                print(f"❌ OpenRouter Error ({response.status_code}): {response.text}")
                if response.status_code == 429:
                    raise Exception("RATE_LIMIT_REACHED")
                raise Exception(f"AI_SERVICE_UNAVAILABLE_{response.status_code}")

            result = response.json()
            if 'choices' not in result or not result['choices']:
                print(f"❌ Unexpected AI Response Structure: {result}")
                raise Exception("MALFORMED_AI_RESPONSE")

            return result['choices'][0]['message']['content']

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
