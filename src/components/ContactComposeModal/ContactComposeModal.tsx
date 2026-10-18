import { useEffect, useRef, useState } from "react";
import type { FormEvent, RefObject } from "react";
import "./ContactComposeModal.css";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const ENDPOINT = "https://api.web3forms.com/submit";

/** Focus the dialog on open, trap Tab inside it, close on Esc, restore focus on close. */
function useDialog(ref: RefObject<HTMLElement | null>, active: boolean, onEscape: () => void) {
  const escRef = useRef(onEscape);
  escRef.current = onEscape;
  useEffect(() => {
    if (!active || !ref.current) return;
    const node = ref.current;
    const previous = document.activeElement as HTMLElement | null;
    const list = () =>
      [...node.querySelectorAll<HTMLInputElement>('input, textarea, button, a[href]')].filter(
        (el) => !el.disabled && el.tabIndex !== -1 && el.offsetParent !== null
      );
    (node.querySelector<HTMLElement>("[data-autofocus]") || list()[0] || node).focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.stopPropagation(); escRef.current?.(); return; }
      if (e.key !== "Tab") return;
      const f = list();
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    node.addEventListener("keydown", onKey);
    return () => {
      node.removeEventListener("keydown", onKey);
      if (previous && document.contains(previous)) previous.focus();
    };
  }, [active, ref]);
}

type Props = { open: boolean; onClose?: () => void; to: string; accessKey?: string };

export default function ContactComposeModal({ open, onClose, to, accessKey }: Props) {
  const [step, setStep] = useState("compose");        // "compose" | "email"
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");       // idle | sending | sent | error
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [visitorEmail, setVisitorEmail] = useState("");
  const [emailDraft, setEmailDraft] = useState("");
  const [msgError, setMsgError] = useState("");
  const [emailError, setEmailError] = useState("");
  const honeyRef = useRef<HTMLInputElement>(null);
  const composeRef = useRef<HTMLDivElement>(null);
  const emailRef = useRef<HTMLDivElement>(null);

  const emailOpen = open && step === "email";
  const composeActive = open && step === "compose";

  const closeAll = () => {
    if (status === "sent") {                 // typed text survives close, unless it was sent
      setSubject(""); setMessage(""); setVisitorEmail(""); setStatus("idle");
    }
    setStep("compose"); setMsgError(""); setEmailError("");
    onClose?.();
  };

  useDialog(composeRef, composeActive, closeAll);
  useDialog(emailRef, emailOpen, () => { setStep("compose"); setEmailError(""); });

  // make the compose dialog inert while the email popup is on top (works in React 18 and 19)
  useEffect(() => {
    if (composeRef.current) composeRef.current.inert = emailOpen;
  }, [emailOpen, open]);

  // lock page scroll while open
  useEffect(() => {
    if (!open) return;
    const body = document.body;
    const prevOverflow = body.style.overflow, prevPad = body.style.paddingRight;
    const sw = window.innerWidth - document.documentElement.clientWidth;
    body.style.overflow = "hidden";
    if (sw > 0) body.style.paddingRight = `${sw}px`;
    return () => { body.style.overflow = prevOverflow; body.style.paddingRight = prevPad; };
  }, [open]);

  async function send() {
    setStatus("sending");
    try {
      if (honeyRef.current?.value) { setStatus("sent"); return; }   // bot: pretend success
      if (!accessKey) throw new Error("Missing access key");
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: accessKey,
          subject: subject.trim() ? `Portfolio message: ${subject.trim()}` : "Portfolio message",
          from_name: visitorEmail,
          name: visitorEmail,
          email: visitorEmail,
          message,
          botcheck: "",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) throw new Error(data.message || "Send failed");
      setStatus("sent");
    } catch (err) {
      console.error("[ContactComposeModal]", err);
      setStatus("error");
    }
  }

  function onSendClick(e: FormEvent) {
    e.preventDefault();
    if (status === "sending") return;
    if (message.trim().length < 10) { setMsgError("Please write at least 10 characters."); return; }
    setMsgError("");
    if (!EMAIL_RE.test(visitorEmail)) { setEmailDraft(visitorEmail); setStep("email"); return; }
    send();
  }

  function onEmailContinue(e: FormEvent) {
    e.preventDefault();
    const v = emailDraft.trim();
    if (!EMAIL_RE.test(v)) { setEmailError("Please enter a valid email address."); return; }
    setVisitorEmail(v); setEmailError(""); setStep("compose");
  }

  if (!open) return null;

  return (
    <div className="ccm-root">
      <div className="ccm-backdrop" onMouseDown={closeAll} />

      <div
        ref={composeRef}
        className="ccm-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ccm-title"
        aria-hidden={emailOpen ? "true" : undefined}
      >
        <button type="button" className="ccm-x" aria-label="Close" onClick={closeAll}>×</button>

        {status === "sent" ? (
          <div className="ccm-done">
            <h2 id="ccm-title" className="ccm-title">MESSAGE SENT</h2>
            <p className="ccm-text">Thank you. I will reply to {visitorEmail}.</p>
            <button type="button" className="ccm-btn" onClick={closeAll} data-autofocus>CLOSE</button>
          </div>
        ) : (
          <form onSubmit={onSendClick} noValidate>
            <h2 id="ccm-title" className="ccm-title">NEW MESSAGE</h2>

            <div className="ccm-row">
              <span className="ccm-label">TO</span>
              <span className="ccm-to">{to}</span>
            </div>

            <label className="ccm-row">
              <span className="ccm-label">SUBJECT</span>
              <input className="ccm-input" type="text" value={subject} maxLength={120}
                onChange={(e) => setSubject(e.target.value)} />
            </label>

            <label className="ccm-field">
              <span className="ccm-label">MESSAGE</span>
              <textarea className="ccm-textarea" rows={6} value={message} data-autofocus
                aria-invalid={!!msgError} onChange={(e) => { setMessage(e.target.value); setMsgError(""); }} />
            </label>
            {msgError && <p className="ccm-error" role="alert">{msgError}</p>}

            {/* honeypot: hidden from people, bots fill it */}
            <input ref={honeyRef} type="text" name="botcheck" tabIndex={-1} autoComplete="off"
              aria-hidden="true" className="ccm-honey" />

            {visitorEmail && (
              <p className="ccm-reply">
                REPLY TO: <strong>{visitorEmail}</strong>{" "}
                <button type="button" className="ccm-link"
                  onClick={() => { setEmailDraft(visitorEmail); setStep("email"); }}>CHANGE</button>
              </p>
            )}
            {status === "error" && (
              <p className="ccm-error" role="alert">Could not send. Please try again.</p>
            )}

            <div className="ccm-actions">
              <button type="submit" className="ccm-btn" disabled={status === "sending"}>
                {status === "sending" ? "SENDING..." : "SEND"}
              </button>
            </div>
          </form>
        )}
      </div>

      {emailOpen && (
        <div className="ccm-layer">
          <div className="ccm-backdrop ccm-backdrop--top" onMouseDown={() => { setStep("compose"); setEmailError(""); }} />
          <div ref={emailRef} className="ccm-dialog ccm-dialog--small" role="dialog" aria-modal="true" aria-labelledby="ccm-email-title">
            <button type="button" className="ccm-x" aria-label="Back to message"
              onClick={() => { setStep("compose"); setEmailError(""); }}>×</button>
            <form onSubmit={onEmailContinue} noValidate>
              <h2 id="ccm-email-title" className="ccm-title">YOUR EMAIL</h2>
              <p className="ccm-text">So I can reply to you.</p>
              <label className="ccm-field">
                <span className="ccm-label">EMAIL</span>
                <input className="ccm-input ccm-input--box" type="email" inputMode="email" autoComplete="email"
                  value={emailDraft} data-autofocus aria-invalid={!!emailError}
                  onChange={(e) => { setEmailDraft(e.target.value); setEmailError(""); }} />
              </label>
              {emailError && <p className="ccm-error" role="alert">{emailError}</p>}
              <div className="ccm-actions">
                <button type="button" className="ccm-btn ccm-btn--ghost"
                  onClick={() => { setStep("compose"); setEmailError(""); }}>BACK</button>
                <button type="submit" className="ccm-btn">CONTINUE</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
