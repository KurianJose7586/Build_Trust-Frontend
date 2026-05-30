import pandas as pd
import asyncio
import os
import sys
import csv
from dotenv import load_dotenv
from app.services.dataverse_service import DataverseService
from app.services.auth_service import auth_service

load_dotenv()

# Configuration
CSV_PATH = "../Hire_Worker_CRM_Migration_Sample_100000.csv"
ERROR_LOG_PATH = "migration_errors.csv"
CHUNK_SIZE = 50 # Smaller chunks for patch logic
TABLE_NAME = "cr034_specialists"

async def migrate_data():
    if not os.path.exists(CSV_PATH):
        print(f"Error: CSV file not found at {CSV_PATH}")
        return

    service = DataverseService()
    if not service.configured:
        print("Error: Dataverse service not configured. Check .env")
        return

    # 1. FETCH EXISTING MAPPING (Name -> GUID)
    # We match by Name because it's the only unique-ish field we have from the previous import
    print("📥 Fetching existing specialists from Dataverse for mapping...")
    existing_map = {}
    try:
        # Fetch in batches of 5000
        skip = 0
        while True:
            print(f"   - Loading existing records... (count: {len(existing_map)})")
            data = await service.get_data(f"{TABLE_NAME}?$select=cr034_specialistid,cr034_name&$skip={skip}&$top=5000")
            records = data.get("value", [])
            if not records: break
            for r in records:
                # Store Name as key, GUID as value
                existing_map[r['cr034_name']] = r['cr034_specialistid']
            skip += 5000
            if len(records) < 5000: break
    except Exception as e:
        print(f"⚠️ Warning: Could not load full mapping. Proceeding with partial data: {e}")

    print(f"✅ Mapping Complete. Found {len(existing_map)} existing records.")

    # Prepare Error Log
    error_file = open(ERROR_LOG_PATH, "a", newline="", encoding="utf-8")
    error_writer = csv.writer(error_file)
    if os.path.getsize(ERROR_LOG_PATH) == 0:
        error_writer.writerow(["index", "worker_name", "action", "error"])

    print(f"🚀 Starting SMART UPSERT Migration. Errors logged to {ERROR_LOG_PATH}")

    try:
        chunk_count = 0
        total_updated = 0
        total_created = 0
        total_failed = 0
        
        for chunk in pd.read_csv(CSV_PATH, chunksize=CHUNK_SIZE):
            chunk_count += 1
            tasks = []
            rows_meta = []
            
            for idx, row in chunk.iterrows():
                worker_name = str(row["worker_name"])
                worker_email = str(row["worker_email"]).lower().strip()
                worker_id = str(row["legacy_worker_id"])
                
                # Default Password Pattern: Name@ID
                raw_password = f"{worker_name.split(' ')[0]}@{worker_id}"
                hashed_password = auth_service.get_password_hash(raw_password)

                payload = {
                    "cr034_name": worker_name,
                    "cr034_email": worker_email,
                    "cr034_password": hashed_password,
                    "cr034_specialty": str(row["primary_skill"]),
                    "cr034_hourlyrate": int(row["hourly_rate"]),
                    "cr034_rating": float(row["rating"]),
                    "cr034_verified": True if str(row["worker_verification_status"]) == "Verified" else False
                }

                # DECIDE: PATCH (Update) or POST (Create)
                guid = existing_map.get(worker_name)
                if guid:
                    # Update existing record
                    tasks.append(service.patch_data(f"{TABLE_NAME}({guid})", payload))
                    rows_meta.append({"name": worker_name, "idx": idx, "action": "UPDATE"})
                else:
                    # Create new record
                    tasks.append(service.post_data(TABLE_NAME, payload))
                    rows_meta.append({"name": worker_name, "idx": idx, "action": "CREATE"})
            
            # Execute batch
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            for i, result in enumerate(results):
                meta = rows_meta[i]
                if isinstance(result, Exception):
                    total_failed += 1
                    error_writer.writerow([meta["idx"], meta["name"], meta["action"], str(result)])
                else:
                    if meta["action"] == "UPDATE": total_updated += 1
                    else: total_created += 1
            
            print(f"Batch {chunk_count}: {total_updated} updated, {total_created} created, {total_failed} failed.")
            error_file.flush()

    except Exception as e:
        print(f"Migration critical failure: {e}")
    finally:
        error_file.close()
        print(f"\nMigration Ended. {total_updated} records updated, {total_created} new records added.")

if __name__ == "__main__":
    asyncio.run(migrate_data())
