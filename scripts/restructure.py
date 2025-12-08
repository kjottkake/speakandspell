from pymongo import MongoClient
from dotenv import load_dotenv
import os

load_dotenv()

DB_URL = os.getenv("DB_URL")
client = MongoClient(DB_URL)
db = client["speaknspell"]

swedish = db["Swedish"]
exercises = db["Swedish_Exercises"]
bins = db["Swedish_Bins"]
trials = db["Swedish_Trials"]

bin_id = 0
trial_id= 0

for number in swedish.distinct("exercise"):
    records = swedish.find({"exercise": number})
    exercises.insert_one({
        "number": number,
        "sound": records[0]["sound"]
    })
    for bin in swedish.distinct("bin", {"exercise": number}):
        bin_number = bin_id
        bin_id += 1
        bin_records = swedish.find({
            "exercise": number,
            "bin": bin
        })
        bins.insert_one({
            "number": bin_number,
            "context": bin_records[0]["context"],
            "rule": bin_records[0]["rule"],
            "exercise_id": number
        })
        for record in bin_records:
            trial_number = trial_id
            trial_id += 1
            trials.insert_one({
                "number": trial_number,
                "word": record["example"],
                "transcription": record["transcription"],
                "english": record["english"],
                "norwegian": record["norwegian"],
                "danish": record["danish"],
                "bin_id": bin_number
            })