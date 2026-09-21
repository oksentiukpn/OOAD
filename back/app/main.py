from contextlib import asynccontextmanager

from app.api.v1.router import api_router
from app.core.config import settings
from app.core.database import AsyncSessionLocal, init_db
from app.crud.meeting import get_meetings
from app.models.meeting import Meeting
from app.models.participant import Participant
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


async def seed_initial_data():
    """Seeds some demo participants and a meeting if the database is empty."""
    async with AsyncSessionLocal() as db:
        existing_meetings = await get_meetings(db, limit=1)
        if not existing_meetings:
            p1 = Participant(name="Alice Johnson", email="alice@company.com")
            p2 = Participant(name="Bob Smith", email="bob@company.com")
            p3 = Participant(name="Charlie Davis", email="charlie@company.com")
            db.add_all([p1, p2, p3])
            await db.flush()

            meeting1 = Meeting(
                title="Sprint Planning & Architecture Review",
                description="Review current sprint progress, prioritize upcoming user stories, and discuss microservices architecture.",
                link_to_call="https://meet.google.com/abc-defg-hij",
                place="Room 402, North Tower",
                participants=[p1, p2, p3],
            )
            meeting2 = Meeting(
                title="Frontend Sync & Design System",
                description="Align on shadcn/ui components and accessibility guidelines for the new dashboard.",
                link_to_call="https://zoom.us/j/1234567890",
                place="Virtual (Zoom)",
                participants=[p1, p2],
            )
            db.add_all([meeting1, meeting2])
            await db.commit()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB tables
    try:
        await init_db()
        await seed_initial_data()
    except Exception as e:
        print(f"Error during startup database initialization: {e}")
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan,
)

# Set CORS origins
if settings.CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )


@app.get("/health", tags=["system"])
async def health_check():
    return {"status": "ok", "app": settings.PROJECT_NAME}


app.include_router(api_router, prefix=settings.API_V1_STR)
