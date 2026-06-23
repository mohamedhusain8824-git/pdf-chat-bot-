"""
NeuralLens AI — Database Access Module.

Configures MongoDB client to handle
user authentication, registration, and sessions.
"""

import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI")
if not MONGODB_URI:
    raise ValueError("MONGODB_URI not found in .env")

# Initialise a single shared MongoDB client
client = MongoClient(MONGODB_URI)
db = client.get_database("neurallens_db")

# Export collections
users_collection = db.get_collection("users")