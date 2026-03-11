from motor.motor_asyncio import AsyncIOMotorClient
from bson.objectid import ObjectId
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME", "taxgpt")
CLIENT: AsyncIOMotorClient | None = None

def get_client() -> AsyncIOMotorClient:
    global CLIENT
    if CLIENT is None:
        CLIENT = AsyncIOMotorClient(MONGO_URL)
    return CLIENT


def get_db():
    return get_client()[MONGO_DB_NAME]


def object_id(id_str: str) -> ObjectId:
    return ObjectId(id_str)
