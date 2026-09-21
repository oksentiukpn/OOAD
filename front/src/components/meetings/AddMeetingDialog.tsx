import React, { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Participant, CreateMeetingPayload } from "@/types/meeting"
import { Plus, Check, UserPlus, X } from "lucide-react"

interface AddMeetingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  availableParticipants: Participant[]
  onSubmit: (data: CreateMeetingPayload) => Promise<void>
  onNewParticipantCreated?: (p: Participant) => void
}

export const AddMeetingDialog: React.FC<AddMeetingDialogProps> = ({
  open,
  onOpenChange,
  availableParticipants,
  onSubmit,
}) => {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [place, setPlace] = useState("")
  const [linkToCall, setLinkToCall] = useState("")
  const [selectedParticipantIds, setSelectedParticipantIds] = useState<string[]>([])

  // Inline newly added participants
  const [newParticipants, setNewParticipants] = useState<{ name: string; email: string }[]>([])
  const [showAddParticipantInput, setShowAddParticipantInput] = useState(false)
  const [newPartName, setNewPartName] = useState("")
  const [newPartEmail, setNewPartEmail] = useState("")
  const [inlineError, setInlineError] = useState("")

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  const toggleParticipant = (id: string) => {
    setSelectedParticipantIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const handleAddNewParticipant = (e: React.FormEvent) => {
    e.preventDefault()
    setInlineError("")
    if (!newPartName.trim() || !newPartEmail.trim()) {
      setInlineError("Both name and valid email are required.")
      return
    }
    if (!newPartEmail.includes("@")) {
      setInlineError("Please enter a valid email address.")
      return
    }
    setNewParticipants((prev) => [
      ...prev,
      { name: newPartName.trim(), email: newPartEmail.trim() },
    ])
    setNewPartName("")
    setNewPartEmail("")
    setShowAddParticipantInput(false)
  }

  const removeInlineParticipant = (index: number) => {
    setNewParticipants((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      setErrorMessage("Meeting title is required.")
      return
    }

    setIsSubmitting(true)
    setErrorMessage("")

    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || undefined,
        place: place.trim() || undefined,
        link_to_call: linkToCall.trim() || undefined,
        participant_ids: selectedParticipantIds,
        new_participants: newParticipants,
      })
      // Reset form
      setTitle("")
      setDescription("")
      setPlace("")
      setLinkToCall("")
      setSelectedParticipantIds([])
      setNewParticipants([])
      onOpenChange(false)
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to create meeting.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Schedule New Meeting</DialogTitle>
          <DialogDescription>
            Enter meeting details, location, video link, and select participants.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {errorMessage && (
            <div className="p-3 text-sm rounded bg-destructive/15 text-destructive border border-destructive/20">
              {errorMessage}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="title">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              placeholder="e.g., Weekly Sync, Sprint Retrospective"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="place">Place / Room</Label>
              <Input
                id="place"
                placeholder="e.g., Conf Room 2A or Remote"
                value={place}
                onChange={(e) => setPlace(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="link_to_call">Video Call Link</Label>
              <Input
                id="link_to_call"
                placeholder="https://meet.google.com/..."
                value={linkToCall}
                onChange={(e) => setLinkToCall(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Meeting agenda, notes, or objectives..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {/* Participants Selection */}
          <div className="space-y-2 pt-2 border-t">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold">Participants</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 text-xs flex items-center gap-1"
                onClick={() => setShowAddParticipantInput(!showAddParticipantInput)}
              >
                <UserPlus className="w-3.5 h-3.5" />
                {showAddParticipantInput ? "Close" : "Add New Person"}
              </Button>
            </div>

            {/* Existing Participants List */}
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-1 border rounded-md bg-muted/20">
              {availableParticipants.length === 0 ? (
                <span className="text-xs text-muted-foreground p-2">
                  No existing participants. Click "Add New Person" above to create one.
                </span>
              ) : (
                availableParticipants.map((p) => {
                  const isSelected = selectedParticipantIds.includes(p.id)
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => toggleParticipant(p.id)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${isSelected
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background text-foreground border-input hover:bg-muted"
                        }`}
                    >
                      {isSelected && <Check className="w-3 h-3" />}
                      <span>{p.name}</span>
                    </button>
                  )
                })
              )}
            </div>

            {/* Inline Newly Added Participants */}
            {newParticipants.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                <span className="text-xs text-muted-foreground self-center">New:</span>
                {newParticipants.map((np, idx) => (
                  <Badge key={idx} variant="default" className="flex items-center gap-1 text-xs">
                    {np.name} ({np.email})
                    <X
                      className="w-3 h-3 cursor-pointer hover:text-destructive"
                      onClick={() => removeInlineParticipant(idx)}
                    />
                  </Badge>
                ))}
              </div>
            )}

            {/* Form to quickly add a new participant */}
            {showAddParticipantInput && (
              <div className="p-3 border rounded-md bg-muted/40 space-y-2 mt-2">
                <div className="text-xs font-medium">New Participant Information</div>
                {inlineError && <p className="text-xs text-destructive">{inlineError}</p>}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <Input
                    placeholder="Full Name"
                    value={newPartName}
                    onChange={(e) => setNewPartName(e.target.value)}
                    className="h-8 text-xs"
                  />
                  <Input
                    placeholder="Email Address"
                    type="email"
                    value={newPartEmail}
                    onChange={(e) => setNewPartEmail(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs"
                    onClick={() => setShowAddParticipantInput(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={handleAddNewParticipant}
                  >
                    <Plus className="w-3 h-3 mr-1" /> Add to Meeting
                  </Button>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Meeting"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
