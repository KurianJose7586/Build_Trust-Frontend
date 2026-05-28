import pandas as pd
import asyncio
import os
import sys
from dotenv import load_dotenv
from app.services.dataverse_service import DataverseService

load_dotenv()

# Configuration
CSV_PATH = "../Hire_Worker_CRM_Migration_Sample_100000.csv"
CHUNK_SIZE = 100  # Number of records to push at once
TABLE_NAME = "bt_specialists"  # Update this to match your Dataverse table name

async def migrate_data():
    if not os.path.exists(CSV_PATH):
        print(f"Error: CSV file not found at {CSV_PATH}")
        return

    service = DataverseService()
    if not service.configured:
        print("Error: Dataverse service not configured. check .env")
        return

    print(f"Starting migration from {CSV_PATH} to Dataverse...")

    # Mapping CSV columns to Dataverse columns
    # Adjust 'bt_' prefixes to match your actual schema
    column_mapping = {
        "worker_name": "bt_name",
        "primary_skill": "bt_specialty",
        "worker_email": "bt_email",
        "worker_city": "bt_location",
        "hourly_rate": "bt_rate",
        "rating": "bt_rating",
        "worker_verification_status": "bt_verified"
    }

    try:
        # Read CSV in chunks
        chunk_count = 0
        total_migrated = 0
        
        for chunk in pd.read_csv(CSV_PATH, chunksize=CHUNK_SIZE):
            chunk_count += 1
            print(f"Processing batch {chunk_count} ({len(chunk)} records)...")
            
            for index, row in chunk.iterrows():
                # Data Cleaning & Transformation
                data = {
                    "bt_name": str(row["worker_name"]),
                    "bt_specialty": str(row["primary_skill"]),
                    "bt_email": str(row["worker_email"]),
                    "bt_location": str(row["worker_city"]),
                    "bt_rate": float(row["hourly_rate"]),
                    "bt_rating": float(row["rating"]),
                    "bt_verified": True if str(row["worker_verification_status"]) == "Verified" else False
                }
                
                try:
                    # In a real migration, we'd use a Batch API for speed.
                    # For this step, we'll do individual POSTs to ensure accuracy.
                    await service.post_data(TABLE_NAME, data)
                    total_migrated += 1
                except Exception as e:
                    print(f"  [!] Failed to migrate row {index}: {e}")
            
            print(f"Batch {chunk_count} completed. Total migrated: {total_migrated}")
            
            # For the first test, let's just do 1 chunk (100 records)
            if chunk_count >= 1:
                print("Test migration of 100 records finished successfully.")
                break

    except Exception as e:
        print(f"Migration failed: {e}")

if __name__ == "__main__":
    asyncio.run(migrate_data())
