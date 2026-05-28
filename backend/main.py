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
    allow_origins=["*"],  # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

dataverse_service = DataverseService()

@app.get("/")
async def root():
    return {"message": "Welcome to Build_Trust CRM API"}

@app.get("/api/workers")
async def get_workers():
    try:
        # Assuming there is a 'bt_specialists' table in Dataverse
        # You'll need to adjust the table name based on your Dataverse schema
        data = await dataverse_service.get_data("bt_specialists")
        return data
    except Exception as e:
        # Fallback to mock data if Dataverse is not configured or fails
        # In a real app, you might want to log this error
        return {"error": str(e), "message": "Could not fetch from Dataverse. Check configuration."}

@app.post("/api/leads")
async def create_lead(lead_data: dict):
    try:
        data = await dataverse_service.post_data("bt_leads", lead_data)
        return {"status": "success", "data": data}
    except Exception as e:
        return {"error": str(e), "message": "Could not post lead to Dataverse."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
