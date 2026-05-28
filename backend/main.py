from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv
from app.services.dataverse_service import DataverseService
from app.services.ai.gemini_service import ai_service

load_dotenv()

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
        "message": "Welcome to Build_Trust CRM API",
        "database": "Dataverse",
        "status": "Configured" if dataverse_service.configured else "Credentials Missing",
        "ai_status": "Active" if ai_service.configured else "Key Missing"
    }

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
        
        # OData Pagination parameters
        skip = (page - 1) * limit
        endpoint = f"cr034_specialists?$top={limit}&$skip={skip}"
        if filter_str:
            endpoint += f"&$filter={filter_str}"
            
        data = await dataverse_service.get_data(endpoint)
        workers = data.get("value", [])
        
        mapped_workers = []
        for w in workers:
            mapped_workers.append({
                "id": w.get("cr034_specialistid"), 
                "name": w.get("cr034_name"),
                "specialty": w.get("cr034_specialty"),
                "rate": w.get("cr034_hourlyrate"),
                "rating": w.get("cr034_rating"),
                "verified": w.get("cr034_verified"),
                "location": "India",
                "tags": [w.get("cr034_specialty")] # Default tag
            })
        return mapped_workers
    except Exception as e:
        return {"error": str(e), "fallback": MOCK_WORKERS}

@app.get("/api/admin/stats")
async def get_admin_stats():
    # Return mock or implement Dataverse aggregation
    return {
        "activeJobs": 124,
        "pendingLeads": 42,
        "completionRate": 80,
        "onSchedule": 102,
        "delayed": 22,
        "unverifiedCount": 14,
        "issuesCount": 2,
        "liveOps": []
    }

@app.post("/api/leads")
async def create_lead(lead_data: dict):
    if not dataverse_service.configured:
        return {"status": "mock_success", "data": lead_data}
    
    try:
        await dataverse_service.post_data("cr034_leads", lead_data)
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/jobs")
async def create_job(job_data: dict):
    if not dataverse_service.configured:
        return {"status": "mock_success", "data": job_data}
    
    try:
        dv_payload = {
            "cr034_name": f"Job: {job_data.get('workerName')}",
            "cr034_description": job_data.get("description"),
            "cr034_address": job_data.get("address"),
            "cr034_hours": job_data.get("hours"),
            "cr034_totalcost": job_data.get("totalCost"),
            "cr034_priority": job_data.get("priority")
        }
        await dataverse_service.post_data("cr034_jobs", dv_payload)
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ai/estimate")
async def get_ai_estimate(project_data: dict):
    description = project_data.get("description", "")
    if not description:
        raise HTTPException(status_code=400, detail="Description is required")
    
    estimate = await ai_service.get_cost_estimate(description)
    return estimate

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
