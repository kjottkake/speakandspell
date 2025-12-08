from pymongo import MongoClient
from dotenv import load_dotenv
import os

load_dotenv()
DB_URL = os.getenv("DB_URL")
client = MongoClient(DB_URL)
db = client["speaknspell"]
bins = db["Swedish_Bins"]
trials = db["Swedish_Trials"]

for trial in trials.find():
    bin = bins.find_one({"number": trial["bin_id"]})
    trials.update_one({"_id": trial["_id"]}, {
        "$rename": {
            "danish.example": "danish.word",
            "norwegian.example": "norwegian.word"
        },
        "$set": {
            "swedish": {
                "rule": bin["rule"],
                "word": trial["word"],
                "transcription": trial["transcription"]
            }
        },
        "$unset": {
            "word": 1,
            "transcription": 1
        }
    })