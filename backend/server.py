from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timedelta
import jwt
from passlib.context import CryptContext
import re

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Security
SECRET_KEY = "notez-fun-secret-key-2024"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 7
OWNER_PASSWORD = "onlyOwner12$"

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# Create the main app without a prefix
app = FastAPI(title="NOTEZ FUN API", description="Complete page building platform")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Pydantic Models
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str
    remember_me: bool = False

class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    username: str
    email: EmailStr
    password_hash: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class PageCreate(BaseModel):
    pagename: str
    title: str
    short_description: str
    long_description: str

class Page(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    pagename: str
    title: str
    short_description: str
    long_description: str
    view_count: int = 0
    is_maintenance: bool = False
    is_suspended: bool = False
    suspension_reason: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class PageUpdate(BaseModel):
    title: Optional[str] = None
    short_description: Optional[str] = None
    long_description: Optional[str] = None
    is_maintenance: Optional[bool] = None

class Feedback(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    page_id: str
    user_id: str
    username: str
    message: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class FeedbackCreate(BaseModel):
    page_id: str
    message: str

class Notification(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    type: str  # "feedback" or "suspension"
    title: str
    message: str
    is_read: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)

class OwnerLogin(BaseModel):
    password: str

class SuspendPage(BaseModel):
    page_id: str
    reason: str

# Auth Helper Functions
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def validate_password(password: str):
    if len(password) < 6:
        return False
    if not re.search(r"[A-Z]", password):
        return False
    if not re.search(r"\d", password):
        return False
    return True

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        user = await db.users.find_one({"id": user_id})
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        return User(**user)
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_current_user_optional(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        if credentials is None:
            return None
        return await get_current_user(credentials)
    except:
        return None

# Authentication Routes
@api_router.post("/register")
async def register(user_data: UserCreate):
    # Validate password
    if not validate_password(user_data.password):
        raise HTTPException(
            status_code=400, 
            detail="Password must be at least 6 characters with 1 uppercase letter and 1 number"
        )
    
    # Check if user exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    existing_username = await db.users.find_one({"username": user_data.username})
    if existing_username:
        raise HTTPException(status_code=400, detail="Username already taken")
    
    # Create user
    password_hash = get_password_hash(user_data.password)
    user = User(
        username=user_data.username,
        email=user_data.email,
        password_hash=password_hash
    )
    
    await db.users.insert_one(user.dict())
    
    # Create access token
    access_token = create_access_token(data={"sub": user.id})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email
        }
    }

@api_router.post("/login")
async def login(login_data: UserLogin):
    user = await db.users.find_one({"email": login_data.email})
    if not user or not verify_password(login_data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Set token expiry based on remember_me
    expires_delta = timedelta(days=30) if login_data.remember_me else timedelta(days=7)
    access_token = create_access_token(
        data={"sub": user["id"]}, 
        expires_delta=expires_delta
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user["id"],
            "username": user["username"],
            "email": user["email"]
        }
    }

@api_router.get("/me")
async def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email
    }

# Page Routes
@api_router.post("/pages")
async def create_page(page_data: PageCreate, current_user: User = Depends(get_current_user)):
    # Check if pagename already exists
    existing_page = await db.pages.find_one({"pagename": page_data.pagename})
    if existing_page:
        raise HTTPException(status_code=400, detail="Page name already exists")
    
    page = Page(
        user_id=current_user.id,
        **page_data.dict()
    )
    
    await db.pages.insert_one(page.dict())
    return page

@api_router.get("/pages")
async def get_user_pages(current_user: User = Depends(get_current_user)):
    pages = await db.pages.find({"user_id": current_user.id}).to_list(1000)
    return [Page(**page) for page in pages]

@api_router.get("/pages/{page_id}")
async def get_page(page_id: str, current_user: User = Depends(get_current_user)):
    page = await db.pages.find_one({"id": page_id, "user_id": current_user.id})
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")
    return Page(**page)

@api_router.put("/pages/{page_id}")
async def update_page(page_id: str, page_data: PageUpdate, current_user: User = Depends(get_current_user)):
    page = await db.pages.find_one({"id": page_id, "user_id": current_user.id})
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")
    
    update_data = {k: v for k, v in page_data.dict().items() if v is not None}
    update_data["updated_at"] = datetime.utcnow()
    
    await db.pages.update_one({"id": page_id}, {"$set": update_data})
    
    updated_page = await db.pages.find_one({"id": page_id})
    return Page(**updated_page)

@api_router.delete("/pages/{page_id}")
async def delete_page(page_id: str, current_user: User = Depends(get_current_user)):
    result = await db.pages.delete_one({"id": page_id, "user_id": current_user.id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Page not found")
    
    # Delete related feedback and notifications
    await db.feedback.delete_many({"page_id": page_id})
    await db.notifications.delete_many({"page_id": page_id})
    
    return {"message": "Page deleted successfully"}

# Public Page Routes
@api_router.get("/public/page/{pagename}")
async def get_public_page(pagename: str):
    page = await db.pages.find_one({"pagename": pagename})
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")
    
    # Increment view count
    await db.pages.update_one(
        {"pagename": pagename}, 
        {"$inc": {"view_count": 1}}
    )
    
    # Get updated page
    updated_page = await db.pages.find_one({"pagename": pagename})
    return Page(**updated_page)

# Feedback Routes
@api_router.post("/feedback")
async def submit_feedback(feedback_data: FeedbackCreate, current_user: User = Depends(get_current_user)):
    page = await db.pages.find_one({"id": feedback_data.page_id})
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")
    
    feedback = Feedback(
        page_id=feedback_data.page_id,
        user_id=current_user.id,
        username=current_user.username,
        message=feedback_data.message
    )
    
    await db.feedback.insert_one(feedback.dict())
    
    # Create notification for page owner
    notification = Notification(
        user_id=page["user_id"],
        type="feedback",
        title="New Feedback Received",
        message=f"{current_user.username} left feedback on your page '{page['title']}'"
    )
    
    await db.notifications.insert_one(notification.dict())
    
    return feedback

@api_router.get("/feedback/{page_id}")
async def get_page_feedback(page_id: str):
    feedback_list = await db.feedback.find({"page_id": page_id}).to_list(1000)
    return [Feedback(**feedback) for feedback in feedback_list]

# Notification Routes
@api_router.get("/notifications")
async def get_notifications(current_user: User = Depends(get_current_user)):
    notifications = await db.notifications.find({"user_id": current_user.id}).sort("created_at", -1).to_list(1000)
    return [Notification(**notification) for notification in notifications]

@api_router.put("/notifications/{notification_id}/read")
async def mark_notification_read(notification_id: str, current_user: User = Depends(get_current_user)):
    result = await db.notifications.update_one(
        {"id": notification_id, "user_id": current_user.id},
        {"$set": {"is_read": True}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"message": "Notification marked as read"}

@api_router.get("/notifications/unread-count")
async def get_unread_count(current_user: User = Depends(get_current_user)):
    count = await db.notifications.count_documents({"user_id": current_user.id, "is_read": False})
    return {"unread_count": count}

# Owner Admin Routes
@api_router.post("/owner/login")
async def owner_login(login_data: OwnerLogin):
    if login_data.password != OWNER_PASSWORD:
        raise HTTPException(status_code=401, detail="Invalid owner password")
    
    access_token = create_access_token(data={"sub": "owner", "role": "owner"})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": "owner"
    }

async def verify_owner(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        role = payload.get("role")
        if role != "owner":
            raise HTTPException(status_code=403, detail="Owner access required")
        return True
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

@api_router.get("/owner/pages")
async def get_all_pages(owner: bool = Depends(verify_owner)):
    pages = await db.pages.find().to_list(1000)
    result = []
    for page in pages:
        user = await db.users.find_one({"id": page["user_id"]})
        page_data = Page(**page)
        result.append({
            **page_data.dict(),
            "username": user["username"] if user else "Unknown"
        })
    return result

@api_router.post("/owner/suspend")
async def suspend_page(suspend_data: SuspendPage, owner: bool = Depends(verify_owner)):
    page = await db.pages.find_one({"id": suspend_data.page_id})
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")
    
    # Suspend the page
    await db.pages.update_one(
        {"id": suspend_data.page_id},
        {"$set": {"is_suspended": True, "suspension_reason": suspend_data.reason}}
    )
    
    # Send notification to page owner
    notification = Notification(
        user_id=page["user_id"],
        type="suspension",
        title="Page Suspended",
        message=f"Your page '{page['title']}' has been suspended. Reason: {suspend_data.reason}"
    )
    
    await db.notifications.insert_one(notification.dict())
    
    return {"message": "Page suspended successfully"}

@api_router.post("/owner/unsuspend/{page_id}")
async def unsuspend_page(page_id: str, owner: bool = Depends(verify_owner)):
    result = await db.pages.update_one(
        {"id": page_id},
        {"$set": {"is_suspended": False, "suspension_reason": None}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Page not found")
    
    return {"message": "Page unsuspended successfully"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
