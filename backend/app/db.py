import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

class MongoDB:
    client: AsyncIOMotorClient = None
    db = None

db_connection = MongoDB()

async def connect_to_mongo():
    uri = os.getenv("MONGO_URI")
    db_name = os.getenv("DB_NAME", "BuildTrust")
    if not uri:
        print("WARNING: MONGO_URI not found. Database features will be disabled.")
        return
    
    db_connection.client = AsyncIOMotorClient(uri)
    db_connection.db = db_connection.client[db_name]
    print(f"Connected to MongoDB: {db_name}")

async def close_mongo_connection():
    if db_connection.client:
        db_connection.client.close()
        print("MongoDB connection closed.")

def get_database():
    return db_connection.db
