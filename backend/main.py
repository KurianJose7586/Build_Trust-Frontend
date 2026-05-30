from dotenv import load_dotenv
import os
import json
import time
from collections import defaultdict
from typing import List, Optional

# CRUCIAL: Load .env before any other imports to ensure services get credentials
dotenv_path = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(dotenv_path)

from fastapi import FastAPI, Depends, HTTPException, Request, BackgroundTasks, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.services.dataverse_service import dataverse_service
from app.services.ai.openrouter_service import ai_service
from app.services.auth_service import auth_service, get_current_user
from app.services.user_db import user_db # New local fallback DB
from app.schemas import (
    LeadCreate, JobCreate, ChatMessageCreate, 
    OtpRequest, OtpVerify, CheckEmailRequest, 
    LoginPasswordRequest, RegisterRequest
)

app = FastAPI(title="Build_Trust CRM API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- EXTREME ADMIN BYPASS MIDDLEWARE ---
@app.middleware("http")
async def admin_bypass_middleware(request: Request, call_next):
    # Log every single incoming request
    print(f"🌐 [{request.method}] {request.url.path}")
    
    # INTERCEPT ADMIN LOGIN BEFORE ROUTING
    if request.url.path == "/api/auth/login-password" and request.method == "POST":
        try:
            body = await request.json()
            email = body.get("email", "").lower().strip()
            password = body.get("password", "")
            
            if email == "admin@buildtrust.com" and password == "1234@":
                print("🚨 MIDDLEWARE: Admin bypass triggered!")
                token = auth_service.create_access_token(email)
                return JSONResponse(content={
                    "status": "success", 
                    "token": token, 
                    "user": {"email": email, "role": "admin", "name": "Vikram Singh"}
                })
        except Exception:
            pass # Continue to normal routing if body isn't JSON or admin
            
    response = await call_next(request)
    return response

@app.on_event("startup")
async def startup_diagnostics():
    print("\n" + "="*40)
    print("🚀 BUILD_TRUST BACKEND ONLINE (PORT 8005)")
    print("="*40 + "\n")

# --- AUTHENTICATION ROUTES ---

@app.post("/api/auth/check-email")
async def check_email(request: CheckEmailRequest):
    email = request.email.lower().strip()
    if email == "admin@buildtrust.com":
        return {"exists": True, "role": "admin"}
    
    # CHECK LOCAL DB FIRST (Most likely for normal users/new registrations)
    local_user = user_db.get_user(email)
    if local_user:
        return {"exists": True, "role": local_user.get("role", "customer")}

    if not dataverse_service.configured: return {"exists": False}
    
    try:
        # Check Specialists collection in Dataverse
        spec_data = await dataverse_service.get_data(f"cr034_specialists?$filter=cr034_email eq '{email}'")
        if spec_data.get("value"):
            return {"exists": True, "role": "specialist"}
        return {"exists": False}
    except Exception as e:
        print(f"AUTH_ERR: check-email Dataverse lookup failed (Schema issue?), using False: {e}")
        return {"exists": False}

@app.post("/api/auth/login-password")
async def login_password(request: LoginPasswordRequest):
    email = request.email.lower().strip()
    
    # CHECK LOCAL DB FIRST
    local_user = user_db.get_user(email)
    if local_user:
        if auth_service.verify_password(request.password, local_user.get("password_hash")):
            token = auth_service.create_access_token(email)
            return {
                "status": "success", 
                "token": token, 
                "user": {"email": email, "role": local_user.get("role"), "name": local_user.get("name")}
            }
        else:
            raise HTTPException(status_code=401, detail="Invalid password")

    if not dataverse_service.configured:
        raise HTTPException(status_code=401, detail="User not found (Dataverse Offline)")
    
    try:
        data = await dataverse_service.get_data(f"cr034_specialists?$filter=cr034_email eq '{email}'")
        users = data.get("value", [])
        if not users: raise HTTPException(status_code=401, detail="User not found")
        
        user = users[0]
        hashed_pwd = user.get("cr034_password")
        if not hashed_pwd or not auth_service.verify_password(request.password, hashed_pwd):
            raise HTTPException(status_code=401, detail="Invalid password")
        
        token = auth_service.create_access_token(email)
        return {"status": "success", "token": token, "user": {"email": email, "role": "specialist", "name": user.get("cr034_name")}}
    except Exception: raise HTTPException(status_code=401, detail="Authentication failed")

@app.post("/api/auth/register")
async def register_user(request: RegisterRequest):
    email = request.email.lower().strip()
    hashed_pwd = auth_service.get_password_hash(request.password)
    
    # 1. SAVE LOCALLY (Ensures registration ALWAYS works even if Dataverse schema is broken)
    user_db.create_user(email, hashed_pwd, request.role, request.fullName)
    print(f"AUTH: User [{email}] registered in local storage.")

    # 2. ATTEMPT TO SYNC TO DATAVERSE (Background best-effort)
    if dataverse_service.configured:
        try:
            payload = {
                "cr034_name": request.fullName,
                "cr034_email": email,
                "cr034_password": hashed_pwd,
                "cr034_specialty": request.specialty or ("Customer" if request.role == 'customer' else "General"),
                "cr034_hourlyrate": request.rate or 300,
                "cr034_verified": request.role == 'customer'
            }
            await dataverse_service.post_data("cr034_specialists", payload)
            print(f"AUTH: User [{email}] synced to Dataverse.")
        except Exception as e:
            print(f"AUTH_WARN: Dataverse sync failed (likely schema issue), but local account is active: {e}")

    token = auth_service.create_access_token(email)
    return {
        "status": "success", 
        "token": token, 
        "user": {"email": email, "role": request.role, "name": request.fullName}
    }

@app.post("/api/auth/send-otp")
async def send_otp(request: OtpRequest):
    email = request.email.lower().strip()
    if email == "admin@buildtrust.com":
        return {"status": "error", "message": "Admin must use password login."}
    try:
        await auth_service.generate_otp(email)
        return {"status": "success"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.post("/api/auth/verify-otp")
async def verify_otp(request: OtpVerify):
    success, result = await auth_service.verify_otp(request.email, request.code)
    if not success:
        return {"status": "error", "message": result}
    
    return {"status": "success", "token": result, "user": {"email": request.email}}

# --- WORKER & ADMIN ROUTES ---

@app.get("/api/workers")
async def get_workers(category: str = "All", text: str = "", limit: int = 20):
    # Mock Data for fallback
    MOCK_WORKERS = [
        {"id": "rajesh-kumar", "name": "Rajesh Kumar", "specialty": "Masonry", "rating": 4.9, "verified": True, "image": "/assets/images/worker_rajesh_kumar.png", "about": "Professional specialist."},
        {"id": "manish-sharma", "name": "Manish Sharma", "specialty": "Electrical", "rating": 4.9, "verified": True, "image": "/assets/images/worker_marcus_thorne.png", "about": "Professional specialist."}
    ]
    if not dataverse_service.configured:
        filtered = MOCK_WORKERS
        if category != "All": filtered = [w for w in filtered if w.get("specialty") == category]
        return filtered[0:limit]
    
    try:
        filters = []
        if category != "All": filters.append(f"cr034_specialty eq '{category}'")
        if text:
            s_text = text.replace("'", "''")
            filters.append(f"(contains(cr034_name, '{s_text}') or contains(cr034_specialty, '{s_text}'))")
        
        filter_str = " and ".join(filters)
        endpoint = f"cr034_specialists?$top={limit}"
        if filter_str: endpoint += f"&$filter={filter_str}"
            
        data = await dataverse_service.get_data(endpoint)
        workers = data.get("value", [])
        return [{
            "id": w.get("cr034_specialistid"), "name": w.get("cr034_name"), "specialty": w.get("cr034_specialty", "General"),
            "rate": w.get("cr034_hourlyrate") or 300, "rating": w.get("cr034_rating") or 4.0, "verified": w.get("cr034_verified") or False,
            "image": "/assets/images/worker_rajesh_kumar.png", "about": "Professional specialist."
        } for w in workers]
    except Exception: return MOCK_WORKERS

@app.get("/api/admin/stats")
async def get_admin_stats(user: dict = Depends(get_current_user)):
    if not dataverse_service.configured: return {"activeJobs": 124, "pendingLeads": 42, "completionRate": 80}
    try:
        jobs = await dataverse_service.get_data("cr034_jobs?$count=true&$top=1")
        leads = await dataverse_service.get_data("cr034_leads?$count=true&$top=1")
        return {"activeJobs": jobs.get("@odata.count", 0), "pendingLeads": leads.get("@odata.count", 0), "completionRate": 88}
    except Exception: return {"activeJobs": 0, "pendingLeads": 0}

@app.get("/api/admin/live-ops")
async def get_live_ops(user: dict = Depends(get_current_user)):
    if not dataverse_service.configured: return []
    try:
        data = await dataverse_service.get_data("cr034_auditlogs?$top=10&$orderby=createdon desc")
        return [{
            "id": e.get("cr034_auditlogid"), "text": e.get("cr034_eventtext"), "time": "Just now", 
            "type": e.get("cr034_eventtype"), "icon": e.get("cr034_eventicon"), "color": e.get("cr034_eventcolor")
        } for e in data.get("value", [])]
    except Exception: return []

@app.post("/api/leads")
async def create_lead(lead: LeadCreate, background_tasks: BackgroundTasks, user: dict = Depends(get_current_user)):
    if not dataverse_service.configured: return {"status": "success"}
    try:
        dv_payload = {"cr034_name": lead.title, "cr034_category": lead.category, "cr034_location": lead.location, "cr034_budget": lead.budget, "cr034_description": lead.desc}
        await dataverse_service.post_data("cr034_leads", dv_payload)
        return {"status": "success"}
    except Exception: raise HTTPException(status_code=500)

@app.post("/api/jobs")
async def create_job(job: JobCreate, background_tasks: BackgroundTasks, user: dict = Depends(get_current_user)):
    if not dataverse_service.configured: return {"status": "success"}
    try:
        dv_payload = {"cr034_specialist": job.workerName, "cr034_description": job.description, "cr034_address": job.address, "cr034_hours": job.hours, "cr034_totalcost": job.totalCost, "cr034_scheduleddate": job.date}
        await dataverse_service.post_data("cr034_jobs", dv_payload)
        return {"status": "success"}
    except Exception: return {"status": "error"}

@app.get("/api/chat/{worker_id}")
async def get_chat_history(worker_id: str, user: dict = Depends(get_current_user)):
    if not dataverse_service.configured: return []
    try:
        filter_str = f"cr034_workerid eq '{worker_id}' and cr034_customerid eq '{user['email']}'"
        data = await dataverse_service.get_data(f"cr034_messages?$filter={filter_str}&$orderby=createdon asc")
        return [{"sender": m.get("cr034_sender"), "text": m.get("cr034_content"), "time": m.get("createdon")} for m in data.get("value", [])]
    except Exception: return []

@app.post("/api/chat")
async def send_chat_message(msg: ChatMessageCreate, user: dict = Depends(get_current_user)):
    if not dataverse_service.configured: return {"status": "success"}
    try:
        dv_payload = {"cr034_sender": "client", "cr034_content": msg.text, "cr034_workerid": msg.workerId, "cr034_customerid": user['email']}
        await dataverse_service.post_data("cr034_messages", dv_payload)
        return {"status": "success"}
    except Exception: raise HTTPException(status_code=500)

@app.post("/api/ai/agent")
async def ai_agent_chat(request: Request, payload: dict):
    history = payload.get("messages", [])
    system_content = "You are an expert Construction Project Manager in India. Respond ONLY with valid JSON."
    clean_history = [m for m in history if m.get('role') != 'system']
    clean_history.insert(0, {"role": "system", "content": system_content})
    ai_raw = await ai_service.get_chat_response(clean_history)
    try:
        start, end = ai_raw.find("{"), ai_raw.rfind("}") + 1
        data = json.loads(ai_raw[start:end])
        if data.get("status") == "READY":
            return {"status": "READY", "message": "Project scoped!", "estimate": {"estimated_cost_inr": 1500}, "specialists": []}
        return {"status": "QUESTION", "message": data.get("message", "More details?"), "chips": data.get("chips", ["Yes", "No"])}
    except Exception: return {"status": "QUESTION", "message": "Could you elaborate?", "chips": ["Repair", "New Install"]}

@app.get("/")
async def root():
    return {"message": "Build_Trust API is LIVE", "port": 8005}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8005)
