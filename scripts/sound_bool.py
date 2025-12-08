from pymongo import MongoClient
from dotenv import load_dotenv
import os

load_dotenv()

DB_URL = os.getenv("DB_URL")
client = MongoClient(DB_URL)
db = client["speaknspell"]

for ex_type in ["speak", "spell"]:
    for lang in ["swedish", "norwegian", "danish"]:
        db[f"{ex_type}_{lang}_Exercises"].update_many({}, {
            "$set": {"is_consonant": True},
            "$unset": {"sound_type": 1}
        })