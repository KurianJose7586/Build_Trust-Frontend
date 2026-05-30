import asyncio
import os
import sys
from dotenv import load_dotenv

# Set up paths
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
load_dotenv()

from app.services.dataverse_service import dataverse_service

async def get_columns():
    try:
        endpoint = "EntityDefinitions(LogicalName='cr034_otp_codes')/Attributes?$select=LogicalName"
        print(f"Requesting: {endpoint}")
        r = await dataverse_service.get_data(endpoint)
        
        if 'value' in r:
            cols = sorted([a['LogicalName'] for a in r['value']])
            print("\n✅ DATAVERSE COLUMNS FOUND:")
            print(", ".join(cols))
        else:
            print("❌ Unexpected response format:", r)
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    asyncio.run(get_columns())
