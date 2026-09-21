import uuid
from datetime import datetime
from typing import List, Optional

from app.schemas.participant import ParticipantCreate, ParticipantResponse
from pydantic import BaseModel, ConfigDict, Field


class MeetingBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    link_to_call: Optional[str] = Field(None, max_length=2048)
    place: Optional[str] = Field(None, max_length=255)
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None


class MeetingCreate(MeetingBase):
    participant_ids: List[uuid.UUID] = Field(default_factory=list)
    new_participants: List[ParticipantCreate] = Field(default_factory=list)


class MeetingResponse(MeetingBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    participants: List[ParticipantResponse] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)
