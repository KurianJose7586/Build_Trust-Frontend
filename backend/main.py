from dotenv import load_dotenv
import os

# CRUCIAL: Load .env before any other imports to ensure services get credentials
load_dotenv()

# DIAGNOSTICS: Check if keys are actually loaded
print("--- ENV DIAGNOSTICS ---")
print(f"Working Directory: {os.getcwd()}")
# Print all keys that start with R or O to see if there are typos
loaded_keys = [k for k in os.environ.keys() if k.startswith(('RESEND', 'OPEN', 'DATA'))]
print(f"Detected Keys: {loaded_keys}")
print(f"RESEND_API_KEY found: {'Yes' if os.getenv('RESEND_API_KEY') else 'No'}")
print("-----------------------")

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.services.dataverse_service import DataverseService
from app.services.ai.openrouter_service import ai_service
from app.services.auth_service import auth_service

app = FastAPI(title="Build_Trust CRM API")

# Enable CORS for the React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

dataverse_service = DataverseService()

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
        print(f"MOCK EVENT: {text}")
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
            filters.append(f"contains(cr034_name, '{text}')")
        if min_rating > 0:
            filters.append(f"cr034_rating ge {min_rating}")
        if max_rate < 1000000:
            filters.append(f"cr034_hourlyrate le {max_rate}")
        
        filter_str = " and ".join(filters)
        
        # OData Pagination - Simplified to avoid $skip issues in some CRM environments
        endpoint = f"cr034_specialists?$top={limit}"
        if filter_str:
            endpoint += f"&$filter={filter_str}"
            
        data = await dataverse_service.get_data(endpoint)
        workers = data.get("value", [])
        
        mapped_workers = []
        for w in workers:
            # Assign a random-ish image based on specialty for realism
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
                "reviewsCount": 10 + (int(w.get("cr034_hourlyrate", 0)) % 50), # Simulated for now
                "experience": 5 + (int(w.get("cr034_hourlyrate", 0)) % 10), # Simulated
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
        # Use OData aggregation or simple count queries
        # For simplicity in this prototype, we'll fetch the top count of each
        jobs_data = await dataverse_service.get_data("cr034_jobs?$count=true&$top=1")
        leads_data = await dataverse_service.get_data("cr034_leads?$count=true&$top=1")
        
        active_jobs = jobs_data.get("@odata.count", 0)
        pending_leads = leads_data.get("@odata.count", 0)

        return {
            "activeJobs": active_jobs,
            "pendingLeads": pending_leads,
            "completionRate": 88, # Hardcoded for now
            "onSchedule": active_jobs,
            "delayed": 0,
            "unverifiedCount": 12,
            "issuesCount": 1,
        }
    except Exception as e:
        print(f"Stats Fetch Error: {e}")
        return {"error": str(e)}

@app.get("/api/admin/live-ops")
async def get_live_ops():
    if not dataverse_service.configured:
        return []
    try:
        # Get latest 10 events
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
        # Map payload to the EXACT logical names discovered via the schema tool
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
        return {
            "status": "error", 
            "message": str(e)
        }

# --- CUSTOMER AUTHENTICATION (OTP FLOW) ---

@app.post("/api/auth/send-otp")
async def send_otp(request: dict):
    email = request.get("email")
    if not email:
        raise HTTPException(status_code=400, detail="Email is required")
    
    try:
        auth_service.generate_otp(email)
        return {"status": "success", "message": "OTP sent"}
    except Exception as e:
        msg = str(e)
        if "wait" in msg:
            return {"status": "error", "message": msg}
        raise HTTPException(status_code=500, detail=msg)

@app.post("/api/auth/verify-otp")
async def verify_otp(request: dict):
    email = request.get("email")
    code = request.get("code")
    
    if not email or not code:
        raise HTTPException(status_code=400, detail="Email and code are required")
    
    success, result = auth_service.verify_otp(email, code)
    
    if not success:
        return {"status": "error", "message": result}
    
    return {
        "status": "success", 
        "token": result, 
        "user": {"email": email}
    }

# --- REAL CHAT SYSTEM (DATAVERSE PERSISTENT) ---

@app.get("/api/chat/{worker_id}")
async def get_chat_history(worker_id: str, customer_email: str):
    if not dataverse_service.configured:
        return []

    try:
        # Filter by both worker and customer to get the private thread
        filter_str = f"cr034_workerid eq '{worker_id}' and cr034_customerid eq '{customer_email}'"
        endpoint = f"cr034_messages?$filter={filter_str}&$orderby=createdon asc"

        data = await dataverse_service.get_data(endpoint)
        msgs = data.get("value", [])

        return [{
            "sender": m.get("cr034_sender"),
            "text": m.get("cr034_content"),
            "time": m.get("createdon")
        } for m in msgs]
    except Exception as e:
        print(f"Chat Fetch Error: {e}")
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

@app.get("/api/admin/schema/{table_name}")
async def get_table_schema(table_name: str):
    if not dataverse_service.configured:
        return {"error": "Not configured"}
    try:
        data = await dataverse_service.get_data(f"EntityDefinitions(LogicalName='{table_name}')/Attributes")
        return {"columns": [attr.get("LogicalName") for attr in data.get("value", [])]}
    except Exception as e:
        return {"error": str(e)}

@app.post("/api/ai/estimate")
async def get_ai_estimate(project_data: dict):
    description = project_data.get("description", "")
    if not description:
        raise HTTPException(status_code=400, detail="Description is required")
    
    estimate = await ai_service.get_cost_estimate(description)
    return estimate

if __name__ == "__main__":
    import uvicorn
    # Use 8001 regardless of .env to avoid collision with Vite on 8000
    uvicorn.run(app, host="0.0.0.0", port=8001)
