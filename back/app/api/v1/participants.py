import uuid
from typing import List

from app.api.deps import get_db
from app.crud import participant as crud_participant
from app.schemas.participant import ParticipantCreate, ParticipantResponse
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter()


@router.get("", response_model=List[ParticipantResponse])
async def list_participants(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve all participants."""
    return await crud_participant.get_participants(db, skip=skip, limit=limit)


@router.post(
    "", response_model=ParticipantResponse, status_code=status.HTTP_201_CREATED
)
async def create_participant(
    participant_in: ParticipantCreate,
    db: AsyncSession = Depends(get_db),
):
    """Create a new participant."""
    existing = await crud_participant.get_participant_by_email(
        db, email=participant_in.email
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Participant with email '{participant_in.email}' already exists",
        )
    return await crud_participant.create_participant(db, participant_in=participant_in)
