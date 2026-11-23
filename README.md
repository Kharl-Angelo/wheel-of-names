# Wheely

```
npm install
npm run dev        # http://localhost:5173
node src/draw.test.js
```

- Paste participants (one per line, unlimited, duplicates allowed) on the left.
- Settings (⚙): draw mode (Wheel / Race / Instant shuffle), winners per round, speed, sound.
- Each round removes its winners from the pool; rounds continue until everyone is drawn.
- Everything is saved in the browser (localStorage). "Reset" puts all winners back.
- Ctrl+Enter starts the next round.
