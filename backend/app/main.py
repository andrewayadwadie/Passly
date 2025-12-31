from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from . import db, models, security, auth_router, vault_router
from .config import settings
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Passly API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router, prefix="/api")
app.include_router(vault_router.router, prefix="/api")

@app.on_event("startup")
async def startup_event():
    # Initial user creation
    async with db.SessionLocal() as session:
        result = await session.execute(select(models.User))
        user_exists = result.first()
        
        if not user_exists:
            logger.info(f"Creating initial admin user: {settings.INITIAL_USERNAME}")
            hashed_pwd = security.get_password_hash(settings.INITIAL_PASSWORD)
            new_user = models.User(
                username=settings.INITIAL_USERNAME,
                password_hash=hashed_pwd
            )
            session.add(new_user)
            await session.commit()
            logger.info("Initial user created successfully.")

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.get("/")
async def root():
    return {"message": "Welcome to Passly API"}
