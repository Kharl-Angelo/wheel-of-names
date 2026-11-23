import { useEffect, useMemo, useState } from 'react'
import { beep } from '../sound'

export default function Shuffle({ pool, winners, speed, sound, onDone }) {
  const [slots, setSlots] = useState([])
  const preview = useMemo(() => [...pool].sort(() => Math.random() - 0.5).slice(0, 60), [pool])

  useEffect(() => {
    if (!winners) {
      setSlots([])
      return
    }
    let alive = true
    const n = winners.length
    const warm = 1200 * speed
    const gap = speed * Math.max(70, 2800 / n)
    const rand = () => pool[Math.floor(Math.random() * pool.length)]
    const t0 = performance.now()
    let lastLocked = 0
    const id = setInterval(() => {
      const t = performance.now() - t0
      const locked = t < warm ? 0 : Math.min(n, Math.floor((t - warm) / gap) + 1)
      setSlots(winners.map((w, i) => (i < locked ? { name: w, locked: true } : { name: rand(), locked: false })))
      if (sound) {
        if (locked > lastLocked) beep(700, 0.08, 0.05)
        else if (locked < n) beep(300 + Math.random() * 200, 0.015, 0.015)
      }
      lastLocked = locked
      if (locked === n) {
        clearInterval(id)
        setTimeout(() => alive && onDone(), 800)
      }
    }, 70)
    return () => {
      alive = false
      clearInterval(id)
    }
  }, [winners]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!winners)
    return (
      <div className="shuffle-stage idle">
        {pool.length ? (
          <div className="cloud">
            {preview.map((n, i) => (
              <span key={i} className="cloud-name" style={{ animationDelay: `${(i % 12) * 0.25}s` }}>{n}</span>
            ))}
            {pool.length > preview.length && <span className="cloud-name more">+{pool.length - preview.length} more</span>}
          </div>
        ) : (
          <p className="muted">Nobody left to shuffle.</p>
        )}
      </div>
    )

  return (
    <div className={`shuffle-stage slots ${slots.length > 10 ? 'many' : ''}`}>
      {slots.map((s, i) => (
        <div key={i} className={`slot ${s.locked ? 'locked' : ''}`}>
          <span className="place">{i + 1}</span>
          <span className="slot-name">{s.name}</span>
        </div>
      ))}
    </div>
  )
}
