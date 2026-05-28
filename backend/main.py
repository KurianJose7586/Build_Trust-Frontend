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

# Mock Data (copied from frontend mockData.js for convenience in development)
MOCK_WORKERS = [
    {
        "id": "rajesh-kumar",
        "name": "Rajesh Kumar",
        "specialty": "Masonry",
        "rating": 4.9,
        "verified": True,
        "location": "Greater Noida",
    },
    {
        "id": "manish-sharma",
        "name": "Manish Sharma",
        "specialty": "Electrical",
        "rating": 4.9,
        "verified": True,
        "location": "Delhi NCR",
    }
]

# Initialize service only if credentials are provided
DATAVERSE_CONFIGURED = all([
    os.getenv("CLIENT_ID"),
    os.getenv("CLIENT_SECRET"),
    os.getenv("TENANT_ID"),
    os.getenv("DATAVERSE_URL")
])

if DATAVERSE_CONFIGURED:
    dataverse_service = DataverseService()
else:
    dataverse_service = None
    print("WARNING: Dataverse credentials not found. Running in Mock Mode.")

@app.get("/")
async def root():
    return {
        "message": "Welcome to Build_Trust CRM API",
        "dataverse_status": "Connected" if DATAVERSE_CONFIGURED else "Mock Mode"
    }

@app.get("/api/workers")
async def get_workers():
    if not DATAVERSE_CONFIGURED:
        return MOCK_WORKERS
    
    try:
        data = await dataverse_service.get_data("bt_specialists")
        return data.get("value", [])
    except Exception as e:
        return {"error": str(e), "fallback": MOCK_WORKERS}

@app.post("/api/leads")
async def create_lead(lead_data: dict):
    if not DATAVERSE_CONFIGURED:
        print(f"MOCK: Received lead: {lead_data}")
        return {"status": "success", "mode": "mock", "data": lead_data}
    
    try:
        data = await dataverse_service.post_data("bt_leads", lead_data)
        return {"status": "success", "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
