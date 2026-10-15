# 🏁 Word Race Championship

A multiplayer typing race game where you customize your race kart, compete against friends (or AI bots), and battle through a tournament bracket to claim the podium!

## 🎮 How to Play

1. **Create Your Racer** — Customize your kart (chassis, paint, spoiler, neon underglow, helmet) and pick a name
2. **Join or Create a Race** — Host creates a room with a 4-letter code; friends join using that code
3. **Race!** — Type words correctly and press Enter to move your kart forward. Build combos for speed boosts!
4. **Tournament** — Seeding run → 3 elimination rounds → Podium ceremony

## 🏆 Tournament Format

| Round | Players | Words | Difficulty | What Happens |
|-------|---------|-------|------------|-------------|
| Seeding | 4 | 12 | Easy | Sets grid order |
| Elimination 1 | 4 | 15 | Medium | 4th place eliminated |
| Elimination 2 | 3 | 18 | Hard | 3rd place → Bronze |
| THE FINAL | 2 | 20 | Expert | 1st → Gold, 2nd → Silver |

## 🔥 Combo System

| Streak | Effect | Speed |
|--------|--------|-------|
| ×1–×4 | Normal | 1× |
| ×5–×9 | NITRO! 🔥 | 1.5× |
| ×10–×14 | SUPER NITRO! 🔥🔥 | 2× |
| ×15+ | ULTRA NITRO! 🔥🔥🔥 | 3× |

**Mistype?** Your combo resets and your kart stumbles!

## 🌐 Multiplayer

Uses **WebRTC** (via PeerJS) for peer-to-peer connections. No server needed!

- **Host** creates a room → gets a 4-letter code
- **Players** enter the code to join from any device
- **AI Bots** fill empty slots (toggleable)
- Works on the same network or across the internet

## 🚀 Deploy to GitHub Pages

1. Create a new GitHub repository
2. Upload all files (`index.html`, `style.css`, `game.js`)
3. Go to **Settings → Pages**
4. Set source to **main branch**, root `/`
5. Share the URL with friends!

## 📁 Project Structure

```
word-race/
├── index.html    ← Main page
├── style.css     ← All styles
├── game.js       ← Complete game engine
└── README.md     ← This file
```

## 🎨 Features

- 🏎️ **Custom Karts** — 3 chassis styles, 8 paint colors, 4 spoilers, neon underglow, 4 helmet styles
- 🔤 **Typing Mechanics** — Real-time letter-by-letter feedback, Enter to submit
- 🤖 **AI Bots** — Adjustable difficulty, fill empty slots
- 🔊 **Sound Effects** — Synthesized audio (Web Audio API), no external files
- ✨ **Visual Effects** — Particles, flame trails, confetti, screen shake
- 📱 **Responsive** — Works on desktop, tablet, and mobile
- 🌐 **Multiplayer** — Peer-to-peer via WebRTC, no server required
- 🏆 **Tournament** — Full seeding + elimination bracket with podium ceremony

## 🛠️ Tech Stack

- Vanilla HTML/CSS/JavaScript (no frameworks!)
- Canvas API for race track and kart rendering
- Web Audio API for sound synthesis
- PeerJS for WebRTC multiplayer
- Google Fonts (Orbitron, Inter, JetBrains Mono)

## 📄 License

Free to use, modify, and share. Have fun racing! 🏁