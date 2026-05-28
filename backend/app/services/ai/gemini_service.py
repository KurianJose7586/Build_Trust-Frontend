import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

class GeminiService:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            self.configured = False
            return
        
        genai.configure(api_key=self.api_key)
        self.model = genai.GenerativeModel('gemini-1.5-flash')
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

        prompt = f"""
        Analyze this construction/repair request for a project in India: "{description}"
        
        Provide a JSON response with exactly these keys:
        - trade: (The specialty needed, e.g., 'Masonry', 'Electrical')
        - area: (Estimated sq ft or quantity)
        - material_cost: (Estimated cost in INR)
        - labor_hours: (Estimated work hours)
        - total_estimate: (Total material + labor in INR)
        
        Return ONLY the JSON.
        """
        
        # In a real async flow, we'd use run_in_executor if the SDK isn't fully async
        # but for simplicity here we'll call it directly
        response = self.model.generate_content(prompt)
        
        try:
            # Basic cleanup of AI response text to get JSON
            text = response.text.strip().replace('```json', '').replace('```', '')
            import json
            return json.loads(text)
        except Exception:
            return {"error": "AI could not parse requirements"}

ai_service = GeminiService()
