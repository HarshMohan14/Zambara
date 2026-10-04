'use client'

/*
 * Hand-written blocks used by the cinematic home page (desktop + mobile).
 * They connect the new design to the site's existing APIs:
 *   - PreBookModal   → POST /api/pre-bookings
 *   - NewsletterBlock → POST /api/newsletter
 *   - ContactBlock   → POST /api/contact
 *   - RankingsBlock  → GET  /api/events + /api/rankings
 */
import { useEffect, useRef, useState } from 'react'
import { apiClient } from '@/lib/api-client'

export const PACKS = [
  { id: '2-4' as const, label: '2–4 PLAYERS', price: 799, players: 4 },
  { id: '5-8' as const, label: '5–8 PLAYERS', price: 899, players: 8 },
]

const inr = (n: number) => '₹' + n.toLocaleString('en-IN')

function useLockScroll(open: boolean) {
  useEffect(() => {
    if (!open) return
    const prev = document.documentElement.style.overflow
    document.documentElement.style.overflow = 'hidden'
    return () => {
      document.documentElement.style.overflow = prev
    }
  }, [open])
}

function useEscape(open: boolean, onClose: () => void) {
  useEffect(() => {
    if (!open) return
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [open, onClose])
}

/* ------------------------------------------------------------------ */
/* Pre-booking modal                                                   */
/* ------------------------------------------------------------------ */
export function PreBookModal({ open, onClose, edition = 0, qty = 1 }: { open: boolean; onClose: () => void; edition?: number; qty?: number }) {
  const [pack, setPack] = useState(0)
  const [count, setCount] = useState(1)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [mobile, setMobile] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const first = useRef<HTMLInputElement>(null)
  const close = () => {
    onClose()
  }
  useLockScroll(open)
  useEscape(open, close)

  useEffect(() => {
    if (open) {
      setPack(edition || 0)
      setCount(Math.max(1, qty || 1))
      setError(null)
      setDone(false)
      setTimeout(() => first.current?.focus(), 60)
    }
  }, [open, edition, qty])

  if (!open) return null
  const p = PACKS[pack]

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const digits = mobile.replace(/\D/g, '')
    if (digits.length < 10 || digits.length > 15) {
      setError('Please enter a valid mobile number (10–15 digits).')
      return
    }
    setBusy(true)
    try {
      const res = await apiClient.createPreBooking({
        name: name.trim(),
        email: email.trim(),
        mobile: digits,
        numberOfPlayers: p.players,
        specialRequests: `Pack: ${p.id} players · Quantity: ${count} · Total: ${inr(p.price * count)}`,
      })
      if (res.success) setDone(true)
      else setError(res.error || 'Could not submit your pre-booking. Please try again.')
    } catch (err: any) {
      setError(err?.message || 'Could not submit your pre-booking. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="zhb-modal" role="dialog" aria-modal="true" aria-label="Pre-book the Zambaara Battle Pack">
      <button type="button" className="zhb-scrim" aria-label="Close" onClick={close} />
      <div className="zhb-panel">
        <button type="button" className="zhb-x" aria-label="Close" onClick={close}>✕</button>
        {done ? (
          <div className="zhb-done" role="status">
            <div className="zhb-eyebrow">PRE-BOOKING CONFIRMED</div>
            <h3 className="zhb-h3">Thank you, {name.trim().split(' ')[0] || 'Zampion'}!</h3>
            <p className="zhb-p">
              Your pre-booking for {count} × Zambaara Battle Pack ({p.label.toLowerCase()}) is in. We will contact you on {mobile} when the game is ready to ship.
            </p>
            <button type="button" className="zhb-btn zhb-btn-gold" onClick={close}>BACK TO THE ARENA</button>
          </div>
        ) : (
          <form onSubmit={submit} noValidate={false}>
            <div className="zhb-eyebrow">ZAMBAARA BATTLE PACK</div>
            <h3 className="zhb-h3">Pre-book now</h3>
            <div className="zhb-label">EDITION</div>
            <div className="zhb-seg" role="group" aria-label="Edition">
              {PACKS.map((x, i) => (
                <button key={x.id} type="button" aria-pressed={pack === i} className={pack === i ? 'on' : ''} onClick={() => setPack(i)}>
                  {x.label} · {inr(x.price)}
                </button>
              ))}
            </div>
            <div className="zhb-row">
              <div>
                <div className="zhb-label">QUANTITY</div>
                <div className="zhb-qty" role="group" aria-label="Quantity">
                  <button type="button" aria-label="Decrease quantity" onClick={() => setCount(Math.max(1, count - 1))}>−</button>
                  <span aria-live="polite">{count}</span>
                  <button type="button" aria-label="Increase quantity" onClick={() => setCount(Math.min(10, count + 1))}>+</button>
                </div>
              </div>
              <div className="zhb-total">
                <div className="zhb-label">TOTAL</div>
                <div className="zhb-price">{inr(p.price * count)}</div>
              </div>
            </div>
            <label className="zhb-field">
              <span className="zhb-label">NAME</span>
              <input ref={first} required autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
            </label>
            <label className="zhb-field">
              <span className="zhb-label">EMAIL</span>
              <input type="email" required autoComplete="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>
            <label className="zhb-field">
              <span className="zhb-label">MOBILE NUMBER</span>
              <input type="tel" required autoComplete="tel" inputMode="tel" value={mobile} onChange={(e) => setMobile(e.target.value)} />
            </label>
            {error && <div className="zhb-error" role="alert">{error}</div>}
            <button type="submit" className="zhb-btn zhb-btn-gold zhb-wide" disabled={busy}>
              {busy ? 'SUBMITTING…' : 'CONFIRM PRE-BOOKING'}
            </button>
            <p className="zhb-small">Fill out the pre-booking form and we will contact you when the game is ready to ship.</p>
          </form>
        )}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Rankings (live data)                                                */
/* ------------------------------------------------------------------ */
interface RankRow { id: string; rank: number; playerName: string; time: number }
interface EventRanks { event: { id: string; name: string }; rankings: RankRow[] }

export function RankingsBlock() {
  const [items, setItems] = useState<EventRanks[] | null>(null)
  const [idx, setIdx] = useState(0)
  useEffect(() => {
    let dead = false
    ;(async () => {
      try {
        const er = await fetch('/api/events?limit=20').then((r) => r.json())
        const events = (er?.success && er.data?.events) || []
        const rows: EventRanks[] = await Promise.all(
          events.slice(0, 8).map(async (ev: any) => {
            const rr = await fetch(`/api/rankings?eventId=${encodeURIComponent(ev.id)}&page=1&pageSize=5`).then((r) => r.json()).catch(() => null)
            return { event: { id: ev.id, name: ev.name }, rankings: (rr?.success && rr.data?.rankings) || [] }
          })
        )
        if (!dead) setItems(rows.filter((x) => x.rankings.length))
      } catch {
        if (!dead) setItems([])
      }
    })()
    return () => {
      dead = true
    }
  }, [])

  if (!items || !items.length) return <span id="rankings" aria-hidden="true" />
  const cur = items[Math.min(idx, items.length - 1)]
  return (
    <section id="rankings" className="zhb-section" aria-labelledby="zhb-rank-h">
      <div className="zhb-wrap">
        <div className="zhb-eyebrow zhb-center">HALL OF CHAMPIONS</div>
        <h2 id="zhb-rank-h" className="zhb-h2 zhb-center">EVENT RANKINGS</h2>
        <p className="zhb-p zhb-center">Top 5 players per event by fastest time to defeat the Host.</p>
        {items.length > 1 && (
          <div className="zhb-tabs" role="tablist" aria-label="Events">
            {items.map((it, i) => (
              <button key={it.event.id} role="tab" aria-selected={i === idx} className={i === idx ? 'on' : ''} onClick={() => setIdx(i)}>
                {it.event.name}
              </button>
            ))}
          </div>
        )}
        <ol className="zhb-rank" aria-label={cur.event.name}>
          {cur.rankings.map((r, i) => (
            <li key={r.id || i} className={i === 0 ? 'gold' : ''}>
              <span className="n">{String(r.rank || i + 1).padStart(2, '0')}</span>
              <span className="nm">{r.playerName}</span>
              <span className="t">{r.time != null ? `${r.time}s` : '—'}</span>
            </li>
          ))}
        </ol>
        <div className="zhb-center" style={{ marginTop: 22 }}>
          <a className="zhb-btn" href="/tournaments">ALL TOURNAMENTS</a>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* Newsletter                                                          */
/* ------------------------------------------------------------------ */
export function NewsletterBlock() {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<'idle' | 'busy' | 'ok' | 'err'>('idle')
  const [msg, setMsg] = useState('')
  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setState('busy')
    try {
      const r = await apiClient.subscribeNewsletter({ email: email.trim() })
      if (r.success) {
        setState('ok')
        setMsg('You’re in. Watch your inbox for events, drops and tournaments.')
        setEmail('')
      } else {
        setState('err')
        setMsg(r.error || 'Could not subscribe. Please try again.')
      }
    } catch {
      setState('err')
      setMsg('Could not subscribe. Please try again.')
    }
  }
  return (
    <section className="zhb-section" aria-labelledby="zhb-news-h">
      <div className="zhb-wrap zhb-glass zhb-news">
        <div>
          <div className="zhb-eyebrow">STAY UPDATED</div>
          <h2 id="zhb-news-h" className="zhb-h2">Join the Zampions</h2>
          <p className="zhb-p">New events, tournaments and Battle Pack news — straight to your inbox.</p>
        </div>
        <form className="zhb-inline" onSubmit={submit}>
          <label className="zhb-sr" htmlFor="zhb-news-email">Email address</label>
          <input id="zhb-news-email" type="email" required placeholder="Your email" autoComplete="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <button type="submit" className="zhb-btn zhb-btn-gold" disabled={state === 'busy'}>{state === 'busy' ? '…' : 'SUBSCRIBE'}</button>
          {msg && <div className={state === 'ok' ? 'zhb-ok' : 'zhb-error'} role="status">{msg}</div>}
        </form>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* Contact                                                             */
/* ------------------------------------------------------------------ */
export function ContactBlock() {
  const [f, setF] = useState({ name: '', email: '', subject: '', message: '' })
  const [state, setState] = useState<'idle' | 'busy' | 'ok' | 'err'>('idle')
  const [msg, setMsg] = useState('')
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value })
  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setState('busy')
    try {
      const r = await apiClient.submitContact({ name: f.name.trim(), email: f.email.trim(), subject: f.subject.trim() || undefined, message: f.message.trim() })
      if (r.success) {
        setState('ok')
        setMsg('Message sent successfully! We’ll get back to you soon.')
        setF({ name: '', email: '', subject: '', message: '' })
      } else {
        setState('err')
        setMsg(r.error || 'Failed to send message. Please try again.')
      }
    } catch {
      setState('err')
      setMsg('Failed to send message. Please try again.')
    }
  }
  return (
    <section id="contact" className="zhb-section" aria-labelledby="zhb-contact-h">
      <div className="zhb-wrap zhb-contact">
        <div>
          <div className="zhb-eyebrow">CONTACT</div>
          <h2 id="zhb-contact-h" className="zhb-h2">Talk to the arena</h2>
          <p className="zhb-p">Questions about the game, bulk and café orders, events or tournaments — send us a message.</p>
        </div>
        <form className="zhb-glass zhb-form" onSubmit={submit}>
          <div className="zhb-two">
            <label className="zhb-field"><span className="zhb-label">NAME *</span><input required autoComplete="name" value={f.name} onChange={set('name')} /></label>
            <label className="zhb-field"><span className="zhb-label">EMAIL *</span><input type="email" required autoComplete="email" value={f.email} onChange={set('email')} /></label>
          </div>
          <label className="zhb-field"><span className="zhb-label">SUBJECT</span><input value={f.subject} onChange={set('subject')} /></label>
          <label className="zhb-field"><span className="zhb-label">MESSAGE *</span><textarea required rows={4} value={f.message} onChange={set('message')} /></label>
          {msg && <div className={state === 'ok' ? 'zhb-ok' : 'zhb-error'} role="status">{msg}</div>}
          <button type="submit" className="zhb-btn zhb-btn-gold" disabled={state === 'busy'}>{state === 'busy' ? 'SENDING…' : 'SEND MESSAGE'}</button>
        </form>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* Mobile menu                                                         */
/* ------------------------------------------------------------------ */
const MENU = [
  ['The Cards', '#deck'],
  ['How to Play', '#howto'],
  ['Beat the Host', '/beat-the-host'],
  ['Tournaments', '/tournaments'],
  ['Beach Battle', '/beach-battle'],
  ['Gallery', '#chronicles'],
  ['Event Rankings', '#rankings'],
  ['Contact', '#contact'],
]
export function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  useLockScroll(open)
  useEscape(open, onClose)
  if (!open) return null
  return (
    <div className="zhb-menu" role="dialog" aria-modal="true" aria-label="Menu">
      <div className="zhb-menu-top">
        <span className="zhb-logo">ZAMBAARA</span>
        <button type="button" className="zhb-x" style={{ position: 'static' }} aria-label="Close menu" onClick={onClose}>✕</button>
      </div>
      <nav>
        {MENU.map(([l, h]) => (
          <a key={l} href={h} onClick={onClose}>{l}</a>
        ))}
      </nav>
      <a className="zhb-btn zhb-btn-gold zhb-wide" href="#next" onClick={onClose}>PRE-BOOK THE BATTLE PACK</a>
    </div>
  )
}
