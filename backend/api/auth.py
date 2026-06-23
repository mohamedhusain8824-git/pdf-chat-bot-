"""
NeuralLens AI — Authentication Router.

Provides endpoints for:
  • POST /auth/register — Creating a new account with in-memory MongoDB.
  • POST /auth/login — Authenticating credentials and returning user sessions.
"""

from fastapi import APIRouter, HTTPException, status
from database import users_collection
from models.user import UserRegister, UserLogin, hash_password, verify_password

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register")
def register_user(user_data: UserRegister):
    """Register a new user in the in-memory MongoDB database."""
    email = user_data.email.lower().strip()
    
    # Check if a user already exists with this email
    existing_user = users_collection.find_one({"email": email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )
    
    # Hash password and store user
    hashed_pwd = hash_password(user_data.password)
    user_doc = {
        "name": user_data.name.strip(),
        "email": email,
        "password": hashed_pwd,
        "tier": "Pro Plan"  # Default registration tier
    }
    
    users_collection.insert_one(user_doc)
    
    return {
        "status": "success",
        "message": "User registered successfully",
        "user": {
            "name": user_doc["name"],
            "email": user_doc["email"],
            "tier": user_doc["tier"]
        }
    }


@router.post("/login")
def login_user(user_data: UserLogin):
    """Authenticate an existing user's email and password."""
    email = user_data.email.lower().strip()
    
    user_doc = users_collection.find_one({"email": email})
    if not user_doc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password."
        )
    
    # Verify password
    if not verify_password(user_doc["password"], user_data.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password."
        )
    
    return {
        "status": "success",
        "message": "Login successful",
        "user": {
            "name": user_doc["name"],
            "email": user_doc["email"],
            "tier": user_doc.get("tier", "Pro Plan")
        }
    }
