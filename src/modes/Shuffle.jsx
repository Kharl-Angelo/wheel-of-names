import { useEffect, useMemo, useState } from 'react'
import { beep } from '../sound'
import { sleep } from '../draw'
import useNextGate from '../useNextGate'

export default function Shuffle({ pool, winners, seconds, sound, onDone }) {
  const gate = useNextGate()
  const [slots, setSlots] = useState([])
  const preview = useMemo(() => [...pool].sort(() => Math.random() - 0.5).slice(0, 60), [pool])

  useEffect(() => {
    gate.reset()
    if (!winners) {
      setSlots([])
      return
    }
    let alive = true
    let locked = 0
    let paused = false
    const n = winners.length
    const rand = () => pool[Math.floor(Math.random() * pool.length)]
    const render = () => setSlots(winners.map((w, i) => (i < locked ? { name: w, locked: true } : { name: rand(), locked: false })))
    // flicker unlocked slots, except while waiting for Next so the screen holds still
    const id = setInterval(() => {
      if (paused) return
      render()
      if (sound) beep(300 + Math.random() * 200, 0.015, 0.015)
    }, 70)
    ;(async () => {
      for (let k = 0; k < n; k++) {
        await sleep(seconds * 1000)
        if (!alive) return
        locked = k + 1
        render()
        if (sound) beep(700, 0.08, 0.05)
        if (locked < n) {
          paused = true
          await gate.wait()
          paused = false
          if (!alive) return
        }
      }
      clearInterval(id)
      await sleep(800)
      if (alive) onDone()
    })()
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
      {gate.waiting && (
        <button className="primary next-btn" onClick={gate.next}>
          Next winner ({slots.filter((x) => x.locked).length + 1} of {slots.length})
        </button>
      )}
    </div>
  )
}
