export interface Participant {
  id: string
  name: string
  email: string
  created_at?: string
}

export interface Meeting {
  id: string
  title: string
  description?: string | null
  link_to_call?: string | null
  place?: string | null
  start_time?: string | null
  end_time?: string | null
  created_at: string
  updated_at: string
  participants: Participant[]
}

export interface CreateMeetingPayload {
  title: string
  description?: string
  link_to_call?: string
  place?: string
  start_time?: string
  end_time?: string
  participant_ids?: string[]
  new_participants?: { name: string; email: string }[]
}

export interface CreateParticipantPayload {
  name: string
  email: string
}
