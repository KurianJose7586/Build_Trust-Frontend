import asyncio
import json
import httpx
import os
from dotenv import load_dotenv

# Ensure environment is loaded first
load_dotenv()

from app.services.ai.openrouter_service import ai_service
from app.services.dataverse_service import dataverse_service

async def main():
    print("========================================")
    print("👷 Build_Trust AI Agent POC (Terminal)")
    print("========================================\n")
    
    if not ai_service.configured:
        print("❌ OpenRouter is not configured.")
        return
    if not dataverse_service.configured:
        print("❌ Dataverse is not configured.")
        return

    print("Agent: Namaste! I am the Build_Trust Project Manager. What kind of construction or repair work do you need today?")
    
    messages = [
        {
            "role": "system",
            "content": (
                "You are an expert Construction Project Manager in India. "
                "Your job is to scope out a customer's repair/construction project. "
                "Ask 1 or 2 clarifying questions to understand the scope (size, materials, interior/exterior). "
                "Be polite and professional. "
                "Once you have a clear understanding of the project, YOU MUST output a JSON block with status 'READY' and stop asking questions. "
                "Format of the final JSON:\n"
                "{\n"
                '  "status": "READY",\n'
                '  "trade": "Masonry", // e.g. Plumber, Electrical, Masonry, Painting\n'
                '  "estimated_cost_inr": 4500,\n'
                '  "summary": "Brief summary of the work"\n'
                "}\n"
                "Do NOT output the JSON until you have enough details to provide an estimate."
            )
        }
    ]

    # List of stable free models verified from the OpenRouter API
    FREE_MODELS = [
        "google/gemma-4-31b-it:free",
        "google/gemma-4-26b-a4b-it:free"
    ]

    while True:
        user_input = input("\nYou: ")
        if user_input.lower() in ['exit', 'quit']:
            break

        messages.append({"role": "user", "content": user_input})

        ai_msg = None
        for current_model in FREE_MODELS:
            payload = {
                "model": current_model,
                "messages": messages
            }
            
            headers = {
                "Authorization": f"Bearer {ai_service.api_key}",
                "HTTP-Referer": "https://buildtrust.me",
                "X-Title": "Build_Trust CRM",
                "Content-Type": "application/json"
            }

            print(f"Agent is thinking (using {current_model})...")
            async with httpx.AsyncClient() as client:
                try:
                    response = await client.post(ai_service.base_url, headers=headers, json=payload, timeout=30.0)
                    if response.status_code == 200:
                        ai_msg = response.json()['choices'][0]['message']['content']
                        break # Found a working model!
                    else:
                        print(f"  [!] {current_model} failed (Status: {response.status_code}). Trying fallback...")
                except Exception as e:
                    print(f"  [!] Connection error with {current_model}. Trying fallback...")
                    continue
        
        if not ai_msg:
            print("❌ All AI models failed. Please check your internet or OpenRouter credits.")
            continue
        
        messages.append({"role": "assistant", "content": ai_msg})
        
        # Check if the AI decided it has enough info and outputted JSON
        if "READY" in ai_msg and "{" in ai_msg and "}" in ai_msg:
            try:
                # Extract JSON from the text block
                start = ai_msg.find("{")
                end = ai_msg.rfind("}") + 1
                json_str = ai_msg[start:end]
                data = json.loads(json_str)
                
                if data.get("status") == "READY":
                    print(f"\n👷 Agent: Got it! Here is my professional assessment:")
                    print(f"  - Trade Required: {data.get('trade')}")
                    print(f"  - Est. Cost: ₹{data.get('estimated_cost_inr')}")
                    print(f"  - Summary: {data.get('summary')}")
                    
                    print(f"\n🔍 Agent: Let me search your Dataverse system for the best '{data.get('trade')}' specialists near you...")
                    
                    # Fetch from Dataverse
                    trade = data.get("trade")
                    filter_str = f"contains(cr034_specialty, '{trade}')"
                    endpoint = f"cr034_specialists?$top=3&$filter={filter_str}&$orderby=cr034_rating desc"
                    
                    dv_data = await dataverse_service.get_data(endpoint)
                    workers = dv_data.get("value", [])
                    
                    print("\n✅ MATCHES FOUND IN DATAVERSE:")
                    if not workers:
                        print("  No exact matches found right now.")
                    else:
                        for w in workers:
                            print(f"  ⭐ {w.get('cr034_name')} | Rate: ₹{w.get('cr034_hourlyrate')}/hr | Rating: {w.get('cr034_rating')}")
                    
                    print("\nWould you like to scope another project? (type 'exit' to quit)")
                    # Reset messages for new project
                    messages = [messages[0]]
            except Exception as e:
                # If parsing fails, just print the raw message
                print(f"\n👷 Agent: {ai_msg}")
        else:
            print(f"\n👷 Agent: {ai_msg}")

if __name__ == "__main__":
    asyncio.run(main())
