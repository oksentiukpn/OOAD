import { useEffect, useState, useMemo } from "react"
import { Meeting, Participant, CreateMeetingPayload } from "@/types/meeting"
import { fetchMeetings, fetchParticipants, createMeeting, deleteMeeting } from "@/api/meetings"
import { MeetingCard } from "@/components/meetings/MeetingCard"
import { AddMeetingDialog } from "@/components/meetings/AddMeetingDialog"
import { DeleteMeetingDialog } from "@/components/meetings/DeleteMeetingDialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calendar, Plus, Search, Users, Video, RefreshCw } from "lucide-react"

export function App() {
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [participants, setParticipants] = useState<Participant[]>([])
  const [search, setSearch] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [meetingToDelete, setMeetingToDelete] = useState<Meeting | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadData = async (searchQuery?: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const [meetingsData, participantsData] = await Promise.all([
        fetchMeetings(searchQuery),
        fetchParticipants(),
      ])
      setMeetings(meetingsData)
      setParticipants(participantsData)
    } catch (err: any) {
      console.error(err)
      setError(err.message || "Failed to load meetings")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    loadData(search.trim())
  }

  const handleCreateMeeting = async (payload: CreateMeetingPayload) => {
    await createMeeting(payload)
    await loadData(search.trim())
  }

  const handleConfirmDelete = async () => {
    if (!meetingToDelete) return
    setIsDeleting(true)
    try {
      await deleteMeeting(meetingToDelete.id)
      setMeetingToDelete(null)
      await loadData(search.trim())
    } catch (err: any) {
      alert(`Failed to delete meeting: ${err.message}`)
    } finally {
      setIsDeleting(false)
    }
  }

  const stats = useMemo(() => {
    const totalMeetings = meetings.length
    const withCallLink = meetings.filter((m) => !!m.link_to_call).length
    const uniqueParticipants = new Set(
      meetings.flatMap((m) => m.participants.map((p) => p.id))
    ).size
    return { totalMeetings, withCallLink, uniqueParticipants }
  }, [meetings])

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-primary text-primary-foreground p-2 rounded-lg">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-none">Meeting Hub</h1>
              <p className="text-xs text-muted-foreground mt-0.5">Manage schedules & participants</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadData(search.trim())}
              disabled={isLoading}
              title="Refresh"
              className="h-9 px-3"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
            <Button
              onClick={() => setIsAddOpen(true)}
              className="h-9 gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>New Meeting</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8 space-y-6">
        {/* Metric / Stat Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl border bg-card flex items-center gap-4">
            <div className="p-3 bg-primary/10 text-primary rounded-lg">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.totalMeetings}</div>
              <div className="text-xs text-muted-foreground">Total Meetings</div>
            </div>
          </div>

          <div className="p-4 rounded-xl border bg-card flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-lg">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.withCallLink}</div>
              <div className="text-xs text-muted-foreground">Video Calls Configured</div>
            </div>
          </div>

          <div className="p-4 rounded-xl border bg-card flex items-center gap-4">
            <div className="p-3 bg-indigo-500/10 text-indigo-600 rounded-lg">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.uniqueParticipants}</div>
              <div className="text-xs text-muted-foreground">Active Participants</div>
            </div>
          </div>
        </div>

        {/* Filter / Search bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <form onSubmit={handleSearch} className="flex gap-2 w-full sm:max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search meetings by title, description, or room..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button type="submit" variant="secondary" className="shrink-0">
              Search
            </Button>
          </form>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="p-4 rounded-lg bg-destructive/10 text-destructive border border-destructive/20 flex items-center justify-between">
            <div className="text-sm">{error}</div>
            <Button variant="outline" size="sm" onClick={() => loadData()}>
              Retry
            </Button>
          </div>
        )}

        {/* Meetings Grid */}
        {isLoading && meetings.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground flex flex-col items-center gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-primary" />
            <p className="text-sm">Loading meetings...</p>
          </div>
        ) : meetings.length === 0 ? (
          <div className="text-center py-16 border rounded-xl border-dashed bg-card/50 space-y-4">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
              <Calendar className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-semibold">No meetings found</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                {search
                  ? `No meetings match "${search}". Try clearing your query.`
                  : "Get started by scheduling your first team meeting."}
              </p>
            </div>
            <Button onClick={() => setIsAddOpen(true)} className="gap-1.5">
              <Plus className="w-4 h-4" />
              <span>Create Meeting</span>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {meetings.map((meeting) => (
              <MeetingCard
                key={meeting.id}
                meeting={meeting}
                onDeleteRequest={(m) => setMeetingToDelete(m)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Add Dialog */}
      <AddMeetingDialog
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        availableParticipants={participants}
        onSubmit={handleCreateMeeting}
      />

      {/* Delete Confirmation */}
      <DeleteMeetingDialog
        meeting={meetingToDelete}
        open={!!meetingToDelete}
        onOpenChange={(open) => !open && setMeetingToDelete(null)}
        onConfirmDelete={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  )
}

export default App
