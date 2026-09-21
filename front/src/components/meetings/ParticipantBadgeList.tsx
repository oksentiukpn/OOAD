import React from "react"
import { Badge } from "@/components/ui/badge"
import { Participant } from "@/types/meeting"
import { User } from "lucide-react"

interface ParticipantBadgeListProps {
  participants: Participant[]
}

export const ParticipantBadgeList: React.FC<ParticipantBadgeListProps> = ({ participants }) => {
  if (!participants || participants.length === 0) {
    return (
      <span className="text-xs text-muted-foreground italic flex items-center gap-1">
        <User className="w-3.5 h-3.5" /> No participants assigned
      </span>
    )
  }

  return (
    <div className="flex flex-wrap gap-1.5 items-center">
      <span className="text-xs font-medium text-muted-foreground mr-1 flex items-center gap-1">
        <User className="w-3.5 h-3.5" /> Participants:
      </span>
      {participants.map((p) => (
        <Badge
          key={p.id}
          variant="secondary"
          className="text-xs font-normal hover:bg-secondary/70 transition-colors"
          title={p.email}
        >
          {p.name}
        </Badge>
      ))}
    </div>
  )
}
