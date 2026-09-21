import React from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Meeting } from "@/types/meeting"

interface DeleteMeetingDialogProps {
  meeting: Meeting | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirmDelete: () => Promise<void>
  isDeleting: boolean
}

export const DeleteMeetingDialog: React.FC<DeleteMeetingDialogProps> = ({
  meeting,
  open,
  onOpenChange,
  onConfirmDelete,
  isDeleting,
}) => {
  if (!meeting) return null

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Meeting</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete <span className="font-semibold text-foreground">"{meeting.title}"</span>?
            This will remove the meeting and all associated schedule links. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              onConfirmDelete()
            }}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? "Deleting..." : "Delete Meeting"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
