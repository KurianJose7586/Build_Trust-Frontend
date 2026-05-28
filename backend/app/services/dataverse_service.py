import os
import msal
import httpx
from dotenv import load_dotenv

load_dotenv()

class DataverseService:
    def __init__(self):
        self.client_id = os.getenv("CLIENT_ID")
        self.client_secret = os.getenv("CLIENT_SECRET")
        self.tenant_id = os.getenv("TENANT_ID")
        self.authority = f"https://login.microsoftonline.com/{self.tenant_id}"
        self.resource = os.getenv("DATAVERSE_URL")
        self.scope = [f"{self.resource}/.default"]
        
        self.app = msal.ConfidentialClientApplication(
            self.client_id,
            authority=self.authority,
            client_credential=self.client_secret
        )

    async def get_access_token(self):
        result = self.app.acquire_token_silent(self.scope, account=None)
        if not result:
            result = self.app.acquire_token_for_client(scopes=self.scope)
        
        if "access_token" in result:
            return result["access_token"]
        else:
            raise Exception(f"Could not acquire token: {result.get('error_description')}")

    async def get_data(self, endpoint: str):
        token = await self.get_access_token()
        headers = {
            "Authorization": f"Bearer {token}",
            "OData-MaxVersion": "4.0",
            "OData-Version": "4.0",
            "Accept": "application/json",
            "Content-Type": "application/json; charset=utf-8"
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{self.resource}/api/data/v9.2/{endpoint}", headers=headers)
            response.raise_for_status()
            return response.json()

    async def post_data(self, endpoint: str, data: dict):
        token = await self.get_access_token()
        headers = {
            "Authorization": f"Bearer {token}",
            "OData-MaxVersion": "4.0",
            "OData-Version": "4.0",
            "Accept": "application/json",
            "Content-Type": "application/json; charset=utf-8"
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(f"{self.resource}/api/data/v9.2/{endpoint}", headers=headers, json=data)
            response.raise_for_status()
            return response.json() if response.status_code != 204 else None
