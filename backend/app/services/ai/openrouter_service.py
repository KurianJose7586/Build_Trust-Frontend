import os
import httpx
import json
from dotenv import load_dotenv

load_dotenv()

class OpenRouterService:
    def __init__(self):
        self.api_key = os.getenv("OPENROUTER_API_KEY")
        self.model = "google/gemma-2-9b-it:free" # Using standard slug or user provided one
        self.base_url = "https://openrouter.ai/api/v1/chat/completions"
        
        if not self.api_key:
            self.configured = False
            return
        self.configured = True

    async def get_cost_estimate(self, description: str):
        if not self.configured:
            return {
                "trade": "General Labor",
                "area": "Unknown",
                "material_cost": 5000,
                "labor_hours": 8,
                "total_estimate": 10000,
                "is_mock": True
            }

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "HTTP-Referer": "http://localhost:8000", # Required by OpenRouter
            "X-Title": "Build_Trust CRM",
            "Content-Type": "application/json"
        }

        prompt = f"""
        Analyze this construction/repair request for a project in India: "{description}"
        
        Provide a JSON response with exactly these keys:
        - trade: (The specialty needed, e.g., 'Masonry', 'Electrical')
        - area: (Estimated sq ft or quantity)
        - material_cost: (Estimated cost in INR)
        - labor_hours: (Estimated work hours)
        - total_estimate: (Total material + labor in INR)
        
        Return ONLY the raw JSON object. No markdown, no intro.
        """

        payload = {
            "model": self.model,
            "messages": [
                {"role": "user", "content": prompt}
            ]
        }

        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(self.base_url, headers=headers, json=payload, timeout=30.0)
                response.raise_for_status()
                result = response.json()
                
                content = result['choices'][0]['message']['content']
                # Cleanup potential markdown wrapper
                clean_json = content.strip().replace('```json', '').replace('```', '')
                return json.loads(clean_json)
            except Exception as e:
                print(f"AI Service Error: {e}")
                return {"error": "AI could not process the request"}

ai_service = OpenRouterService()
