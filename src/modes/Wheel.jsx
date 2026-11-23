import { useEffect, useRef, useState } from 'react'
import { TAU, sleep } from '../draw'
import { beep } from '../sound'

const POINTER = -Math.PI / 2 // pointer sits at 12 o'clock
const color = (i) => `hsl(${(i * 137.508) % 360} 72% 56%)`
const easeOut = (t) => 1 - Math.pow(1 - t, 4)
const clip = (s, n) => (s.length > n ? s.slice(0, n - 1) + '…' : s)

function drawWheel(canvas, list, rot) {
  if (!canvas) return
  const size = canvas.clientWidth
  const dpr = window.devicePixelRatio || 1
  if (canvas.width !== Math.round(size * dpr)) canvas.width = canvas.height = Math.round(size * dpr)
  const c = canvas.getContext('2d')
  c.setTransform(dpr, 0, 0, dpr, 0, 0)
  c.clearRect(0, 0, size, size)
  const cx = size / 2
  const r = cx - 6
  if (!list.length) {
    c.fillStyle = 'rgba(128,128,128,.15)'
    c.beginPath()
    c.arc(cx, cx, r, 0, TAU)
    c.fill()
    return
  }
  const a = TAU / list.length
  // shortcut: slices narrower than ~11px get no label; wheel stays fair, names are in the side list
  const labels = a * r > 11
  const font = Math.max(10, Math.min(20, a * r * 0.55))
  for (let i = 0; i < list.length; i++) {
    c.beginPath()
    c.moveTo(cx, cx)
    c.arc(cx, cx, r, rot + i * a, rot + (i + 1) * a)
    c.closePath()
    c.fillStyle = color(i)
    c.fill()
    if (list.length < 200) {
      c.strokeStyle = 'rgba(255,255,255,.35)'
      c.lineWidth = 1
      c.stroke()
    }
    if (labels) {
      c.save()
      c.translate(cx, cx)
      c.rotate(rot + (i + 0.5) * a)
      c.textAlign = 'right'
      c.textBaseline = 'middle'
      c.fillStyle = '#fff'
      c.shadowColor = 'rgba(0,0,0,.35)'
      c.shadowBlur = 3
      c.font = `600 ${font}px system-ui, sans-serif`
      c.fillText(clip(list[i], 20), r - 14, 0)
      c.restore()
    }
  }
  c.beginPath()
  c.arc(cx, cx, r, 0, TAU)
  c.lineWidth = 6
  c.strokeStyle = 'rgba(255,255,255,.9)'
  c.stroke()
}

const sliceAt = (rot, n) => Math.floor(((((POINTER - rot) % TAU) + TAU) % TAU) / (TAU / n))

export default function Wheel({ pool, winners, speed, sound, onDone }) {
  const canvas = useRef(null)
  const rot = useRef(0)
  const [latest, setLatest] = useState(null)
  const [picked, setPicked] = useState([])

  // idle redraw (and on resize)
  useEffect(() => {
    if (winners) return
    const draw = () => drawWheel(canvas.current, pool, rot.current)
    draw()
    window.addEventListener('resize', draw)
    return () => window.removeEventListener('resize', draw)
  }, [pool, winners])

  useEffect(() => {
    if (!winners) {
      setPicked([])
      setLatest(null)
      return
    }
    let alive = true
    const spin = (list, i, dur) =>
      new Promise((resolve) => {
        const a = TAU / list.length
        const target = POINTER - (i + 0.5) * a + (Math.random() - 0.5) * 0.7 * a
        const from = rot.current
        const to = from + ((((target - from) % TAU) + TAU) % TAU) + TAU * (4 + Math.floor(Math.random() * 3))
        const t0 = performance.now()
        let last = -1
        let lastTick = 0
        const frame = (now) => {
          if (!alive) return
          const t = Math.min(1, (now - t0) / dur)
          rot.current = from + (to - from) * easeOut(t)
          drawWheel(canvas.current, list, rot.current)
          const s = sliceAt(rot.current, list.length)
          if (sound && s !== last && now - lastTick > 45) {
            beep(900, 0.02, 0.03)
            lastTick = now
          }
          last = s
          if (t < 1) requestAnimationFrame(frame)
          else resolve()
        }
        requestAnimationFrame(frame)
      })

    ;(async () => {
      let list = [...pool]
      const dur = speed * Math.min(4500, Math.max(1200, 9000 / winners.length))
      const pause = speed * Math.min(900, Math.max(250, 3000 / winners.length))
      for (const w of winners) {
        const i = list.indexOf(w)
        await spin(list, i, dur)
        if (!alive) return
        setLatest(w)
        setPicked((p) => [...p, w])
        if (sound) beep(660, 0.15, 0.06)
        await sleep(pause)
        if (!alive) return
        list = list.filter((_, j) => j !== i)
        drawWheel(canvas.current, list, rot.current)
      }
      onDone()
    })()
    return () => {
      alive = false
    }
  }, [winners]) // eslint-disable-line react-hooks/exhaustive-deps

  const left = winners ? winners.length - picked.length : 0
  return (
    <div className="wheel-stage">
      <div className={`wheel-wrap ${winners ? 'spinning' : ''}`}>
        <div className="pointer" aria-hidden />
        <canvas ref={canvas} className="wheel" role="img" aria-label={`Wheel with ${pool.length} names`} />
        <div className="hub">{pool.length - picked.length}</div>
      </div>
      <div className="wheel-latest" aria-live="polite">
        {latest ? (
          <span key={picked.length} className="pop">🎉 {latest}</span>
        ) : (
          <span className="muted">{pool.length ? 'Ready to spin' : 'Wheel is empty'}</span>
        )}
      </div>
      {winners && (
        <div className="picked">
          {picked.map((w, i) => (
            <span key={i} className="pill">{i + 1}. {w}</span>
          ))}
          {left > 0 && <span className="pill empty">+{left} to go</span>}
        </div>
      )}
    </div>
  )
}
