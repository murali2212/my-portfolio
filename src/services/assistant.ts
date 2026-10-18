export type MockSlot = {
  id: string
  startUtc: string
  durationMinutes: 30
}

export type BookingProposal = {
  slot: MockSlot
  name: string
  email: string
  topic: string
  visitorTimeZone: string
}

export type MessageProposal = {
  name: string
  email: string
  message: string
}

export type ChatBlock =
  | { type: 'quick-replies' }
  | { type: 'projects-link' }
  | { type: 'slots'; slots: MockSlot[]; visitorTimeZone: string }
  | { type: 'booking-form'; slot: MockSlot }
  | { type: 'message-form' }
  | { type: 'booking-confirmation'; proposal: BookingProposal }
  | { type: 'message-confirmation'; proposal: MessageProposal }

export type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  text: string
  block?: ChatBlock
}

const OWNER_OFFSET_MINUTES = 5 * 60 + 30

function delay() {
  return new Promise<void>((resolve) => setTimeout(resolve, 350))
}

export async function getMockAvailableSlots(_visitorTimeZone: string): Promise<MockSlot[]> {
  await delay()

  const now = Date.now()
  const ownerDate = new Date(now + OWNER_OFFSET_MINUTES * 60_000)
  const year = ownerDate.getUTCFullYear()
  const month = ownerDate.getUTCMonth()
  const dayOfMonth = ownerDate.getUTCDate()
  const slots: MockSlot[] = []

  for (let dayOffset = 0; dayOffset <= 30 && slots.length < 4; dayOffset += 1) {
    const day = new Date(Date.UTC(year, month, dayOfMonth + dayOffset))
    const weekday = day.getUTCDay()
    if (weekday === 0 || weekday === 6) continue

    for (const hour of [10, 12, 15, 17]) {
      const start = Date.UTC(
        day.getUTCFullYear(),
        day.getUTCMonth(),
        day.getUTCDate(),
        hour,
        0,
      ) - OWNER_OFFSET_MINUTES * 60_000
      if (start < now + 12 * 60 * 60_000 || start > now + 30 * 24 * 60 * 60_000) continue
      slots.push({
        id: `mock-${start}`,
        startUtc: new Date(start).toISOString(),
        durationMinutes: 30,
      })
      if (slots.length === 4) break
    }
  }
  return slots
}

export async function confirmMockBooking(_proposal: BookingProposal): Promise<void> {
  await delay()
}

export async function confirmMockMessage(_proposal: MessageProposal): Promise<void> {
  await delay()
}

export async function getAssistantReply(_text: string): Promise<string> {
  await delay()
  return 'I can only help you book a call or send a message to Murali. For anything else, please take a look at the projects.'
}
