from bson import ObjectId
from pydantic import Field as PydanticField, BaseModel, EmailStr, field_validator, GetJsonSchemaHandler
from pydantic.json_schema import JsonSchemaValue
from pydantic_core import core_schema
from typing import Iterator
from email_validator import validate_email, EmailNotValidError

class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls) -> Iterator[ObjectId]:
        yield cls.validate

    @classmethod
    def validate(cls, v, _) -> ObjectId:
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid objectid")
        return ObjectId(v)

    @classmethod
    def __get_pydantic_json_schema__(cls, schema: core_schema.CoreSchema, handler: GetJsonSchemaHandler) -> JsonSchemaValue:
        json_schema = handler(core_schema.int_schema())
        json_schema.update(type="string")
        return json_schema

class MongoBaseModel(BaseModel):
    id: PyObjectId = PydanticField(default_factory=PyObjectId, alias="_id")
    class Config:
        json_encoders = {ObjectId: str}

class UserBase(MongoBaseModel):
    username: str = PydanticField(..., min_length=3, max_length=15)
    email: str = PydanticField(...)
    password: str = PydanticField(...)
    l1: str
    l2: str
    @field_validator("email")
    def valid_email(cls, v: str) -> str:
        try:
            email = validate_email(v).email
            return email
        except EmailNotValidError:
            raise EmailNotValidError
        
class LoginBase(BaseModel):
    email: str
    password: str = PydanticField(...)

class CurrentUser(BaseModel):
    email: EmailStr
    username: str = PydanticField(...)
    role: str = PydanticField(...)
