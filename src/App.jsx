import { useEffect, useMemo, useState } from 'react'
import usePersistentState from './usePersistentState'
import { parseNames, pickWinners, remainingPool } from './draw'
import { fanfare } from './sound'
import Settings, { MODES } from './Settings'
import WinnerModal from './WinnerModal'
import Wheel from './modes/Wheel'
import Race from './modes/Race'
import Shuffle from './modes/Shuffle'

export const DEFAULT_SETTINGS = { mode: 'wheel', perRound: 5, speed: 1, sound: true }
const STAGES = { wheel: Wheel, race: Race, shuffle: Shuffle }

export default function App() {
  const [text, setText] = usePersistentState('won.names', '')
  const [rounds, setRounds] = usePersistentState('won.rounds', [])
  const [saved, setSettings] = usePersistentState('won.settings', DEFAULT_SETTINGS)
  const [winners, setWinners] = useState(null) // non-null while a round animates
  const [reveal, setReveal] = useState(null)
  const [showSettings, setShowSettings] = useState(false)

  const settings = { ...DEFAULT_SETTINGS, ...saved }
  const { names, dupes } = useMemo(() => parseNames(text), [text])
  const pool = useMemo(() => remainingPool(names, rounds), [names, rounds])
  const drawing = winners !== null
  const Stage = STAGES[settings.mode] || Wheel
  const nextCount = Math.min(settings.perRound, pool.length)

  function start() {
    if (drawing || !pool.length || dupes.length) return
    setReveal(null)
    setWinners(pickWinners(pool, settings.perRound))
  }

  function finish() {
    if (!winners) return
    const round = { n: rounds.length + 1, winners, mode: settings.mode, at: Date.now() }
    setRounds((r) => [...r, round])
    setWinners(null)
    setReveal(round)
    if (settings.sound) fanfare()
  }

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) start()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const editList = (fn) => setText(fn(names).join('\n'))
  const shuffleList = (l) => [...l].sort(() => Math.random() - 0.5)

  function resetDraws() {
    if (rounds.length && window.confirm('Clear all rounds and put every winner back in the pool?')) setRounds([])
  }

  return (
    <div className="app">
      <header className="topbar">
        <h1>
          <span className="logo" aria-hidden>◎</span> Wheel of Names
        </h1>
        <div className="topbar-actions">
          <button className="chip" onClick={() => setShowSettings(true)} disabled={drawing}>
            {MODES[settings.mode].icon} {MODES[settings.mode].label} · {settings.perRound} per round
          </button>
          <button className="icon-btn" onClick={() => setShowSettings(true)} disabled={drawing} aria-label="Settings">
            ⚙
          </button>
        </div>
      </header>

      <main className="layout">
        <section className="panel participants">
          <div className="panel-head">
            <h2>Participants</h2>
            <span className="badge">{names.length}</span>
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={drawing}
            placeholder={'One name per line…\nPaste as many as you like.'}
            spellCheck={false}
            aria-label="Participant names, one per line"
          />
          {dupes.length > 0 && (
            <div className="dupe-warning" role="alert">
              <span>
                ⚠ Names must be unique. {dupes.length} duplicate{dupes.length === 1 ? '' : 's'}:{' '}
                <b>{[...new Set(dupes)].slice(0, 5).join(', ')}{new Set(dupes).size > 5 ? '…' : ''}</b>
              </span>
              <button className="primary" onClick={() => editList((l) => l)} disabled={drawing}>Remove duplicates</button>
            </div>
          )}
          <div className="row">
            <button onClick={() => editList(shuffleList)} disabled={drawing || names.length < 2}>Shuffle</button>
            <button onClick={() => editList((l) => [...l].sort((a, b) => a.localeCompare(b)))} disabled={drawing || names.length < 2}>Sort</button>
            <button onClick={() => setText('')} disabled={drawing || !names.length}>Clear</button>
          </div>
          <div className="stats">
            <div><b>{names.length}</b><span>Total</span></div>
            <div><b>{names.length - pool.length}</b><span>Drawn</span></div>
            <div><b>{pool.length}</b><span>Remaining</span></div>
          </div>
        </section>

        <section className="panel stage">
          <Stage key={settings.mode} pool={pool} winners={winners} speed={settings.speed} sound={settings.sound} onDone={finish} />
          <div className="stage-actions">
            {drawing ? (
              <button className="secondary" onClick={finish}>Skip animation</button>
            ) : pool.length ? (
              <button className="primary big" onClick={start} disabled={dupes.length > 0}>
                Draw round {rounds.length + 1}
                <small>
                  {dupes.length ? 'Remove duplicate names first' : `${nextCount} winner${nextCount === 1 ? '' : 's'} · ${pool.length} remaining`}
                </small>
              </button>
            ) : (
              <p className="done">{names.length ? '🎉 All participants have been drawn!' : 'Add some names to get started.'}</p>
            )}
          </div>
        </section>

        <section className="panel results">
          <div className="panel-head">
            <h2>Results</h2>
            <button className="link" onClick={resetDraws} disabled={drawing || !rounds.length}>Reset</button>
          </div>
          {!rounds.length && <p className="muted">Winners of each round show up here.</p>}
          <ol className="rounds">
            {[...rounds].reverse().map((r) => (
              <li key={r.n} className="round-card">
                <div className="round-head">
                  <b>Round {r.n}</b>
                  <span className="muted">{MODES[r.mode]?.icon} {r.winners.length} winner{r.winners.length === 1 ? '' : 's'}</span>
                </div>
                <ol className="winner-list">
                  {r.winners.map((w, i) => <li key={i}>{w}</li>)}
                </ol>
              </li>
            ))}
          </ol>
        </section>
      </main>

      {showSettings && <Settings value={settings} onChange={setSettings} onClose={() => setShowSettings(false)} />}
      {reveal && <WinnerModal round={reveal} canContinue={pool.length > 0} onNext={start} onClose={() => setReveal(null)} />}
    </div>
  )
}
