from pymongo import MongoClient
from dotenv import load_dotenv
import os
import random
import string

load_dotenv()

DB_URL = os.getenv("DB_URL")
client = MongoClient(DB_URL)
db = client["speaknspell"]

NUM_EXERCISES = 5
NUM_BINS = 3
NUM_TRIALS = 10

def random_string(length: int):
    return "".join(random.choices(string.ascii_letters + string.digits, k=length))

exercise_count = 0

for ex_type in ["speak", "spell"]:
    for lang in ["swedish", "norwegian", "danish"]:
        exercise_collection = db[f"{ex_type}_Exercises"]
        bin_collection = db[f"{ex_type}_Bins"]
        trial_collection = db[f"{ex_type}_Trials"]
        for ex_id in range(exercise_count, NUM_EXERCISES):
            exercise_collection.insert_one({
                "number": ex_id,
                "sound": random_string(3),
                "language": lang,
                "is_consonant": True
            })
            for bin_id in range(ex_id*NUM_BINS, ex_id*NUM_BINS+NUM_BINS):
                bin_collection.insert_one({
                    "number": bin_id,
                    "context": random_string(4),
                    "rule": random_string(15),
                    "exercise_id": ex_id
                })
                for trial_id in range(bin_id*NUM_TRIALS, bin_id*NUM_TRIALS+NUM_TRIALS):
                    trial_collection.insert_one({
                        "number": trial_id,
                        "bin_id": bin_id,
                        "english": random_string(6),
                        "swedish": {
                            "rule": random_string(15),
                            "word": random_string(6)
                        },
                        "norwegian": {
                            "rule": random_string(15),
                            "word": random_string(6)
                        },
                        "danish": {
                            "rule": random_string(15),
                            "word": random_string(6)
                        }
                    })