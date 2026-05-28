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
TABLE_NAME = "cr034_specialists"  # Pluralized logical name

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
                # Data Mapping using your exact schema from @schema.png
                data = {
                    "cr034_Name": str(row["worker_name"]),
                    "cr034_Specialty": str(row["primary_skill"]),
                    "cr034_HourlyRate": int(row["hourly_rate"]), # 'Whole number' in schema
                    "cr034_Rating": float(row["rating"]),
                    "cr034_Verified": True if str(row["worker_verification_status"]) == "Verified" else False
                }
                
                try:
                    await service.post_data(TABLE_NAME, data)
                    total_migrated += 1
                except Exception as e:
                    print(f"  [!] Failed to migrate row {index}: {e}")
            
            print(f"Batch {chunk_count} completed. Total migrated: {total_migrated}")
            
            # Stop after 100 records for testing
            if chunk_count >= 1:
                print("Test migration of 100 records finished successfully.")
                break

    except Exception as e:
        print(f"Migration failed: {e}")

if __name__ == "__main__":
    asyncio.run(migrate_data())
