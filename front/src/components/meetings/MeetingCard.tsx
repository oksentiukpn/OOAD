import React from "react"
import { Meeting } from "@/types/meeting"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ParticipantBadgeList } from "@/components/meetings/ParticipantBadgeList"
import { MapPin, Video, Trash2, Calendar, ExternalLink } from "lucide-react"

interface MeetingCardProps {
  meeting: Meeting
  onDeleteRequest: (meeting: Meeting) => void
}

export const MeetingCard: React.FC<MeetingCardProps> = ({ meeting, onDeleteRequest }) => {
  const formattedDate = meeting.start_time
    ? new Date(meeting.start_time).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    })
    : null

  return (
    <Card className="flex flex-col justify-between hover:shadow-md transition-shadow border-muted/80">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg font-semibold leading-tight line-clamp-2">
            {meeting.title}
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0 h-8 w-8"
            onClick={() => onDeleteRequest(meeting)}
            title="Delete meeting"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
        {formattedDate && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formattedDate}</span>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-3 pb-3 flex-1">
        {meeting.description && (
          <p className="text-sm text-muted-foreground whitespace-pre-line line-clamp-3">
            {meeting.description}
          </p>
        )}

        <div className="space-y-2 text-sm">
          {meeting.place && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-4 h-4 shrink-0 text-primary" />
              <span className="truncate">{meeting.place}</span>
            </div>
          )}

          {meeting.link_to_call && (
            <div className="flex items-center gap-2">
              <Video className="w-4 h-4 shrink-0 text-emerald-600" />
              <a
                href={
                  meeting.link_to_call.startsWith("http")
                    ? meeting.link_to_call
                    : `https://${meeting.link_to_call}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline flex items-center gap-1 truncate max-w-xs font-medium"
              >
                Join Video Call <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-3 border-t bg-muted/20">
        <ParticipantBadgeList participants={meeting.participants} />
      </CardFooter>
    </Card>
  )
}
