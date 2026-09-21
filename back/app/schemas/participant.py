import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class ParticipantBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=128)
    email: EmailStr = Field(..., max_length=255)


class ParticipantCreate(ParticipantBase):
    pass


class ParticipantResponse(ParticipantBase):
    id: uuid.UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
