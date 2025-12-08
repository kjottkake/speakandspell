from fastapi import APIRouter, Request, Body, status, HTTPException, Depends
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse
from models import UserBase, LoginBase
from authentication import AuthHandler
from db_models.user import find_user
from common import connection_err, lang_error
from emails.emails import forgot_pw_email
import random
import string

CODE_LENGTH = 6

router = APIRouter()
auth_handler = AuthHandler()

@router.post("/register", response_description="Register user")
async def register(request: Request, newUser: UserBase = Body(...)) -> UserBase:
    err = await connection_err(request)
    if err:
        raise err
    newUser.password = auth_handler.get_password_hash(newUser.password)
    newUser = jsonable_encoder(newUser)

    for c in [" ", "/"]:
        if c in newUser["username"]:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Username cannot include \"{c}\"")

    if (
        existing_email := await request.app.mongodb["users"].find_one(
            {"email": newUser["email"]}
        )
        is not None
    ):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail=f"User with email {newUser['email']} already exists"
        )

    # check existing user or email 409 Conflict:
    if (
        existing_username := await request.app.mongodb["users"].find_one(
            {"username": newUser["username"]}
        )
        is not None
    ):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"User with username {newUser['username']} already exists",
        )
    user = await request.app.mongodb["users"].insert_one(newUser)
    created_user = await request.app.mongodb["users"].find_one(
        {"_id": user.inserted_id}
    )

    return JSONResponse(status_code=status.HTTP_201_CREATED, content=created_user)


# post user
@router.post("/login", response_description="Login user")
async def login(request: Request, loginUser: LoginBase = Body(...)) -> str:
    err = await connection_err(request)
    if err:
        raise err
    # Find the user by email
    user = await find_user(request, email=loginUser.email)

    # If the user logs in with username instead
    if (user is None):
        user = await find_user(request, username=loginUser.email)

    # check password
    if (user is None) or (
        not user.correct_password(loginUser.password)
    ):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email and/or password")

    return JSONResponse(content={"token": user.token()})


# me route
@router.get("/me", response_description="Logged in user data")
async def me(request: Request, user_id=Depends(auth_handler.auth_wrapper)):
    err = await connection_err(request)
    if err:
        raise err
    user = await find_user(request, id=user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)
    return {
        "id": user.id(),
        "email": user.email(),
        "username": user.username()
    }

@router.post("/update-username/{username}")
async def update_username(request: Request, username: str, user_id=Depends(auth_handler.auth_wrapper)):
    err = await connection_err(request)
    if err:
        raise err
    for c in [" ", "/"]:
        if c in username:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Username cannot include \"{c}\"")
    if (await find_user(request, username=username)) is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=f"User with username {username} already exists")
    user = await find_user(request, id=user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)
    user.set_username(username)
    return JSONResponse("Ok")

@router.post("/update-email/{email}")
async def update_email(request: Request, email: str, user_id=Depends(auth_handler.auth_wrapper)):
    err = await connection_err(request)
    if err:
        raise err
    if (await find_user(request, email=email)) is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=f"User with email {email} already exists")
    user = await find_user(request, id=user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)
    user.set_email(email)
    return JSONResponse("Ok")

@router.get("/get-l1")
async def get_l1(request: Request, user_id=Depends(auth_handler.auth_wrapper)):
    err = await connection_err(request)
    if err:
        raise err
    user = await find_user(request, id=user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)
    return {"l1": user.l1()}


@router.get("/get-l2")
async def get_l2(request: Request, user_id=Depends(auth_handler.auth_wrapper)):
    err = await connection_err(request)
    if err:
        raise err
    user = await find_user(request, id=user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)
    return {"l2": user.l2()}

@router.get("/name-exists/{username}")
async def name_exists(request: Request, username: str):
    err = await connection_err(request)
    if err:
        raise err
    user = await find_user(request, username=username)
    return JSONResponse({
        "exists": user is not None
    })

@router.get("/email-exists/{email}")
async def email_exists(request: Request, email: str):
    err = await connection_err(request)
    if err:
        raise err
    user = await find_user(request, email=email)
    return JSONResponse({
        "exists": user is not None
    })

@router.post("/update-l1/{l1}")
async def update_l1(request: Request, l1: str, user_id=Depends(auth_handler.auth_wrapper)):
    err = lang_error(l1)
    if err:
        raise err
    err = await connection_err(request)
    if err:
        raise err
    user = await find_user(request, id=user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)
    user.set_l1(l1)
    return JSONResponse(content="Ok")

@router.post("/update-l2/{l2}")
async def update_l2(request: Request, l2: str, user_id=Depends(auth_handler.auth_wrapper)):
    err = lang_error(l2)
    if err:
        raise err
    err = await connection_err(request)
    if err:
        raise err
    user = await find_user(request, id=user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)
    user.set_l2(l2)
    return JSONResponse(content="Ok")

@router.post("/update-pw/{old_pw}/{new_pw}")
async def update_pw(request: Request, old_pw: str, new_pw: str, user_id=Depends(auth_handler.auth_wrapper)):
    err = await connection_err(request)
    if err:
        raise err
    user = await find_user(request, id=user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)
    if not user.correct_password(old_pw):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)
    user.set_pw(new_pw)
    return JSONResponse(content="Ok")

@router.post("/forgot-pw/{email}")
async def forgot_pw(request: Request, email: str):
    err = await connection_err(request)
    if err:
        raise err
    user = await find_user(request, email=email)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)
    code = "".join(random.choices(string.ascii_letters + string.digits, k=CODE_LENGTH))
    user.set_code(code)
    forgot_pw_email(email, user.id(), code)
    return JSONResponse("Ok")

@router.post("/reset-pw/{id}/{code}/{pw}")
async def reset_pw(request: Request, id: str, code: str, pw: str):
    err = await connection_err(request)
    if err:
        raise err
    user = await find_user(request, id=id)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)
    if not user.correct_code(code):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)
    user.set_pw(pw)
    return JSONResponse("Ok")

@router.delete("/delete-user")
async def delete_user(request: Request, user_id=Depends(auth_handler.auth_wrapper)):
    err = await connection_err(request)
    if err:
        raise err
    user = await find_user(request, id=user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    user.delete()
    return JSONResponse("Ok")

@router.delete("/delete-results")
async def delete_results(request: Request, user_id=Depends(auth_handler.auth_wrapper)):
    err = await connection_err(request)
    if err:
        raise err
    user = await find_user(request, id=user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    user.delete_results()
    return JSONResponse("Ok")