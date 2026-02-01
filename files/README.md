# After Hours — Psychological Mystery (Visual Novel)

A short browser-based choice-driven visual novel made with HTML, CSS, and vanilla JavaScript.
Theme: Psychological Mystery — you wake up locked inside your school at night and an anonymous sender offers a way out. Your decisions shape how the story ends.

Live demo (after you publish to GitHub Pages):
- Demo URL (example): https://pratigyakunwar4-beep.github.io/psych-mystery-vn/

Source code (example repo):
- https://github.com/pratigyakunwar4-beep/psych-mystery-vn

---

## Design goals
- Single-file SPA (no frameworks).
- Dark, minimal UI with centered text and atmospheric colors.
- Smooth typewriter effect for dialogue and subtle animations.
- 2–3 choices per scene. Choices change internal variables and branch the story.
- Simple audio support: ambient music and click SFX (optional).
- Beginner-friendly, well-commented code meant for learning and quick editing.

---

## Files
- `index.html` — Layout and audio elements.
- `style.css` — Visual styling and simple animations.
- `script.js` — Game data, variables (trust, fear, truth), UI logic and branching.
- `README.md` — This file.

---

## Mechanics & Variables
The game tracks three internal variables:
- `trust` — How much you trust the anonymous sender.
- `fear` — How panicked or avoidant you are.
- `truth` — How much you seek or accept the underlying truth.

Each choice has `effects` that modify these variables (positive or negative integers). Branching can depend on both the current scene and these variable values. The game includes three main endings:

- Escape ending (high trust / planning): You get out physically — best reached by trusting reasonable directions or using logic.
- Trapped ending (high fear): Panic and avoidance lead to being trapped.
- Secret ending (facing truth): A balanced or truth-seeking path reveals deeper story and a more meaningful resolution.

---

## How to run locally
1. Clone or download this repository.
2. Optional: Add audio files to `assets/ambient.mp3` and `assets/click.mp3` (or change the paths in `index.html`).
3. Open `index.html` in a browser.

---

## How to publish (GitHub Pages)
1. Create a repository on GitHub (e.g., `psych-mystery-vn`) and push these files to the `main` branch.
2. In the repository settings → Pages, set the source to `main` branch and root folder.
3. After a minute, your demo should appear at: `https://<your-username>.github.io/psych-mystery-vn/`

Example links using your username:
- Source: https://github.com/pratigyakunwar4-beep/psych-mystery-vn
- Demo: https://pratigyakunwar4-beep.github.io/psych-mystery-vn/

---

## Notes & ideas for expansion
- Add portraits, background images, and more scenes for longer playtime.
- Persist state in localStorage for a multi-session experience.
- Add save/load slots, branching visuals, or simple inventory.
- Replace ambient audio with Creative Commons music and credit the creator.

---

Enjoy the game! If you want, I can:
- Create a ready-to-push GitHub repo structure (with license).
- Add example ambient audio links or embed Creative Commons tracks.
- Expand the story with more branches and scenes for multiple hours of play.