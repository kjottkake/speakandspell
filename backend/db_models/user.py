from fastapi import Request
from authentication import AuthHandler
from typing import Any

auth_handler = AuthHandler()

class User:
    def __init__(self, request: Request, data):
        self.request = request
        self.data = data

    def update(self, field: str, value: Any) -> None:
        self.data[field] = value
        self.request.app.mongodb["users"].update_one({
            "_id": self.id()
        }, {
            "$set": {
                field: value
            }
        })

    def push_value(self, field: str, value: Any) -> None:
        self.request.app.mongodb["users"].update_one({
            "_id": self.id()
        }, {
            "$push": {
                field: value
            }
        })

    def pull_value(self, field: str, value: Any) -> None:
        self.request.app.mongodb["users"].update_one({
            "_id": self.id()
        }, {
            "$pull": {
                field: value
            }
        })

    def id(self) -> str:
        return self.data["_id"]
    
    def email(self) -> str:
        return self.data["email"]

    def username(self) -> str:
        return self.data["username"]
    
    def l1(self) -> str:
        return self.data["l1"]
    
    def l2(self) -> str:
        return self.data["l2"]

    def correct_password(self, password: str) -> bool:
        return auth_handler.verify_password(password, self.data["password"])
    
    def token(self) -> str:
        return auth_handler.encode_token(self.id())
    
    def set_code(self, code: str):
        self.update("one_time_code", code)

    def correct_code(self, code: str) -> bool:
        return self.data["one_time_code"] == code

    def set_pw(self, pw: str) -> None:
        self.update("password", auth_handler.get_password_hash(pw))

    def set_username(self, username: str) -> None:
        self.update("username", username)

    def set_email(self, email: str) -> None:
        self.update("email", email)

    def set_l1(self, l1: str) -> None:
        self.update("l1", l1)

    def set_l2(self, l2: str) -> None:
        self.update("l2", l2)

    def delete(self):
        self.request.app.mongodb["users"].delete_one({"_id": self.id()})

    def delete_results(self):
        self.request.app.mongodb["users"].update_one({"_id": self.id()}, {"$unset": {"results": ""}})

async def find_user(request: Request, id: str | None = None, email: str | None = None, username: str | None = None) -> User | None:
    query = {}
    if id is not None:
        query = {
            "_id": id
        }
    elif email is not None:
        query = {
            "email": email
        }
    elif username is not None:
        query = {
            "username": username
        }
    else:
        raise TypeError("No identifier for user specified")
    data = await request.app.mongodb["users"].find_one(query)
    if data is None:
        return None
    return User(request, data)