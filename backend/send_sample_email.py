import asyncio
import os
import sys
from dotenv import load_dotenv

# Set up paths to allow importing from app
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
load_dotenv()

from app.services.auth_service import auth_service

async def send_test_otp():
    target_email = "kurianjoseoff@gmail.com"
    print(f"🚀 Initializing Build_Trust Email Test...")
    print(f"📫 Target: {target_email}")
    
    try:
        # Generate and send the OTP using the new template
        code = await auth_service.generate_otp(target_email)
        print(f"✨ Success! Test code generated: {code}")
        print(f"📧 Please check the inbox of {target_email} to see the premium redesign.")
    except Exception as e:
        print(f"❌ Failed to send test email: {e}")

if __name__ == "__main__":
    asyncio.run(send_test_otp())
