import Modal from './Modal'

export const MODES = {
  wheel: { icon: '🎡', label: 'Wheel', desc: 'Spin the wheel once per winner. Each winner leaves the wheel.' },
  race: { icon: '🏁', label: 'Race', desc: 'Everyone races to the finish line. First across win.' },
  shuffle: { icon: '🔀', label: 'Instant shuffle', desc: 'Names flicker in slots and lock in one by one.' },
}
const SPEEDS = [
  { v: 1.6, label: 'Slow' },
  { v: 1, label: 'Normal' },
  { v: 0.5, label: 'Fast' },
]

export default function Settings({ value, onChange, onClose }) {
  const set = (patch) => onChange({ ...value, ...patch })
  const setPerRound = (n) => Number.isFinite(n) && set({ perRound: Math.max(1, Math.floor(n)) })

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
          <button key={s.v} className={value.speed === s.v ? 'active' : ''} onClick={() => set({ speed: s.v })}>{s.label}</button>
        ))}
      </div>

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
