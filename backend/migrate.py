import pandas as pd
import asyncio
import os
import sys
from dotenv import load_dotenv
from app.services.dataverse_service import DataverseService

load_dotenv()

# Configuration
CSV_PATH = "../Hire_Worker_CRM_Migration_Sample_100000.csv"
CHUNK_SIZE = 100 
TABLE_NAME = "cr034_specialists" # Plural collection name

async def migrate_data():
    if not os.path.exists(CSV_PATH):
        print(f"Error: CSV file not found at {CSV_PATH}")
        return

    service = DataverseService()
    if not service.configured:
        print("Error: Dataverse service not configured. check .env")
        return

    print(f"Starting migration from {CSV_PATH} to Dataverse...")

    try:
        chunk_count = 0
        total_migrated = 0
        
        for chunk in pd.read_csv(CSV_PATH, chunksize=CHUNK_SIZE):
            chunk_count += 1
            print(f"Processing batch {chunk_count} ({len(chunk)} records)...")
            
            for index, row in chunk.iterrows():
                # FIX: Lowercasing all logical names for the Web API
                data = {
                    "cr034_name": str(row["worker_name"]),
                    "cr034_specialty": str(row["primary_skill"]),
                    "cr034_hourlyrate": int(row["hourly_rate"]),
                    "cr034_rating": float(row["rating"]),
                    "cr034_verified": True if str(row["worker_verification_status"]) == "Verified" else False
                }
                
                try:
                    await service.post_data(TABLE_NAME, data)
                    total_migrated += 1
                except Exception as e:
                    # The detailed error is now printed by the service
                    pass
            
            print(f"Batch {chunk_count} completed. Total migrated: {total_migrated}")
            
            if chunk_count >= 1:
                print("Test migration of 100 records finished.")
                break

    except Exception as e:
        print(f"Migration failed: {e}")

if __name__ == "__main__":
    asyncio.run(migrate_data())
