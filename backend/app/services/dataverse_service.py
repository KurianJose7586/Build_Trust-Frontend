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
        self.resource = os.getenv("DATAVERSE_URL")
        
        if not all([self.client_id, self.client_secret, self.tenant_id, self.resource]):
            self.configured = False
            return
            
        self.authority = f"https://login.microsoftonline.com/{self.tenant_id}"
        self.scope = [f"{self.resource}/.default"]
        self.configured = True
        
        self.app = msal.ConfidentialClientApplication(
            self.client_id,
            authority=self.authority,
            client_credential=self.client_secret
        )

    async def get_access_token(self):
        if not self.configured:
            raise Exception("Dataverse credentials not fully configured in .env")
        
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
            url = f"{self.resource.rstrip('/')}/api/data/v9.2/{endpoint}"
            response = await client.get(url, headers=headers)
            if response.status_code >= 400:
                print(f"DEBUG Error Response: {response.text}")
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
            url = f"{self.resource.rstrip('/')}/api/data/v9.2/{endpoint}"
            response = await client.post(url, headers=headers, json=data)
            if response.status_code >= 400:
                # This will help us see EXACTLY what Dataverse is complaining about
                print(f"DEBUG Error Body: {response.text}")
            response.raise_for_status()
            return response.json() if response.status_code != 204 else None
