from dotenv import load_dotenv
import os
import json

# CRUCIAL: Load .env before any other imports to ensure services get credentials
load_dotenv()

from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from app.services.dataverse_service import dataverse_service
from app.services.ai.openrouter_service import ai_service
from app.services.auth_service import auth_service
import time
from collections import defaultdict

# Rate Limiting setup
ai_rate_limits = defaultdict(list)
RATE_LIMIT_MAX_REQUESTS = 15  # Limit per hour per IP
RATE_LIMIT_WINDOW_SECONDS = 3600

app = FastAPI(title="Build_Trust CRM API")

# Enable CORS for the React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mock Data for fallback
MOCK_WORKERS = [
    {"id": "rajesh-kumar", "name": "Rajesh Kumar", "specialty": "Masonry", "rating": 4.9, "verified": True},
    {"id": "manish-sharma", "name": "Manish Sharma", "specialty": "Electrical", "rating": 4.9, "verified": True}
]

@app.get("/")
async def root():
    return {
        "message": "Build_Trust API is LIVE",
        "port": 8001,
        "database": "Dataverse",
        "dataverse_connected": dataverse_service.configured,
        "ai_active": ai_service.configured,
        "email_active": auth_service.email_configured,
        "debug_route_available": "/api/admin/schema/{table_name}"
    }

async def log_event(text: str, event_type: str = "info", icon: str = "★", color: str = "blue-bg"):
    """Helper to log system events to Dataverse for the Admin Feed"""
    if not dataverse_service.configured:
        return
    try:
        payload = {
            "cr034_eventtext": text,
            "cr034_eventtype": event_type,
            "cr034_eventicon": icon,
            "cr034_eventcolor": color
        }
        await dataverse_service.post_data("cr034_auditlogs", payload)
    except Exception as e:
        print(f"Audit Log Error: {e}")

@app.get("/api/workers")
async def get_workers(
    page: int = 1, 
    limit: int = 20, 
    category: str = "All", 
    text: str = "",
    min_rating: float = 0,
    max_rate: int = 1000000
):
    if not dataverse_service.configured:
        # Filter mock data locally for dev
        filtered = MOCK_WORKERS
        if category != "All":
            filtered = [w for w in filtered if w.get("specialty") == category]
        return filtered[0:limit]
    
    try:
        # Build OData filter string
        filters = []
        if category != "All":
            filters.append(f"cr034_specialty eq '{category}'")
        if text:
            # Search in BOTH name and specialty using OData OR logic
            filters.append(f"(contains(cr034_name, '{text}') or contains(cr034_specialty, '{text}'))")
        if min_rating > 0:
            filters.append(f"cr034_rating ge {min_rating}")
        if max_rate < 1000000:
            filters.append(f"cr034_hourlyrate le {max_rate}")
        
        filter_str = " and ".join(filters)
        
        # OData Pagination
        endpoint = f"cr034_specialists?$top={limit}"
        if filter_str:
            endpoint += f"&$filter={filter_str}"
            
        data = await dataverse_service.get_data(endpoint)
        workers = data.get("value", [])
        
        mapped_workers = []
        for w in workers:
            specialty = w.get("cr034_specialty", "General")
            img_map = {
                "Masonry": "/assets/images/worker_rajesh_kumar.png",
                "Electrical": "/assets/images/worker_marcus_thorne.png",
                "Welder": "/assets/images/worker_sarah_jenkins.png",
                "Plumber": "/assets/images/worker_robert_chen.png"
            }
            default_img = "/assets/images/worker_rajesh_kumar.png"

            mapped_workers.append({
                "id": w.get("cr034_specialistid"), 
                "name": w.get("cr034_name"),
                "specialty": specialty,
                "rate": w.get("cr034_hourlyrate") or 300,
                "rating": w.get("cr034_rating") or 4.0,
                "verified": w.get("cr034_verified") or False,
                "location": "Noida, India",
                "image": img_map.get(specialty, default_img),
                "reviewsCount": 10 + (int(w.get("cr034_hourlyrate", 0)) % 50),
                "experience": 5 + (int(w.get("cr034_hourlyrate", 0)) % 10),
                "about": f"Professional {specialty} specialist with years of experience serving the Delhi NCR region.",
                "tags": [specialty, "Verified"] if w.get("cr034_verified") else [specialty],
                "equipment": "Standard professional toolset owned."
            })
        return mapped_workers
    except Exception as e:
        return {"error": str(e), "fallback": MOCK_WORKERS}

@app.get("/api/admin/stats")
async def get_admin_stats():
    if not dataverse_service.configured:
        return {
            "activeJobs": 124,
            "pendingLeads": 42,
            "completionRate": 80,
            "onSchedule": 102,
            "delayed": 22,
            "unverifiedCount": 14,
            "issuesCount": 2,
        }
    
    try:
        jobs_data = await dataverse_service.get_data("cr034_jobs?$count=true&$top=1")
        leads_data = await dataverse_service.get_data("cr034_leads?$count=true&$top=1")
        
        active_jobs = jobs_data.get("@odata.count", 0)
        pending_leads = leads_data.get("@odata.count", 0)

        return {
            "activeJobs": active_jobs,
            "pendingLeads": pending_leads,
            "completionRate": 88, 
            "onSchedule": active_jobs,
            "delayed": 0,
            "unverifiedCount": 12,
            "issuesCount": 1,
        }
    except Exception as e:
        return {"error": str(e)}

@app.get("/api/admin/live-ops")
async def get_live_ops():
    if not dataverse_service.configured:
        return []
    try:
        data = await dataverse_service.get_data("cr034_auditlogs?$top=10&$orderby=createdon desc")
        events = data.get("value", [])
        return [{
            "id": e.get("cr034_auditlogid"),
            "text": e.get("cr034_eventtext"),
            "time": "Just now", 
            "type": e.get("cr034_eventtype"),
            "icon": e.get("cr034_eventicon"),
            "color": e.get("cr034_eventcolor")
        } for e in events]
    except Exception:
        return []

@app.post("/api/leads")
async def create_lead(lead_data: dict):
    if not dataverse_service.configured:
        return {"status": "mock_success", "data": lead_data}
    
    try:
        dv_payload = {
            "cr034_name": lead_data.get("title"),
            "cr034_category": lead_data.get("category"),
            "cr034_location": lead_data.get("location"),
            "cr034_budget": str(lead_data.get("budget")),
            "cr034_description": lead_data.get("desc")
        }
        await dataverse_service.post_data("cr034_leads", dv_payload)
        await log_event(f"New Lead: {lead_data.get('title')}", "lead", "★", "blue-bg")
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/jobs")
async def create_job(job_data: dict):
    if not dataverse_service.configured:
        return {"status": "mock_success", "data": job_data}

    try:
        dv_payload = {
            "cr034_specialist": job_data.get("workerName"),
            "cr034_description": job_data.get("description"),
            "cr034_address": job_data.get("address"),
            "cr034_hours": int(job_data.get("hours", 0)),
            "cr034_totalcost": float(job_data.get("totalCost", 0)),
            "cr034_scheduleddate": job_data.get("date")
        }

        await dataverse_service.post_data("cr034_jobs", dv_payload)
        await log_event(f"Hired: {job_data.get('workerName')} for {job_data.get('address')}", "job", "✓", "green-bg")
        return {"status": "success"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

# --- CUSTOMER AUTHENTICATION ---

@app.post("/api/auth/send-otp")
async def send_otp(request: dict):
    email = request.get("email")
    if not email:
        raise HTTPException(status_code=400, detail="Email is required")
    
    try:
        auth_service.generate_otp(email)
        return {"status": "success"}
    except Exception as e:
        if "wait" in str(e):
            return {"status": "error", "message": str(e)}
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/auth/verify-otp")
async def verify_otp(request: dict):
    email = request.get("email")
    code = request.get("code")
    if not email or not code:
        raise HTTPException(status_code=400, detail="Missing fields")
    
    success, result = auth_service.verify_otp(email, code)
    if not success:
        return {"status": "error", "message": result}
    
    return {"status": "success", "token": result, "user": {"email": email}}

# --- REAL CHAT SYSTEM ---

@app.get("/api/chat/{worker_id}")
async def get_chat_history(worker_id: str, customer_email: str):
    if not dataverse_service.configured:
        return []

    try:
        filter_str = f"cr034_workerid eq '{worker_id}' and cr034_customerid eq '{customer_email}'"
        endpoint = f"cr034_messages?$filter={filter_str}&$orderby=createdon asc"
        data = await dataverse_service.get_data(endpoint)
        msgs = data.get("value", [])

        return [{
            "sender": m.get("cr034_sender"),
            "text": m.get("cr034_content"),
            "time": m.get("createdon")
        } for m in msgs]
    except Exception:
        return []

@app.post("/api/chat")
async def send_chat_message(msg_data: dict):
    if not dataverse_service.configured:
        return {"status": "mock_success"}

    try:
        dv_payload = {
            "cr034_sender": msg_data.get("sender"),
            "cr034_content": msg_data.get("text"),
            "cr034_workerid": msg_data.get("workerId"),
            "cr034_customerid": msg_data.get("customerEmail")
        }
        await dataverse_service.post_data("cr034_messages", dv_payload)
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- AGENTIC AI (CHIP-BASED ONE-QUESTION-AT-A-TIME) ---

@app.post("/api/ai/agent")
async def ai_agent_chat(request: Request, payload: dict):
    # Rate Limiting
    client_ip = request.client.host if request.client else "unknown"
    current_time = time.time()
    
    ai_rate_limits[client_ip] = [t for t in ai_rate_limits[client_ip] if current_time - t < RATE_LIMIT_WINDOW_SECONDS]
    
    if len(ai_rate_limits[client_ip]) >= RATE_LIMIT_MAX_REQUESTS:
        return {
            "status": "CHAT",
            "message": "⚠️ **Rate Limit Exceeded**\n\nI'm so glad you're finding this helpful! To ensure fair usage for everyone, you've reached the limit for AI scoping right now. You can still browse all our specialists directly.",
            "chips": ["Understood"]
        }
        
    ai_rate_limits[client_ip].append(current_time)

    history = payload.get("messages", [])
    
    system_content = (
        "You are an expert Construction Project Manager in India scoping a user's project. "
        "CRITICAL INSTRUCTION: You must respond ONLY with a valid JSON object. No conversational preamble. No markdown outside the JSON. "
        "STRATEGY: Ask EXACTLY ONE question per turn. Provide 3-4 short option chips. Stop asking after 2-3 questions. "
        "FORMAT 1 - Asking a question:\n"
        "{\n"
        '  "status": "QUESTION",\n'
        '  "message": "Is this an indoor or outdoor project?",\n'
        '  "chips": ["Indoor", "Outdoor", "Both"]\n'
        "}\n\n"
        "FORMAT 2 - Final Estimate (when you have enough info):\n"
        "{\n"
        '  "status": "READY",\n'
        '  "trade": "Carpenter",\n'
        '  "estimated_cost_inr": 2500,\n'
        '  "summary": "Wooden sofa leg replacement."\n'
        "}\n"
    )
    
    # Filter out previous system messages to replace with the fresh strict one
    clean_history = [m for m in history if m.get('role') != 'system']
    clean_history.insert(0, {"role": "system", "content": system_content})
    
    ai_raw = await ai_service.get_chat_response(clean_history)
    
    try:
        # Robust JSON Extraction
        start = ai_raw.find("{")
        end = ai_raw.rfind("}") + 1
        if start == -1 or end == 0:
            raise ValueError("No JSON block found")
            
        json_str = ai_raw[start:end]
        data = json.loads(json_str)
        
        if data.get("status") == "READY":
            trade = data.get("trade", "Contracting")
            cost = data.get("estimated_cost_inr", 1500)
            
            # Ensure cost is a valid integer
            try:
                cost = int(cost)
            except:
                cost = 1500

            # Specialist Matchmaking (Broadened filter for better matches)
            # If trade is highly specific, we might get 0 results. Let's do a broader search.
            filter_str = f"contains(cr034_specialty, '{trade}')"
            endpoint = f"cr034_specialists?$top=5&$filter={filter_str}&$orderby=cr034_rating desc"
            
            dv_data = await dataverse_service.get_data(endpoint)
            workers_list = dv_data.get("value", [])
            
            # Fallback if no exact trade match: just get top rated workers
            if not workers_list:
                endpoint = f"cr034_specialists?$top=3&$orderby=cr034_rating desc"
                dv_data = await dataverse_service.get_data(endpoint)
                workers_list = dv_data.get("value", [])
            
            mapped = []
            for w in workers_list[:3]: # Ensure max 3
                mapped.append({
                    "id": w.get("cr034_specialistid"),
                    "name": w.get("cr034_name"),
                    "specialty": w.get("cr034_specialty", trade),
                    "rate": int(float(w.get("cr034_hourlyrate") or 350)),
                    "rating": w.get("cr034_rating") or 4.5,
                    "image": "/assets/images/worker_rajesh_kumar.png"
                })
            
            return {
                "status": "READY",
                "message": "Project scoped! Here is my assessment and some recommended specialists.",
                "estimate": {
                    "trade": trade,
                    "estimated_cost_inr": cost,
                    "summary": data.get("summary", "Project assessment complete.")
                },
                "specialists": mapped
            }
        else:
            # Enforce fallbacks if AI misses required fields
            return {
                "status": "QUESTION",
                "message": data.get("message", "Could you provide more details?"),
                "chips": data.get("chips", ["Yes", "No", "Explain further"])
            }
            
    except Exception as e:
        print(f"AI Parse Error: {e} | Raw: {ai_raw}")
        # Very resilient fallback: Try to extract a question from the raw text
        sentences = ai_raw.split('?')
        first_q = sentences[0] + '?' if len(sentences) > 1 else "Could you elaborate on that?"
        
        return {
            "status": "QUESTION",
            "message": first_q.replace('\n', ' ').strip()[:150], # Ensure it's short
            "chips": ["Standard Repair", "Replacement", "Inspection needed"]
        }

@app.get("/api/admin/schema/{table_name}")
async def get_table_schema(table_name: str):
    if not dataverse_service.configured:
        return {"error": "Not configured"}
    try:
        data = await dataverse_service.get_data(f"EntityDefinitions(LogicalName='{table_name}')/Attributes")
        return {"columns": [attr.get("LogicalName") for attr in data.get("value", [])]}
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
