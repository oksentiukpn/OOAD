import uuid
from datetime import datetime

from app.core.database import Base
from sqlalchemy import Column, DateTime, ForeignKey, String, Table, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

meeting_participants = Table(
    "meeting_participants",
    Base.metadata,
    Column(
        "meeting_id",
        UUID(as_uuid=True),
        ForeignKey("meetings.id", ondelete="CASCADE"),
        primary_key=True,
    ),
    Column(
        "participant_id",
        UUID(as_uuid=True),
        ForeignKey("participants.id", ondelete="CASCADE"),
        primary_key=True,
    ),
    Column(
        "joined_at", DateTime(timezone=True), server_default=func.now(), nullable=False
    ),
)


class Meeting(Base):
    __tablename__ = "meetings"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True,
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(String, nullable=True)
    link_to_call: Mapped[str | None] = mapped_column(String(2048), nullable=True)
    place: Mapped[str | None] = mapped_column(String(255), nullable=True)
    start_time: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    end_time: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    participants: Mapped[list["Participant"]] = relationship(
        "Participant",
        secondary=meeting_participants,
        back_populates="meetings",
        lazy="selectin",
    )
