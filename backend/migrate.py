import pandas as pd
import asyncio
import os
import sys
from dotenv import load_dotenv
from app.services.dataverse_service import DataverseService

load_dotenv()

# Configuration
CSV_PATH = "../Hire_Worker_CRM_Migration_Sample_100000.csv"
CHUNK_SIZE = 100  # Size of chunks for processing
TABLE_NAME = "cr034_specialists"

async def migrate_data():
    if not os.path.exists(CSV_PATH):
        print(f"Error: CSV file not found at {CSV_PATH}")
        return

    service = DataverseService()
    if not service.configured:
        print("Error: Dataverse service not configured. Check .env")
        return

    print(f"Starting FULL migration from {CSV_PATH} to Dataverse...")

    try:
        chunk_count = 0
        total_migrated = 0
        total_failed = 0
        
        # We use a context manager for the service if needed, but here we just reuse the instance
        for chunk in pd.read_csv(CSV_PATH, chunksize=CHUNK_SIZE):
            chunk_count += 1
            print(f"\n--- Processing Batch {chunk_count} ({total_migrated} already migrated) ---")
            
            # Use asyncio.gather for parallel requests within a chunk to speed things up
            tasks = []
            for _, row in chunk.iterrows():
                data = {
                    "cr034_name": str(row["worker_name"]),
                    "cr034_specialty": str(row["primary_skill"]),
                    "cr034_hourlyrate": int(row["hourly_rate"]),
                    "cr034_rating": float(row["rating"]),
                    "cr034_verified": True if str(row["worker_verification_status"]) == "Verified" else False
                }
                tasks.append(service.post_data(TABLE_NAME, data))
            
            # Execute chunk in parallel
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            for result in results:
                if isinstance(result, Exception):
                    total_failed += 1
                else:
                    total_migrated += 1
            
            print(f"Batch {chunk_count} summary: {total_migrated} success, {total_failed} failed.")

        print(f"\nMigration COMPLETE!")
        print(f"Final Stats: {total_migrated} successfully uploaded, {total_failed} failed.")

    except Exception as e:
        print(f"Migration aborted due to critical error: {e}")

if __name__ == "__main__":
    asyncio.run(migrate_data())
