from app.api.v1.meetings import router as meetings_router
from app.api.v1.participants import router as participants_router
from fastapi import APIRouter

api_router = APIRouter()

api_router.include_router(meetings_router, prefix="/meetings", tags=["meetings"])
api_router.include_router(
    participants_router, prefix="/participants", tags=["participants"]
)
