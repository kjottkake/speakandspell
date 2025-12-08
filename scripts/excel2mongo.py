import pandas as pd
from pymongo import MongoClient
from dotenv import load_dotenv
import os

load_dotenv()

DB_URL = os.getenv("DB_URL")
client = MongoClient(DB_URL)
db = client["speaknspell"]
collection = db["S2L-C Swedish"]

df = pd.read_excel("./Exercises_2025-03-28.xlsx", sheet_name="S2L-C Swedish (2)", header=2)
for column in df.columns:
    if "Unnamed" in column:
        df = df.drop(column, axis=1)
df = df.drop("blue = different pronunciation, same spelling (cognates)", axis=1)

for _, row in df.iterrows():
    json = {
        "exercise": row["Exercise"],
        "sound": row["Sound"],
        "bin": row["Bin"],
        "context": row["Context"],
        "rule": row["SWEDISH SOUND + RULE"],
        "example": row["SWEDISH EXAMPLE WORDS"],
        "transcription": row["TRANSCRIPTION"],
        "english": row["English (false friends in red)"],
        "norwegian": {
            "comment": row["COMMENT"],
            "rule": row["NORWEGIAN SOUND + RULE"],
            "example": row["NORWEGIAN EXAMPLE WORDS"],
            "transcription": row["TRANSCRIPTION"]
        },
        "danish": {
            "comment": row["COMMENT.1"],
            "rule": row["DANISH SOUND + RULE"],
            "example": row["DANISH \nEXAMPLE WORDS"],
            "transcription": row["TRANSCRIPTION.1"]
        }
    }
    collection.insert_one(json)