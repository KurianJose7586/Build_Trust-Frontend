from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv
from app.services.dataverse_service import DataverseService

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
        "status": "Configured" if dataverse_service.configured else "Credentials Missing"
    }

@app.get("/api/workers")
async def get_workers():
    if not dataverse_service.configured:
        return MOCK_WORKERS
    
    try:
        # Using correct pluralized logical name
        data = await dataverse_service.get_data("cr034_specialists")
        workers = data.get("value", [])
        
        # Mapping Dataverse fields back to what the Frontend expects
        mapped_workers = []
        for w in workers:
            mapped_workers.append({
                "id": w.get("cr034_specialistid"), # Dataverse auto-generates this UUID
                "name": w.get("cr034_Name"),
                "specialty": w.get("cr034_Specialty"),
                "rate": w.get("cr034_HourlyRate"),
                "rating": w.get("cr034_Rating"),
                "verified": w.get("cr034_Verified"),
                "location": w.get("cr034_location", "India") # Default if not mapped yet
            })
        return mapped_workers
    except Exception as e:
        return {"error": str(e), "fallback": MOCK_WORKERS}

@app.post("/api/leads")
async def create_lead(lead_data: dict):
    if not dataverse_service.configured:
        return {"status": "mock_success", "data": lead_data}
    
    try:
        # Assuming you'll create a 'bt_leads' table later
        data = await dataverse_service.post_data("bt_leads", lead_data)
        return {"status": "success", "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
