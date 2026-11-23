import { useState } from 'react'

// Lets an animation loop pause until the user clicks "Next": `await gate.wait()`; the button calls `gate.next()`.
export default function useNextGate() {
  const [resolve, setResolve] = useState(null)
  return {
    waiting: resolve !== null,
    wait: () => new Promise((r) => setResolve(() => r)),
    next: () => {
      setResolve(null)
      resolve?.()
    },
    reset: () => setResolve(null),
  }
}
