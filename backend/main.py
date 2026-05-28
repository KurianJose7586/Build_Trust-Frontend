from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv
from app.db import connect_to_mongo, close_mongo_connection, get_database

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

@app.on_event("startup")
async def startup_db_client():
    await connect_to_mongo()

@app.on_event("shutdown")
async def shutdown_db_client():
    await close_mongo_connection()

# Mock Data for fallback
MOCK_ADMIN_STATS = {
    "activeJobs": 124,
    "pendingLeads": 42,
    "completionRate": 80,
    "onSchedule": 102,
    "delayed": 22,
    "unverifiedCount": 14,
    "issuesCount": 2,
}

@app.get("/")
async def root():
    db = get_database()
    status = "Connected" if db is not None else "Disconnected"
    return {
        "message": "Welcome to Build_Trust CRM API",
        "database": "MongoDB",
        "status": status
    }

@app.get("/api/workers")
async def get_workers():
    db = get_database()
    if db is None:
        return {"error": "Database not connected"}
    
    try:
        workers = await db.workers.find().to_list(100)
        # Clean up Mongo's _id for JSON serializability
        for w in workers:
            w["_id"] = str(w["_id"])
        return workers
    except Exception as e:
        return {"error": str(e)}

@app.get("/api/admin/stats")
async def get_admin_stats():
    # For now, return mock or calculate from collections
    return MOCK_ADMIN_STATS

@app.post("/api/leads")
async def create_lead(lead_data: dict):
    db = get_database()
    if db is None:
        raise HTTPException(status_code=500, detail="Database not connected")
    
    try:
        result = await db.leads.insert_one(lead_data)
        return {"status": "success", "id": str(result.inserted_id)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
