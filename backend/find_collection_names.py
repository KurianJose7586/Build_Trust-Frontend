import asyncio
import os
import sys
from dotenv import load_dotenv

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
load_dotenv()

from app.services.dataverse_service import dataverse_service

async def find_entity_set_names():
    # Tables we need to find collection names for
    logical_names = ["cr034_specialist", "cr034_leads", "cr034_messages", "cr034_auditlogs", "cr034_otp_codes"]
    
    print("\n🛰️ --- DATAVERSE COLLECTION NAME FINDER ---")
    
    for name in logical_names:
        try:
            # Query the EntityDefinition to find the EntitySetName (the OData plural name)
            endpoint = f"EntityDefinitions(LogicalName='{name}')?$select=LogicalName,EntitySetName"
            r = await dataverse_service.get_data(endpoint)
            
            if 'EntitySetName' in r:
                print(f"✅ Logical: {r['LogicalName']}  ->  ODATA COLLECTION: {r['EntitySetName']}")
            else:
                print(f"❌ Could not find EntitySetName for: {name}")
        except Exception as e:
            print(f"❌ Error looking up {name}: {e}")

if __name__ == "__main__":
    asyncio.run(find_entity_set_names())
