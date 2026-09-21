import uuid
from typing import List, Optional

from app.api.deps import get_db
from app.crud import meeting as crud_meeting
from app.schemas.meeting import MeetingCreate, MeetingResponse
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter()


@router.get("", response_model=List[MeetingResponse])
async def list_meetings(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    search: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve all meetings with optional pagination and search filter."""
    return await crud_meeting.get_meetings(db, skip=skip, limit=limit, search=search)


@router.post("", response_model=MeetingResponse, status_code=status.HTTP_201_CREATED)
async def create_meeting(
    meeting_in: MeetingCreate,
    db: AsyncSession = Depends(get_db),
):
    """Create a new meeting and associate participants."""
    return await crud_meeting.create_meeting(db, meeting_in=meeting_in)


@router.get("/{meeting_id}", response_model=MeetingResponse)
async def get_meeting(
    meeting_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    """Retrieve details for a specific meeting."""
    meeting = await crud_meeting.get_meeting(db, meeting_id=meeting_id)
    if not meeting:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Meeting with id '{meeting_id}' not found",
        )
    return meeting


@router.delete("/{meeting_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_meeting(
    meeting_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    """Delete a meeting. Linked participant association records will be removed."""
    deleted = await crud_meeting.delete_meeting(db, meeting_id=meeting_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Meeting with id '{meeting_id}' not found",
        )
    return None
