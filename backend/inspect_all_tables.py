import asyncio
import os
import sys
from dotenv import load_dotenv

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
load_dotenv()

from app.services.dataverse_service import dataverse_service

async def inspect_all():
    tables = ["cr03_Leads", "cr034_leads", "cr034_Messages", "cr034_messages", "cr034_auditLogs", "cr034_auditlogs", "cr034_specialist"]
    print("\n🔍 --- DATAVERSE INFRASTRUCTURE AUDIT ---")
    
    for table in tables:
        try:
            endpoint = f"EntityDefinitions(LogicalName='{table.lower()}')/Attributes?$select=LogicalName"
            r = await dataverse_service.get_data(endpoint)
            if 'value' in r:
                cols = [a['LogicalName'] for a in r['value']]
                print(f"\n✅ TABLE FOUND: {table}")
                print(f"   Columns: {', '.join(cols[:15])}...")
            else:
                print(f"\n❌ TABLE NOT FOUND: {table}")
        except Exception:
            print(f"\n❌ TABLE NOT FOUND: {table}")

if __name__ == "__main__":
    asyncio.run(inspect_all())
