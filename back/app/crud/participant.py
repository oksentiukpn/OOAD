import uuid
from typing import List, Optional

from app.models.participant import Participant
from app.schemas.participant import ParticipantCreate
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession


async def get_participant(
    db: AsyncSession, participant_id: uuid.UUID
) -> Optional[Participant]:
    result = await db.execute(
        select(Participant).where(Participant.id == participant_id)
    )
    return result.scalar_one_or_none()


async def get_participant_by_email(
    db: AsyncSession, email: str
) -> Optional[Participant]:
    result = await db.execute(select(Participant).where(Participant.email == email))
    return result.scalar_one_or_none()


async def get_participants(
    db: AsyncSession, skip: int = 0, limit: int = 100
) -> List[Participant]:
    result = await db.execute(
        select(Participant).order_by(Participant.name.asc()).offset(skip).limit(limit)
    )
    return list(result.scalars().all())


async def create_participant(
    db: AsyncSession, participant_in: ParticipantCreate
) -> Participant:
    participant = Participant(name=participant_in.name, email=participant_in.email)
    db.add(participant)
    await db.commit()
    await db.refresh(participant)
    return participant


async def get_or_create_participant(
    db: AsyncSession, name: str, email: str
) -> Participant:
    existing = await get_participant_by_email(db, email)
    if existing:
        return existing
    participant = Participant(name=name, email=email)
    db.add(participant)
    await db.commit()
    await db.refresh(participant)
    return participant
