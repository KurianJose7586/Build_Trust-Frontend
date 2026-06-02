import httpx
import os
import asyncio
from dotenv import load_dotenv

load_dotenv()

async def list_models():
    api_key = os.getenv("OPENROUTER_API_KEY")
    url = "https://openrouter.ai/api/v1/models"
    
    headers = {
        "Authorization": f"Bearer {api_key}"
    }

    async with httpx.AsyncClient() as client:
        response = await client.get(url, headers=headers)
        if response.status_code == 200:
            models = response.json().get('data', [])
            print("--- Available Google/Gemma Models ---")
            for m in models:
                if 'google' in m['id'] or 'gemma' in m['id']:
                    print(f"ID: {m['id']} | Name: {m['name']}")
        else:
            print(f"Failed to fetch models: {response.status_code}")
            print(response.text)

if __name__ == "__main__":
    asyncio.run(list_models())
