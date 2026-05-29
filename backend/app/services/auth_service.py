import random
import jwt
import os
import datetime
import resend
from dotenv import load_dotenv

load_dotenv()

# Configuration
SECRET_KEY = os.getenv("JWT_SECRET", "buildtrust_local_secret_2026")
RESEND_API_KEY = os.getenv("RESEND_API_KEY")

if RESEND_API_KEY:
    resend.api_key = RESEND_API_KEY

class AuthService:
    def __init__(self):
        # In-memory store for OTPs: { email: {code: "123456", expires: datetime} }
        self.otp_store = {}

    def generate_otp(self, email: str):
        code = str(random.randint(100000, 999999))
        expiry = datetime.datetime.utcnow() + datetime.timedelta(minutes=10)
        self.otp_store[email] = {"code": code, "expires": expiry}
        
        # REAL EMAILER: Send via Resend
        if RESEND_API_KEY:
            try:
                params = {
                    "from": "Build_Trust <onboarding@resend.dev>",
                    "to": email,
                    "subject": f"{code} is your Build_Trust verification code",
                    "html": f"""
                    <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                        <h2 style="color: #1c2541;">Build_Trust CRM</h2>
                        <p>Namaste! Use the following code to verify your identity and complete your booking:</p>
                        <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #ff6f00; margin: 20px 0;">
                            {code}
                        </div>
                        <p style="font-size: 12px; color: #666;">This code will expire in 10 minutes. If you didn't request this, please ignore this email.</p>
                    </div>
                    """
                }
                resend.Emails.send(params)
                print(f"✅ Real OTP email sent to {email}")
            except Exception as e:
                print(f"❌ Failed to send real email: {e}. Falling back to terminal log.")
                self.print_mock_log(email, code)
        else:
            self.print_mock_log(email, code)
            
        return code

    def print_mock_log(self, email, code):
        print("\n" + "="*40)
        print(f"📧 [MOCK] EMAIL TO: {email}")
        print(f"🔢 YOUR OTP CODE: {code}")
        print("="*40 + "\n")

    def verify_otp(self, email: str, code: str):
        if email not in self.otp_store:
            return False, "No OTP requested for this email"
        
        stored_data = self.otp_store[email]
        
        if datetime.datetime.utcnow() > stored_data["expires"]:
            del self.otp_store[email]
            return False, "OTP has expired"
        
        if stored_data["code"] != code:
            return False, "Invalid OTP code"
        
        # Success! Clear OTP and generate token
        del self.otp_store[email]
        token = self.create_access_token(email)
        return True, token

    def create_access_token(self, email: str):
        payload = {
            "sub": email,
            "exp": datetime.datetime.utcnow() + datetime.timedelta(days=1),
            "iat": datetime.datetime.utcnow()
        }
        return jwt.encode(payload, SECRET_KEY, algorithm="HS256")

auth_service = AuthService()
