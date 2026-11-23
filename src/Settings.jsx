import { useState } from 'react'
import Modal from './Modal'

export const MODES = {
  wheel: { icon: '🎡', label: 'Wheel', desc: 'Spin the wheel once per winner. Each winner leaves the wheel.' },
  race: { icon: '🏁', label: 'Race', desc: 'Everyone races to the finish line. First across win.' },
  shuffle: { icon: '🔀', label: 'Instant shuffle', desc: 'Names flicker in slots and lock in one by one.' },
}
// seconds per winner
const SPEEDS = [
  { v: 4, label: 'Slow' },
  { v: 2.5, label: 'Normal' },
  { v: 1, label: 'Fast' },
]

export default function Settings({ value, onChange, onClose }) {
  const set = (patch) => onChange({ ...value, ...patch })
  const setPerRound = (n) => Number.isFinite(n) && set({ perRound: Math.max(1, Math.floor(n)) })
  // draft keeps half-typed input like "0." on screen; only valid values are saved, blur shows the saved one
  const [draft, setDraft] = useState(null)
  const setSeconds = (raw) => {
    setDraft(raw)
    const s = parseFloat(raw)
    if (s >= 0.2 && s <= 120) set({ seconds: s })
  }

  return (
    <Modal title="Settings" onClose={onClose}>
      <h2>Settings</h2>

      <h3>Draw mode</h3>
      <div className="mode-grid" role="radiogroup">
        {Object.entries(MODES).map(([k, m]) => (
          <button key={k} role="radio" aria-checked={value.mode === k} className={`mode-card ${value.mode === k ? 'active' : ''}`} onClick={() => set({ mode: k })}>
            <span className="mode-icon">{m.icon}</span>
            <b>{m.label}</b>
            <small>{m.desc}</small>
          </button>
        ))}
      </div>

      <h3>Winners per round</h3>
      <div className="stepper">
        <button onClick={() => setPerRound(value.perRound - 1)} disabled={value.perRound <= 1} aria-label="Fewer winners">−</button>
        <input type="number" min="1" step="1" value={value.perRound} onChange={(e) => setPerRound(parseInt(e.target.value, 10))} aria-label="Winners per round" />
        <button onClick={() => setPerRound(value.perRound + 1)} aria-label="More winners">+</button>
      </div>
      <p className="muted small">If fewer people remain, the last round draws everyone left.</p>

      <h3>Animation speed</h3>
      <div className="segmented">
        {SPEEDS.map((s) => (
          <button key={s.v} className={value.seconds === s.v ? 'active' : ''} onClick={() => set({ seconds: s.v })}>{s.label} · {s.v}s</button>
        ))}
      </div>
      <label className="custom-seconds">
        <span>Custom seconds per winner</span>
        <input type="number" min="0.2" max="120" step="0.1" value={draft ?? value.seconds} onChange={(e) => setSeconds(e.target.value)} onBlur={() => setDraft(null)} />
      </label>
      <p className="muted small">Wheel and shuffle pause after each winner until you click Next. Race finishers cross this many seconds apart.</p>

      <h3>Rules</h3>
      <label className="toggle">
        <input type="checkbox" checked={value.allowDuplicates} onChange={(e) => set({ allowDuplicates: e.target.checked })} />
        <span>Allow duplicate names</span>
      </label>
      <label className="toggle">
        <input type="checkbox" checked={value.removeWinners} onChange={(e) => set({ removeWinners: e.target.checked })} />
        <span>Remove winners from later rounds</span>
      </label>

      <label className="toggle">
        <input type="checkbox" checked={value.sound} onChange={(e) => set({ sound: e.target.checked })} />
        <span>Sound effects</span>
      </label>

      <div className="modal-actions">
        <button className="primary" onClick={onClose}>Done</button>
      </div>
    </Modal>
  )
}
