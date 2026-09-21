import uuid
from typing import List, Optional

from app.crud.participant import get_or_create_participant
from app.models.meeting import Meeting
from app.models.participant import Participant
from app.schemas.meeting import MeetingCreate
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload


async def get_meetings(
    db: AsyncSession,
    skip: int = 0,
    limit: int = 50,
    search: Optional[str] = None,
) -> List[Meeting]:
    stmt = (
        select(Meeting)
        .options(selectinload(Meeting.participants))
        .order_by(Meeting.created_at.desc())
    )

    if search:
        search_filter = f"%{search}%"
        stmt = stmt.where(
            or_(
                Meeting.title.ilike(search_filter),
                Meeting.description.ilike(search_filter),
                Meeting.place.ilike(search_filter),
            )
        )

    stmt = stmt.offset(skip).limit(limit)
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def get_meeting(db: AsyncSession, meeting_id: uuid.UUID) -> Optional[Meeting]:
    stmt = (
        select(Meeting)
        .options(selectinload(Meeting.participants))
        .where(Meeting.id == meeting_id)
    )
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def create_meeting(db: AsyncSession, meeting_in: MeetingCreate) -> Meeting:
    # 1. Fetch participants specified by IDs
    participants_list: List[Participant] = []
    if meeting_in.participant_ids:
        stmt = select(Participant).where(Participant.id.in_(meeting_in.participant_ids))
        res = await db.execute(stmt)
        participants_list.extend(res.scalars().all())

    # 2. Process any new inline participants
    if meeting_in.new_participants:
        for new_p in meeting_in.new_participants:
            p = await get_or_create_participant(db, name=new_p.name, email=new_p.email)
            if p not in participants_list:
                participants_list.append(p)

    # 3. Create Meeting instance
    meeting = Meeting(
        title=meeting_in.title,
        description=meeting_in.description,
        link_to_call=meeting_in.link_to_call,
        place=meeting_in.place,
        start_time=meeting_in.start_time,
        end_time=meeting_in.end_time,
        participants=participants_list,
    )

    db.add(meeting)
    await db.commit()
    await db.refresh(meeting)
    return meeting


async def delete_meeting(db: AsyncSession, meeting_id: uuid.UUID) -> bool:
    meeting = await get_meeting(db, meeting_id)
    if not meeting:
        return False
    await db.delete(meeting)
    await db.commit()
    return True
