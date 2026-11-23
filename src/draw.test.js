import assert from 'node:assert/strict'
import { pickWinners, remainingPool, parseNames } from './draw.js'

const { names, dupes } = parseNames(' Ana\nBen\n\nCara\nDan\nEve\nFay\nGus\nHal\nIvy\nJo\nKim\nLeo\nana \nBEN\nMary  Ann\nmary ann\n')
assert.equal(names.length, 13)
assert.deepEqual(dupes, ['ana', 'BEN', 'mary ann'])
assert.ok(names.includes('Mary Ann'))
const twelve = names.slice(0, 12)

let rounds = []
const sizes = []
for (let pool = remainingPool(twelve, rounds); pool.length; pool = remainingPool(twelve, rounds)) {
  const w = pickWinners(pool, 5)
  assert.ok(w.every((x) => pool.includes(x)))
  sizes.push(w.length)
  rounds.push({ winners: w })
}
assert.deepEqual(sizes, [5, 5, 2])
// every name drawn exactly once
assert.deepEqual(rounds.flatMap((r) => r.winners).sort(), [...twelve].sort())
assert.equal(pickWinners(['a', 'b'], 50).length, 2)
assert.equal(pickWinners(['a', 'b', 'c'], 0).length, 1)
assert.deepEqual(pickWinners([], 5), [])
console.log('draw.test.js: ok')
