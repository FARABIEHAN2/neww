from pymongo import MongoClient
from decouple import config

MONGO_URL = config("MONGO_URL")  # Reads from .env
DB_NAME = config("DB_NAME", default="notez_fun_db")

client = MongoClient(MONGO_URL)
db = client[DB_NAME]
