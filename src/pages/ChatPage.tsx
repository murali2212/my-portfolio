import { useEffect, useRef, useState } from 'react'
import type { FormEvent, KeyboardEvent } from 'react'
import { Link } from 'react-router-dom'
import {
  confirmMockBooking,
  confirmMockMessage,
  getAssistantReply,
  getMockAvailableSlots,
  type BookingProposal,
  type ChatBlock,
  type ChatMessage,
  type MockSlot,
  type MessageProposal,
} from '../services/assistant'
import './ChatPage.css'

function visitorTimeZone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
}

function dateInZone(utc: string, timeZone: string) {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone,
  }).format(new Date(utc))
}

function timeInZone(utc: string, timeZone: string) {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone,
  }).format(new Date(utc))
}

function timeZoneName(utc: string, timeZone: string) {
  return new Intl.DateTimeFormat('en-US', {
    timeZone,
    timeZoneName: 'short',
  })
    .formatToParts(new Date(utc))
    .find((part) => part.type === 'timeZoneName')?.value ?? timeZone
}

function ChatBlockView({
  block,
  onChoose,
  onCancel,
  onStartBooking,
  onStartMessage,
  onProposeBooking,
  onProposeMessage,
  onConfirmBooking,
  onConfirmMessage,
  disabled,
}: {
  block: ChatBlock
  onChoose: (slot: MockSlot) => void
  onCancel: () => void
  onStartBooking: () => void
  onStartMessage: () => void
  onProposeBooking: (proposal: BookingProposal) => void
  onProposeMessage: (proposal: MessageProposal) => void
  onConfirmBooking: (proposal: BookingProposal) => void
  onConfirmMessage: (proposal: MessageProposal) => void
  disabled: boolean
}) {
  if (block.type === 'quick-replies') {
    return (
      <div className="chat-quick-replies" role="group" aria-label="Choose how to continue">
        <button type="button" className="chat-chip" disabled={disabled} onClick={onStartBooking}>
          Book a call
        </button>
        <button type="button" className="chat-chip" disabled={disabled} onClick={onStartMessage}>
          Send a message
        </button>
      </div>
    )
  }

  if (block.type === 'projects-link') {
    return (
      <p className="chat-text">
        <Link to="/projects" className="chat-inline-link">View projects</Link>
      </p>
    )
  }

  if (block.type === 'slots') {
    if (!block.slots.length) {
      return <p className="chat-card-note">No mock slots are available right now. Please try again later.</p>
    }
    return (
      <div className="chat-slot-list" role="group" aria-label="Available mock meeting slots">
        {block.slots.map((slot) => (
          <button
            key={slot.id}
            type="button"
            className="chat-slot"
            disabled={disabled}
            onClick={() => onChoose(slot)}
          >
            <span>{dateInZone(slot.startUtc, block.visitorTimeZone)} {timeZoneName(slot.startUtc, block.visitorTimeZone)}</span>
            <small>{timeInZone(slot.startUtc, 'Asia/Kolkata')} IST</small>
          </button>
        ))}
      </div>
    )
  }

  if (block.type === 'booking-form') {
    return (
      <InlineContactForm
        mode="booking"
        slot={block.slot}
        onCancel={onCancel}
        onBookingProposal={onProposeBooking}
        onMessageProposal={onProposeMessage}
        disabled={disabled}
      />
    )
  }

  if (block.type === 'message-form') {
    return (
      <InlineContactForm
        mode="message"
        onCancel={onCancel}
        onBookingProposal={onProposeBooking}
        onMessageProposal={onProposeMessage}
        disabled={disabled}
      />
    )
  }

  if (block.type === 'booking-confirmation') {
    return (
      <div className="chat-confirm-card">
        <p className="chat-confirm-title">
          Confirm booking: {dateInZone(block.proposal.slot.startUtc, block.proposal.visitorTimeZone)} {timeZoneName(block.proposal.slot.startUtc, block.proposal.visitorTimeZone)}
        </p>
        <p className="chat-card-note">
          {timeInZone(block.proposal.slot.startUtc, 'Asia/Kolkata')} IST · 30 minutes
          {block.proposal.topic ? ` · ${block.proposal.topic}` : ''}
        </p>
        <div className="chat-card-actions">
          <button type="button" className="chat-action" disabled={disabled} onClick={() => onConfirmBooking(block.proposal)}>Confirm</button>
          <button type="button" className="chat-action chat-action--ghost" disabled={disabled} onClick={onCancel}>Cancel</button>
        </div>
      </div>
    )
  }

  return (
    <div className="chat-confirm-card">
      <p className="chat-confirm-title">Confirm message to Murali</p>
      <p className="chat-card-note">
        Reply to {block.proposal.email}: “{block.proposal.message}”
      </p>
      <div className="chat-card-actions">
        <button type="button" className="chat-action" disabled={disabled} onClick={() => onConfirmMessage(block.proposal)}>Confirm</button>
        <button type="button" className="chat-action chat-action--ghost" disabled={disabled} onClick={onCancel}>Cancel</button>
      </div>
    </div>
  )
}

function InlineContactForm({
  mode,
  slot,
  onCancel,
  onBookingProposal,
  onMessageProposal,
  disabled,
}: {
  mode: 'booking' | 'message'
  slot?: MockSlot
  onCancel: () => void
  onBookingProposal: (proposal: BookingProposal) => void
  onMessageProposal: (proposal: MessageProposal) => void
  disabled: boolean
}) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [topic, setTopic] = useState('')
  const [message, setMessage] = useState('')
  const [honeypot, setHoneypot] = useState('')

  function submit(e: FormEvent) {
    e.preventDefault()
    if (honeypot) return
    if (mode === 'booking' && slot) {
      onBookingProposal({
        slot,
        name: name.trim(),
        email: email.trim(),
        topic: topic.trim(),
        visitorTimeZone: visitorTimeZone(),
      })
    } else if (mode === 'message') {
      onMessageProposal({
        name: name.trim(),
        email: email.trim(),
        message: message.trim(),
      })
    }
  }

  return (
    <form className="chat-inline-form" onSubmit={submit}>
      <label className="chat-field">
        <span>Name</span>
        <input required autoComplete="name" maxLength={100} value={name} onChange={(e) => setName(e.target.value)} disabled={disabled} />
      </label>
      <label className="chat-field">
        <span>Email</span>
        <input required type="email" autoComplete="email" maxLength={254} value={email} onChange={(e) => setEmail(e.target.value)} disabled={disabled} />
      </label>
      {mode === 'booking' ? (
        <label className="chat-field">
          <span>What would you like to discuss? (optional)</span>
          <input maxLength={200} value={topic} onChange={(e) => setTopic(e.target.value)} disabled={disabled} />
        </label>
      ) : (
        <label className="chat-field">
          <span>Message</span>
          <textarea required maxLength={500} rows={4} value={message} onChange={(e) => setMessage(e.target.value)} disabled={disabled} />
          <small>{message.length}/500</small>
        </label>
      )}
      <label className="chat-honeypot" aria-hidden="true">
        Leave this field empty
        <input tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
      </label>
      <div className="chat-card-actions">
        <button type="submit" className="chat-action" disabled={disabled}>Review {mode === 'booking' ? 'booking' : 'message'}</button>
        <button type="button" className="chat-action chat-action--ghost" disabled={disabled} onClick={onCancel}>Cancel</button>
      </div>
    </form>
  )
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm0',
      role: 'assistant',
      text: 'Hi, I can help you book a call or send a message to Murali. What would you like to do?',
      block: { type: 'quick-replies' },
    },
  ])
  const [input, setInput] = useState('')
  const [pending, setPending] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const counter = useRef(1)
  const zone = useRef(visitorTimeZone())

  useEffect(() => {
    const el = listRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, pending])

  useEffect(() => {
    inputRef.current?.focus({ preventScroll: true })
  }, [])

  function addMessage(role: ChatMessage['role'], text: string, block?: ChatBlock) {
    const item: ChatMessage = { id: `m${counter.current++}`, role, text, block }
    setMessages((current) => [...current, item])
    return item.id
  }

  function replaceMessage(id: string, text: string, block?: ChatBlock) {
    setMessages((current) =>
      current.map((item) => item.id === id ? { ...item, text, block } : item),
    )
  }

  async function startBooking() {
    if (pending) return
    addMessage('user', 'Book a call')
    addMessage('assistant', 'Here are a few available mock times. Choose one to continue.')
    setPending(true)
    try {
      const slots = await getMockAvailableSlots(zone.current)
      setMessages((current) => {
        const lastAssistant = [...current].reverse().find((item) => item.role === 'assistant' && !item.block)
        return lastAssistant
          ? current.map((item) => item.id === lastAssistant.id
            ? { ...item, block: { type: 'slots', slots, visitorTimeZone: zone.current } }
            : item)
          : current
      })
    } finally {
      setPending(false)
    }
  }

  function startMessage() {
    addMessage('user', 'Send a message')
    addMessage('assistant', 'Please add your contact details and message. I’ll show you a confirmation before sending.')
    setMessages((current) => {
      const last = current[current.length - 1]
      return current.map((item) => item.id === last.id ? { ...item, block: { type: 'message-form' } } : item)
    })
  }

  function chooseSlot(slot: MockSlot) {
    addMessage('user', `Selected ${dateInZone(slot.startUtc, zone.current)} ${timeZoneName(slot.startUtc, zone.current)}`)
    addMessage('assistant', 'Add your details to review this booking proposal.', { type: 'booking-form', slot })
  }

  function proposeBooking(proposal: BookingProposal, formId: string) {
    replaceMessage(formId, 'Booking details ready for review.')
    addMessage('assistant', '', { type: 'booking-confirmation', proposal })
  }

  function proposeMessage(proposal: MessageProposal, formId: string) {
    replaceMessage(formId, 'Message details ready for review.')
    addMessage('assistant', '', { type: 'message-confirmation', proposal })
  }

  async function confirmBooking(proposal: BookingProposal, cardId: string) {
    setPending(true)
    try {
      await confirmMockBooking(proposal)
      replaceMessage(cardId, 'Mock booking confirmed. No calendar event was created in this phase.')
    } catch {
      replaceMessage(cardId, 'The mock booking could not be confirmed. Please try again.')
    } finally {
      setPending(false)
    }
  }

  async function confirmMessage(proposal: MessageProposal, cardId: string) {
    setPending(true)
    try {
      await confirmMockMessage(proposal)
      replaceMessage(cardId, 'Mock message sent. No email was sent in this phase.')
    } catch {
      replaceMessage(cardId, 'The mock message could not be confirmed. Please try again.')
    } finally {
      setPending(false)
    }
  }

  function cancelCard(id: string) {
    replaceMessage(id, 'Cancelled. You can choose another option whenever you’re ready.')
  }

  async function submit(e?: FormEvent) {
    e?.preventDefault()
    const text = input.trim()
    if (!text || pending) return
    addMessage('user', text)
    setInput('')
    setPending(true)
    try {
      const reply = await getAssistantReply(text)
      addMessage('assistant', reply, { type: 'projects-link' })
    } finally {
      setPending(false)
      inputRef.current?.focus({ preventScroll: true })
    }
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault()
      void submit()
    }
  }

  return (
    <main className="chat-page">
      <div className="chat-shell">
        <header className="chat-head">
          <Link to="/" className="chat-back" onClick={() => window.scrollTo({ top: 0, left: 0, behavior: 'instant' })}>
            <span aria-hidden="true">←</span> HOME
          </Link>
          <h1 className="chat-title">AI ASSISTANT</h1>
        </header>

        <div ref={listRef} className="chat-list" role="log" aria-live="polite" aria-label="Conversation">
          {messages.map((item) => (
            <div key={item.id} className={`chat-msg chat-msg--${item.role}`}>
              <span className="chat-who">{item.role === 'user' ? 'YOU' : 'ASSISTANT'}</span>
              {item.text && <p className="chat-text">{item.text}</p>}
              {item.block && (
                <ChatBlockView
                  block={item.block}
                  onChoose={chooseSlot}
                  onCancel={() => cancelCard(item.id)}
                  onStartBooking={() => void startBooking()}
                  onStartMessage={startMessage}
                  onProposeBooking={(proposal) => proposeBooking(proposal, item.id)}
                  onProposeMessage={(proposal) => proposeMessage(proposal, item.id)}
                  onConfirmBooking={(proposal) => void confirmBooking(proposal, item.id)}
                  onConfirmMessage={(proposal) => void confirmMessage(proposal, item.id)}
                  disabled={pending}
                />
              )}
            </div>
          ))}
          {pending && (
            <div className="chat-msg chat-msg--assistant" aria-label="Assistant is typing">
              <span className="chat-who">ASSISTANT</span>
              <p className="chat-text chat-typing"><span /><span /><span /></p>
            </div>
          )}
        </div>

        <form className="chat-form" onSubmit={submit}>
          <label htmlFor="chat-input" className="chat-sr">Message</label>
          <textarea
            id="chat-input"
            ref={inputRef}
            className="chat-input"
            rows={1}
            value={input}
            placeholder="Ask about booking or messaging"
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            disabled={pending}
          />
          <button type="submit" className="chat-send" disabled={pending || !input.trim()}>SEND</button>
        </form>
        <p className="chat-privacy">Your name and email are used only to book the call or reply to you.</p>
      </div>
    </main>
  )
}
