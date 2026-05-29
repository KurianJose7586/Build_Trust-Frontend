import pandas as pd
import asyncio
import os
import sys
import csv
from dotenv import load_dotenv
from app.services.dataverse_service import DataverseService

load_dotenv()

# Configuration
CSV_PATH = "../Hire_Worker_CRM_Migration_Sample_100000.csv"
ERROR_LOG_PATH = "migration_errors.csv"
CHUNK_SIZE = 100 
TABLE_NAME = "cr034_specialists"

async def migrate_data():
    if not os.path.exists(CSV_PATH):
        print(f"Error: CSV file not found at {CSV_PATH}")
        return

    service = DataverseService()
    if not service.configured:
        print("Error: Dataverse service not configured. Check .env")
        return

    # Prepare Error Log
    error_file = open(ERROR_LOG_PATH, "a", newline="", encoding="utf-8")
    error_writer = csv.writer(error_file)
    # Write header only if file is new
    if os.path.getsize(ERROR_LOG_PATH) == 0:
        error_writer.writerow(["index", "worker_name", "error"])

    print(f"Starting Robust migration. Errors will be logged to {ERROR_LOG_PATH}")

    try:
        chunk_count = 0
        total_migrated = 0
        total_failed = 0
        
        for chunk in pd.read_csv(CSV_PATH, chunksize=CHUNK_SIZE):
            chunk_count += 1
            print(f"\n--- Processing Batch {chunk_count} ---")
            
            tasks = []
            rows_data = []
            for idx, row in chunk.iterrows():
                data = {
                    "cr034_name": str(row["worker_name"]),
                    "cr034_specialty": str(row["primary_skill"]),
                    "cr034_hourlyrate": int(row["hourly_rate"]),
                    "cr034_rating": float(row["rating"]),
                    "cr034_verified": True if str(row["worker_verification_status"]) == "Verified" else False
                }
                tasks.append(service.post_data(TABLE_NAME, data))
                rows_data.append((idx, row["worker_name"]))
            
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            for i, result in enumerate(results):
                if isinstance(result, Exception):
                    total_failed += 1
                    error_writer.writerow([rows_data[i][0], rows_data[i][1], str(result)])
                    error_file.flush() # Ensure it's written immediately
                else:
                    total_migrated += 1
            
            print(f"Summary: {total_migrated} success, {total_failed} failed.")

    except Exception as e:
        print(f"Migration critical failure: {e}")
    finally:
        error_file.close()
        print(f"\nMigration Session Ended. Check {ERROR_LOG_PATH} for details on failures.")

if __name__ == "__main__":
    asyncio.run(migrate_data())
