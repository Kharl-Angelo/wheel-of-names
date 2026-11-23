export const TAU = Math.PI * 2

// Names must be unique: "Ana", " ana ", "ANA" are the same person. First spelling wins, the rest go to `dupes`.
export function parseNames(text, allowDupes = false) {
  const seen = new Set()
  const names = []
  const dupes = []
  for (const line of text.split('\n')) {
    const name = line.trim().replace(/\s+/g, ' ')
    if (!name) continue
    const key = name.toLowerCase()
    if (!allowDupes && seen.has(key)) dupes.push(name)
    else {
      seen.add(key)
      names.push(name)
    }
  }
  return { names, dupes }
}

// Unbiased-enough random int in [0, m) from the crypto RNG (modulo bias ~ m / 2^32).
const randInt = (m) => crypto.getRandomValues(new Uint32Array(1))[0] % m

// Partial Fisher–Yates: first n of a shuffled copy. n larger than pool draws everyone left.
export function pickWinners(pool, n) {
  const a = [...pool]
  const k = Math.min(Math.max(1, n), a.length)
  for (let i = 0; i < k; i++) {
    const j = i + randInt(a.length - i)
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a.slice(0, k)
}

// Names minus every past winner, one occurrence per win, so duplicate names each get their own chance.
export function remainingPool(names, rounds) {
  const won = new Map()
  for (const r of rounds) for (const w of r.winners) won.set(w, (won.get(w) || 0) + 1)
  return names.filter((n) => {
    const c = won.get(n)
    if (!c) return true
    won.set(n, c - 1)
    return false
  })
}

// Remove one occurrence of each name in `drop`.
export const subtract = (list, drop) => remainingPool(list, [{ winners: drop }])

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
