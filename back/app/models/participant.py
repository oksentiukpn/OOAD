import uuid
from datetime import datetime

from app.core.database import Base
from app.models.meeting import meeting_participants
from sqlalchemy import DateTime, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship


class Participant(Base):
    __tablename__ = "participants"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True,
    )
    name: Mapped[str] = mapped_column(String(128), nullable=False)
    email: Mapped[str] = mapped_column(
        String(255), unique=True, index=True, nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    meetings: Mapped[list["Meeting"]] = relationship(
        "Meeting",
        secondary=meeting_participants,
        back_populates="participants",
        lazy="selectin",
    )
