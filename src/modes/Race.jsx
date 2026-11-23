import { useEffect, useRef, useState } from 'react'
import { sleep } from '../draw'
import { beep } from '../sound'

const RUNNERS = ['🐎', '🐆', '🐇', '🦄', '🐕', '🦊', '🐢', '🐈', '🦖', '🐿️', '🦘', '🐖']

export default function Race({ pool, winners, seconds, sound, onDone }) {
  const runners = useRef([])
  const [places, setPlaces] = useState({}) // lane index -> place
  const compact = pool.length > 25

  useEffect(() => {
    if (!winners) {
      setPlaces({})
      runners.current.forEach((el) => el?.style.setProperty('--p', 0))
      return
    }
    let alive = true
    // winners cross the line `seconds` apart; the last one at D
    const N = seconds * 1000
    const D = N * (winners.length + 1)
    // map winners to lane indexes (duplicate names take distinct lanes)
    const used = new Set()
    const winLanes = winners.map((w) => {
      const i = pool.findIndex((n, j) => n === w && !used.has(j))
      used.add(i)
      return i
    })
    // finish time per lane: winners cross in draw order at 2N, 3N, … D; everyone else after D
    const F = pool.map(() => D * (1.08 + Math.random() * 0.5))
    winLanes.forEach((lane, k) => (F[lane] = N * (k + 2)))
    // a ≤ 0.8 keeps speed (1 + a·cos(kπx)) positive; integer k makes the wobble 0 at start and finish
    const wob = pool.map(() => ({ a: (Math.random() < 0.5 ? -1 : 1) * (0.3 + Math.random() * 0.5), k: 2 + Math.floor(Math.random() * 5) }))
    let next = 0
    const t0 = performance.now()
    const frame = (now) => {
      if (!alive) return
      const t = now - t0
      for (let i = 0; i < pool.length; i++) {
        const x = t / F[i]
        // speeds up and slows down but never moves backward, and can't cross the line before F[i]
        const { a, k } = wob[i]
        const p = x >= 1 ? 1 : x + (a * Math.sin(k * Math.PI * x)) / (k * Math.PI)
        runners.current[i]?.style.setProperty('--p', p)
      }
      let crossed = false
      while (next < winLanes.length && t >= F[winLanes[next]]) {
        next++
        crossed = true
      }
      if (crossed) {
        const upto = next
        setPlaces(Object.fromEntries(winLanes.slice(0, upto).map((l, k) => [l, k + 1])))
        if (sound) beep(520 + Math.min(upto, 20) * 30, 0.12, 0.05)
      }
      if (t < D) requestAnimationFrame(frame)
      else sleep(700).then(() => alive && onDone())
    }
    requestAnimationFrame(frame)
    return () => {
      alive = false
    }
  }, [winners]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!pool.length) return <div className="empty-stage muted">No racers left.</div>
  const finishers = Object.entries(places).sort((a, b) => a[1] - b[1])

  return (
    <div className="race-stage">
      <div className="podium" aria-live="polite">
        {!winners ? (
          <span className="muted">{pool.length} racers at the starting line</span>
        ) : finishers.length ? (
          finishers.map(([lane, place]) => (
            <span key={lane} className="pill pop">{place}. {pool[lane]}</span>
          ))
        ) : (
          <span className="muted">And they’re off!</span>
        )}
      </div>
      <div className={`track ${compact ? 'compact' : ''}`}>
        {pool.map((name, i) => (
          <div key={i} className={`lane ${places[i] ? 'placed' : ''}`}>
            <span className="lane-name" title={name}>{name}</span>
            <div className="lane-track">
              <span className="runner" ref={(el) => (runners.current[i] = el)}>
                {places[i] && <b className="place-badge">{places[i]}</b>}
                <span className="runner-icon">{RUNNERS[i % RUNNERS.length]}</span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
