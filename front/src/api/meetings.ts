import { CreateMeetingPayload, CreateParticipantPayload, Meeting, Participant } from "@/types/meeting"

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1"

export async function fetchMeetings(search?: string): Promise<Meeting[]> {
  const url = new URL(`${API_BASE}/meetings`)
  if (search) {
    url.searchParams.set("search", search)
  }
  const res = await fetch(url.toString())
  if (!res.ok) {
    throw new Error(`Failed to fetch meetings: ${res.statusText}`)
  }
  return res.json()
}

export async function createMeeting(payload: CreateMeetingPayload): Promise<Meeting> {
  const res = await fetch(`${API_BASE}/meetings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    throw new Error(errorData.detail || `Failed to create meeting: ${res.statusText}`)
  }
  return res.json()
}

export async function deleteMeeting(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/meetings/${id}`, {
    method: "DELETE",
  })
  if (!res.ok) {
    throw new Error(`Failed to delete meeting: ${res.statusText}`)
  }
}

export async function fetchParticipants(): Promise<Participant[]> {
  const res = await fetch(`${API_BASE}/participants`)
  if (!res.ok) {
    throw new Error(`Failed to fetch participants: ${res.statusText}`)
  }
  return res.json()
}

export async function createParticipant(payload: CreateParticipantPayload): Promise<Participant> {
  const res = await fetch(`${API_BASE}/participants`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    throw new Error(errorData.detail || `Failed to create participant: ${res.statusText}`)
  }
  return res.json()
}
