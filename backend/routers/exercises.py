from fastapi import APIRouter, Request, Depends, Body, HTTPException, status
from fastapi.responses import JSONResponse
import math
import random
from authentication import AuthHandler
from common import connection_err, lang_error
from pydantic import BaseModel

NUM_EXAMPLES = 2
NUM_TRIALS = 20

router = APIRouter()
auth_handler = AuthHandler()

def type_error(ex_type):
    if ex_type in ["speak", "spell"]:
        return False
    return HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"{ex_type} is not a type of exercise.")

def remove_nan(x):
    if isinstance(x, float) and math.isnan(x):
        return None
    if isinstance(x, list):
        return [remove_nan(y) for y in x]
    if isinstance(x, dict):
        return {k: remove_nan(y) for k, y in x.items()}
    return x

@router.get("/exercise-list/{l2}/{consonant}")
async def exercise_list(request: Request, l2: str, consonant: bool):
    err = lang_error(l2)
    if err:
        raise err
    err = await connection_err(request)
    if err:
        raise err
    db = request.app.mongodb
    exercises = await db["exercises"].find({"language": l2, "is_consonant": consonant}).to_list(length=None)
    json_exercises = {
        "speak": [],
        "spell": []
    }

    trial_count = 0
    for exercise in exercises:
        bins = await db["bins"].find({"exercise": exercise["_id"]}, {"_id": True}).to_list(length=None)
        if bins == []:
            continue
        trial_count = 0
        for bin in bins:
            trial_count += await db["trials"].count_documents({"bin": bin["_id"]})
            
        if trial_count >= NUM_TRIALS:
            json_exercises["speak" if exercise["is_speak"] else "spell"].append({"id": exercise["_id"], "target": exercise["target"]})
                
    return JSONResponse(content={"exercises": remove_nan(json_exercises)})

@router.get("/exercise/{id}")
async def get_exercise(request: Request, id: int):
    err = await connection_err(request)
    if err:
        raise err
    exercise = await request.app.mongodb["exercises"].find_one({"_id": id}, {"language": True})
    bins = await request.app.mongodb["bins"].find({"exercise": id}).to_list(length=None)
    rules = {}
    for bin in bins:
        if bin["is_exception"]:
            continue
        rule = bin["rule"]
        if rule in rules.keys():
            rules[rule].append(bin["_id"])
        else:
            rules[rule] = [bin["_id"]]
    json_rules = []
    used_trials = []
    for rule in rules:
        examples = []
        for bin in rules[rule]:
            if len(examples) == NUM_EXAMPLES:
                break
            example = await request.app.mongodb["trials"].aggregate([
                {"$match": {"bin": bin}},
                {"$sample": {"size": 1}}
            ]).to_list(length=1)
            examples.append(example[0])
        for example in examples:
            used_trials.append(example["_id"])
        words = await request.app.mongodb["words"].find({"_id": {"$in": [example["word"] for example in examples]}}, {exercise["language"]: True}).to_list(length=None)
        json_rule = await request.app.mongodb["rules"].find_one({"_id": rule})
        json_rule["examples"] = [word[exercise["language"]]["word"] for word in words]
        print(json_rule["norwegian"])
        json_rules.append(json_rule)

    trial_matrix = []
    for bin in bins:
        resp = await request.app.mongodb["trials"].find({"bin": bin["_id"]}, {"_id": True}).to_list(length=None)
        bin_trials = [trial["_id"] for trial in resp]
        random.shuffle(bin_trials)
        trial_matrix.append(bin_trials)

    while sum([len(xs) for xs in trial_matrix]) > NUM_TRIALS:
        max_len = max([len(xs) for xs in trial_matrix])
        longest = [xs for xs in trial_matrix if len(xs) == max_len]
        max_used = max([len([x for x in xs if x in used_trials]) for xs in longest])
        if max_used > 0:
            final_candidates = [xs for xs in longest if len([x for x in xs if x in used_trials]) == max_used]
            candidate = random.choice(final_candidates)
            candidate.remove(next(x for x in candidate if x in used_trials))
        else:
            random.choice(longest).pop()
        
        
    trials = sum(trial_matrix, [])
    random.shuffle(trials)

    return JSONResponse(content=remove_nan({
        "rules": json_rules,
        "trials": trials
    }))

@router.get("/trial/{id}")
async def get_trial(request: Request, id: int):
    err = await connection_err(request)
    if err:
        raise err
    trial = await request.app.mongodb["trials"].find_one({"_id": id})
    word = await request.app.mongodb["words"].find_one({"_id": trial["word"]})
    for lang in ["norwegian", "swedish", "danish"]:
        trial[lang] = word[lang]
    return JSONResponse(content={"trial": remove_nan(trial)})

@router.post("/result/{ex_id}/{score}")
async def post_result(request: Request, ex_id: int, score: float, user_id=Depends(auth_handler.auth_wrapper)):
    err = await connection_err(request)
    if err:
        raise err
    request.app.mongodb["users"].update_one({"_id": user_id}, {"$set": {f"results.{ex_id}": score}})
    return JSONResponse(content="Ok")

@router.get("/results/{l2}/{consonant}")
async def get_results(request: Request, l2: str, consonant: bool, user_id=Depends(auth_handler.auth_wrapper)):
    err = lang_error(l2)
    if err:
        raise err
    err = await connection_err(request)
    if err:
        raise err
    exercises = await request.app.mongodb["exercises"].find({"language": l2, "is_consonant": consonant}, {"_id": True, "is_speak": True}).to_list(length=None)
    data = await request.app.mongodb["users"].find_one({"_id": user_id}, {"results": True})
    results = {}
    if "results" in data:
        results = data["results"]
    speak = {}
    spell = {}
    for ex in exercises:
        print(ex.keys())
        id = str(ex["_id"])
        if id in results.keys():
            if ex["is_speak"]:
                speak[id] = results[id]
            else:
                spell[id] = results[id]

    return JSONResponse(content=remove_nan({"speak": speak, "spell": spell}))

@router.get("/test")
def test():
    return JSONResponse(content={"text": "testing <i>testing</i> testing"})