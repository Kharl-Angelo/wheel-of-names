import { useMemo } from 'react'
import Modal from './Modal'

const COLORS = ['#f43f5e', '#f59e0b', '#10b981', '#3b82f6', '#a855f7', '#ec4899', '#facc15']

export default function WinnerModal({ round, canContinue, onNext, onClose }) {
  const confetti = useMemo(
    () =>
      Array.from({ length: 90 }, (_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 0.8,
        dur: 2.2 + Math.random() * 1.8,
        color: COLORS[i % COLORS.length],
        rot: Math.random() * 360,
      })),
    [round],
  )
  return (
    <>
      <div className="confetti" aria-hidden>
        {confetti.map((c, i) => (
          <i key={i} style={{ left: `${c.left}%`, background: c.color, animationDelay: `${c.delay}s`, animationDuration: `${c.dur}s`, rotate: `${c.rot}deg` }} />
        ))}
      </div>
      <Modal title={`Round ${round.n} winners`} onClose={onClose} className="winner-modal">
        <p className="eyebrow">Round {round.n}</p>
        <h2>{round.winners.length === 1 ? 'The winner is' : 'The winners are'}</h2>
        <ol className={`reveal ${round.winners.length > 12 ? 'many' : ''}`}>
          {round.winners.map((w, i) => (
            <li key={i} style={{ animationDelay: `${Math.min(i * 0.12, 2)}s` }}>
              <span className="place">{i + 1}</span>
              {w}
            </li>
          ))}
        </ol>
        <div className="modal-actions">
          <button onClick={onClose}>Close</button>
          {canContinue && <button className="primary" onClick={onNext}>Next round →</button>}
        </div>
      </Modal>
    </>
  )
}
