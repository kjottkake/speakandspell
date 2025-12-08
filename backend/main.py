from decouple import config
from fastapi import FastAPI
import uvicorn as uvicorn
from motor.motor_asyncio import AsyncIOMotorClient
from routers.users import router as users_router
from routers.exercises import router as exercises_router
from starlette.middleware import Middleware
from starlette.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import logging
import httpx

TIMEOUT = 3000

logging.basicConfig(level=logging.INFO, format="%(levelname)-9s %(asctime)s - %(name)s - %(message)s")
LOGGER = logging.getLogger(__name__)

origins = ["*"]

MAIL_FROM = config('MAIL_FROM', cast=str)
middleware =[
    Middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    )
]

class HTTPXClientWrapper:

    async_client = None

    def start(self) -> None:
        """ Instantiate the client. Call from the FastAPI startup hook."""
        self.async_client = httpx.AsyncClient()
        LOGGER.info(f'httpx AsyncClient instantiated. Id {id(self.async_client)}')

    async def stop(self) -> None:
        """ Gracefully shutdown. Call from FastAPI shutdown hook."""
        LOGGER.info(f'httpx async_client.is_closed(): {self.async_client.is_closed} - Now close it. Id (will be unchanged): {id(self.async_client)}')
        await self.async_client.aclose()
        LOGGER.info(f'httpx async_client.is_closed(): {self.async_client.is_closed}. Id (will be unchanged): {id(self.async_client)}')
        self.async_client = None
        LOGGER.info('httpx AsyncClient closed')

    def __call__(self) -> httpx.AsyncClient:
        """ Calling the instantiated HTTPXClientWrapper returns the wrapped singleton."""
        # Ensure we don't use it if not started / running
        assert self.async_client is not None
        LOGGER.info(f'httpx async_client.is_closed(): {self.async_client.is_closed}. Id (will be unchanged): {id(self.async_client)}')
        return self.async_client

DB_URL = config('DB_URL', cast=str)
DB_NAME = config('DB_NAME', cast=str)

@asynccontextmanager
async def lifespan(app: FastAPI):
    app.mongodb_client = AsyncIOMotorClient(
        DB_URL,
        serverSelectionTimeoutMS=TIMEOUT,
        socketTimeoutMS=TIMEOUT
    )
    app.mongodb = app.mongodb_client[DB_NAME]
    app.httpx_client_wrapper.start()
    yield
    await app.httpx_client_wrapper.stop()
    app.mongodb_client.close()

app = FastAPI(middleware=middleware, lifespan=lifespan)
app.httpx_client_wrapper = HTTPXClientWrapper()

app.mount("/static", StaticFiles(directory="static"), name="static")
app.include_router(users_router, prefix="/users", tags=["users"])
app.include_router(exercises_router, prefix="/exercises", tags=["exercises"])

@app.get("/")
async def root():
    return {"message": "CALST FastAPI"}

if __name__ == "__main__":
    LOGGER.info(f'starting...')
    uvicorn.run(
        "main:app",
        reload=True
    )
