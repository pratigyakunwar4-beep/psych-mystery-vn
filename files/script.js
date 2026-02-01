// script.js - Game logic for "After Hours" visual novel
// Beginner-friendly comments included.

// ---------- Game state ----------
const state = {
  trust: 0,   // higher => more likely to trust unknown sender
  fear: 0,    // higher => more likely to avoid / panic
  truth: 0,   // accumulates when player seeks the truth
  current: "start"
};

// ---------- Scene data structure ----------
// Each scene has:
// id, text, choices: [{text, effects: {trust,fear,truth}, next: string | array of conditional cases }]
// next can be a string id, or an array of { condition: {trust: {">=":N}}, next: "id" }
// Evaluator checks conditions in order.
const scenes = {
  start: {
    text: "You wake up on a cold linoleum floor. The bell has long since stopped tolling. The lights in the hallway flicker, one bulb humming like a distant pulse. Your phone vibrates: an unknown number. A message reads: \"I can help you get out. But you must answer.\"",
    choices: [
      { text: "Open the message and reply: 'Who is this?'", effects: { trust: 1, truth: 1 }, next: "msg_reply" },
      { text: "Ignore the phone. Get up and search for the exit.", effects: { fear: 1 }, next: "search_exit" },
      { text: "Yell for help, just in case someone is nearby.", effects: { fear: 1 }, next: "yell" }
    ]
  },

  msg_reply: {
    text: "You type back. The sender answers in fragmented lines: \"Not who. What. There's a way through the old auditorium. But you must decide — do you trust me or run?\"",
    choices: [
      { text: "Ask what the catch is.", effects: { truth: 1 }, next: "ask_catch" },
      { text: "Agree to meet at the auditorium.", effects: { trust: 2 }, next: "meet_auditorium" },
      { text: "Tell them to leave you alone.", effects: { fear: 1, trust: -1 }, next: "ignore_sender" }
    ]
  },

  ask_catch: {
    text: "The sender replies: \"Truth is heavy. It might hurt. If you want out cleanly, follow blindly. If you want the truth, come to the AV closet — it's small, quiet.\"",
    choices: [
      { text: "Go to the AV closet to learn the truth.", effects: { truth: 2 }, next: "av_closet" },
      { text: "Follow the instruction to the auditorium — faster exit.", effects: { trust: 1 }, next: "meet_auditorium" }
    ]
  },

  meet_auditorium: {
    text: "The auditorium doors creak as you enter. Rows of empty chairs like ribs. Onstage, the phone screen shows a location pin. A recording starts: \"If you want to leave, lower your fear and do as I say. Trust the path.\"",
    choices: [
      // Branching based on trust & fear thresholds
      {
        text: "Follow the lit aisle downstage.",
        effects: { fear: -1 },
        next: [
          // If trust high, go towards escape ending path
          { condition: { trust: { ">=": 3 } }, next: "escape_path" },
          // If fear high, you hesitate and get trapped
          { condition: { fear: { ">=": 3 } }, next: "hesitate" },
          // Default
          { next: "stage_search" }
        ]
      },
      { text: "Search backstage instead.", effects: { truth: 1 }, next: "backstage" }
    ]
  },

  av_closet: {
    text: "The AV closet smells of old tape and dust. A figure in static on a tiny monitor speaks: \"You woke because someone needed you to. To leave, you must first know why you were left here.\"",
    choices: [
      { text: "Demand they explain. Reveal everything.", effects: { truth: 2, trust: 1 }, next: "reveal_truth" },
      { text: "Run from the explanation; run for an exit.", effects: { fear: 2 }, next: "search_exit" }
    ]
  },

  ignore_sender: {
    text: "You toss the phone away and try the doors. They're all locked. The building seems to have rearranged itself. Your panic grows.",
    choices: [
      { text: "Calm down and think logically.", effects: { truth: 1 }, next: "think" },
      { text: "Break a window to get out.", effects: { fear: 2 }, next: "broken_window" }
    ]
  },

  search_exit: {
    text: "Halls stretch like a maze. Doors lead to classrooms lecterns, lockers dull and closed. Your phone buzzes again: \"You can leave. But only after you choose the truth.\"",
    choices: [
      { text: "Keep searching, ignore the message.", effects: { fear: 1 }, next: "lost" },
      { text: "Answer: 'What truth?'", effects: { truth: 1, trust: 1 }, next: "msg_reply" }
    ]
  },

  yell: {
    text: "Your voice bounces back, swallowed by lockers. Nothing answers except a soft buzzing in your pocket — the sender again: \"Do you trust yourself? Because I know what you hid.\"",
    choices: [
      { text: "Cry out that you know nothing.", effects: { fear: 1 }, next: "deflect" },
      { text: "Tell the sender to meet you.", effects: { trust: 1 }, next: "msg_reply" }
    ]
  },

  stage_search: {
    text: "You find a trapdoor under a rug. It leads to a service corridor. The air tastes like metal and old stories. The phone says: \"Truth is down here. Decide: run or learn.\"",
    choices: [
      { text: "Descend into the corridor.", effects: { truth: 1 }, next: "corridor" },
      { text: "Ignore it and go back to the lobby.", effects: { fear: 1 }, next: "lost" }
    ]
  },

  backstage: {
    text: "Backstage is a tangle of props and shadows. A note pinned to a mannequin reads: \"You were left because you needed to remember.\"",
    choices: [
      { text: "Check the note more carefully (seek truth).", effects: { truth: 2 }, next: "reveal_truth" },
      { text: "Tear the note up — this is a trap.", effects: { fear: 2 }, next: "hesitate" }
    ]
  },

  corridor: {
    text: "In the corridor, graffiti reads names of people you once knew. The sender's voice is suddenly at your ear: \"Some things are put away for your safety. Some are put away because you asked.\"",
    choices: [
      { text: "Ask what was asked.", effects: { truth: 1 }, next: "reveal_truth" },
      { text: "Run toward the emergency exit sign.", effects: { fear: 2 }, next: "escape_attempt" }
    ]
  },

  reveal_truth: {
    text: "Fragments come together. You remember leaving something here years ago — a choice that hurt someone. The sender — someone you once trusted — says: \"You've been given a second chance to face what you avoided.\"",
    choices: [
      {
        text: "Admit your fault and ask for help to make it right.",
        effects: { truth: 2, trust: 1, fear: -1 },
        next: [
          { condition: { trust: { ">=": 2 }, truth: { ">=": 3 } }, next: "ending_secret" },
          { next: "ending_trapped" }
        ]
      },
      {
        text: "Refuse and try to escape immediately.",
        effects: { fear: 2, trust: -1 },
        next: "escape_attempt"
      }
    ]
  },

  hesitate: {
    text: "Hesitation costs time. Locks click. A distant siren wails. You realize the building is closing down for the night — and you are still inside.",
    choices: [
      { text: "Panic and search wildly.", effects: { fear: 2 }, next: "lost" },
      { text: "Compose yourself and look for keys.", effects: { truth: 1 }, next: "think" }
    ]
  },

  escape_attempt: {
    text: "You sprint to a service exit only to find it barred. A janitor's cart blocks the door. Your fear rises; the phone screen fades to black.",
    choices: [
      { text: "Force the door open.", effects: { fear: 2 }, next: "broken_window" },
      { text: "Go back and find the sender's plan.", effects: { trust: 1, truth: 1 }, next: "meet_auditorium" }
    ]
  },

  think: {
    text: "Thinking helps. You remember an emergency key hidden under a plant in the main office. Perhaps truth and planning together will help.",
    choices: [
      { text: "Find the key and leave quietly.", effects: { truth: 1, fear: -1 }, next: "ending_escape" },
      { text: "Call for help and explain everything.", effects: { truth: 1, trust: 1 }, next: "ending_secret" }
    ]
  },

  broken_window: {
    text: "Glass is loud and sharp. You cut your hand and climb through, bleeding, breathless. Outside dawn is thin and indifferent.",
    choices: [
      {
        text: "Run and never look back.",
        effects: { fear: 2, trust: -1 },
        next: [
          { condition: { fear: { ">=": 4 } }, next: "ending_trapped" },
          { next: "ending_escape" }
        ]
      },
      { text: "Stay and accept help if it comes.", effects: { truth: 1 }, next: "ending_secret" }
    ]
  },

  lost: {
    text: "The school seems to rearrange. Clock hands are wrong. You hear footsteps that are not yours. Doors that once opened are now solid.",
    choices: [
      { text: "Let the phone guide you.", effects: { trust: 1 }, next: "meet_auditorium" },
      { text: "Hide and wait until morning.", effects: { fear: 2 }, next: "ending_trapped" }
    ]
  },

  deflect: {
    text: "Your deflection doesn't stop the phone. It replies: \"You always knew something. That's the point. Face it, or be kept from it.\"",
    choices: [
      { text: "Face it.", effects: { truth: 1 }, next: "reveal_truth" },
      { text: "Keep deflecting and try to flee.", effects: { fear: 2 }, next: "escape_attempt" }
    ]
  },

  // Endings
  ending_escape: {
    text: "Dawn breaks. You find a way out — not without cost, but the world is wide again. Trust carried you further than fear. You escaped.",
    choices: [
      { text: "Restart", effects: {}, next: "RESTART" }
    ],
    ending: "escape"
  },

  ending_trapped: {
    text: "The doors stay closed. The phone finally goes silent. You spend another night in the empty school, waiting for a dawn that doesn't come. Fear kept you immobile.",
    choices: [
      { text: "Restart", effects: {}, next: "RESTART" }
    ],
    ending: "trapped"
  },

  ending_secret: {
    text: "You chose to face the truth: the memory, the apology, the repair. It didn't leave clean answers, but it opened a path. The sender's identity fades into someone who wanted you to remember. You walk out changed.",
    choices: [
      { text: "Restart", effects: {}, next: "RESTART" }
    ],
    ending: "secret"
  }
};

// ---------- DOM references ----------
const textEl = document.getElementById("text");
const choicesEl = document.getElementById("choices");
const statTrust = document.getElementById("statTrust");
const statFear = document.getElementById("statFear");
const statTruth = document.getElementById("statTruth");
const ambient = document.getElementById("ambient");
const clickSfx = document.getElementById("click");
const playMusicBtn = document.getElementById("playMusic");
const muteSfxBtn = document.getElementById("muteSfx");

// ---------- Audio controls ----------
let sfxEnabled = true;
muteSfxBtn.addEventListener("click", () => {
  sfxEnabled = !sfxEnabled;
  muteSfxBtn.textContent = sfxEnabled ? "Toggle Click SFX" : "SFX Off";
});
playMusicBtn.addEventListener("click", () => {
  if (ambient.paused) {
    ambient.play().catch(()=>{/* Autoplay blocked until user interacts */});
    playMusicBtn.textContent = "Pause Ambient";
  } else {
    ambient.pause();
    playMusicBtn.textContent = "Play Ambient";
  }
});

// ---------- Helper utilities ----------
function clamp(n, min=-99, max=99){ return Math.max(min, Math.min(max, n)); }

function playClick(){
  if (!sfxEnabled) return;
  if (clickSfx) {
    clickSfx.currentTime = 0;
    clickSfx.play().catch(()=>{});
  }
}

// Checks a single condition object like {trust: {">=": 2}, fear: {"<": 3}}
function checkCondition(cond){
  if (!cond) return true;
  for (const key of Object.keys(cond)) {
    const ops = cond[key];
    const val = state[key] ?? 0;
    for (const op of Object.keys(ops)) {
      const target = ops[op];
      if (op === ">=" && !(val >= target)) return false;
      if (op === "<=" && !(val <= target)) return false;
      if (op === ">" && !(val > target)) return false;
      if (op === "<" && !(val < target)) return false;
      if (op === "==" && !(val == target)) return false;
      if (op === "!=" && !(val != target)) return false;
    }
  }
  return true;
}

// Evaluate the 'next' field which may be a string or an array of conditional cases.
function evaluateNext(nextField){
  if (typeof nextField === "string") return nextField;
  if (Array.isArray(nextField)) {
    for (const caseItem of nextField) {
      if (!caseItem.condition || checkCondition(caseItem.condition)) {
        return caseItem.next;
      }
    }
  }
  return null;
}

// Apply numerical effects to the global state
function applyEffects(effects){
  if (!effects) return;
  for (const key of Object.keys(effects)) {
    if (state[key] === undefined) state[key] = 0;
    state[key] = clamp(state[key] + effects[key]);
  }
  updateStats();
}

// Update visible stat numbers (kept visible for debugging/UX)
function updateStats(){
  statTrust.textContent = state.trust;
  statFear.textContent = state.fear;
  statTruth.textContent = state.truth;
}

// ---------- Typewriter + display ----------
let typing = false;
function typeText(text, cb){
  typing = true;
  textEl.classList.remove("fade-in");
  textEl.innerHTML = "";
  const speed = 18; // milliseconds per char
  let i = 0;
  function step(){
    if (i <= text.length) {
      // Simple HTML-safe insertion (we allow basic punctuation)
      textEl.innerHTML = text.slice(0, i).replace(/\n/g, "<br>");
      i++;
      setTimeout(step, speed);
    } else {
      typing = false;
      textEl.classList.add("fade-in");
      if (cb) cb();
    }
  }
  step();
}

// Render choices for the current scene
function renderChoices(scene){
  choicesEl.innerHTML = "";
  if (!scene.choices) return;
  scene.choices.forEach((choice, idx) => {
    const btn = document.createElement("button");
    btn.className = "choice-btn";
    btn.textContent = choice.text;
    btn.addEventListener("click", () => {
      playClick();
      handleChoice(choice);
    });
    choicesEl.appendChild(btn);
  });
}

// Handle a player choice
function handleChoice(choice){
  // Apply effects
  applyEffects(choice.effects);

  // Determine next scene id
  const nextId = evaluateNext(choice.next);
  if (!nextId) {
    console.error("No next scene defined for choice:", choice);
    return;
  }

  // Restart special
  if (nextId === "RESTART") {
    setTimeout(startGame, 400);
    return;
  }

  // Small pause to let the player see choice click feedback
  setTimeout(()=>showScene(nextId), 120);
}

// Show a scene by id
function showScene(id){
  const scene = scenes[id];
  if (!scene) {
    console.error("Scene not found:", id);
    return;
  }
  state.current = id;

  // If scene has 'ending' key, show ending and reveal restart button
  if (scene.ending) {
    // Update stats for final reading
    updateStats();
    // Fade and show ending text
    typeText(scene.text, ()=>{});
    // Render the single Restart button with a slightly different style
    choicesEl.innerHTML = "";
    const container = document.createElement("div");
    container.className = "ending";
    const restartBtn = document.createElement("button");
    restartBtn.className = "restart-btn";
    restartBtn.textContent = "Restart";
    restartBtn.addEventListener("click", () => {
      playClick();
      startGame();
    });
    container.appendChild(restartBtn);
    choicesEl.appendChild(container);
    return;
  }

  // Normal scene: show text and choices
  typeText(scene.text, ()=>{});
  renderChoices(scene);
  // small visual stat update
  updateStats();
}

// Start or restart the game
function startGame(){
  // Reset state
  state.trust = 0;
  state.fear = 0;
  state.truth = 0;
  state.current = "start";
  updateStats();
  showScene("start");
  // Stop audio initially for clarity; user can play.
  if (!ambient.paused) ambient.pause();
  playMusicBtn.textContent = "Play Ambient";
}

// Initialize
document.addEventListener("DOMContentLoaded", ()=>{
  // Bind links in case user wants to change them later
  document.getElementById("sourceLink").href = "https://github.com/pratigyakunwar4-beep/psych-mystery-vn";
  document.getElementById("demoLink").href = "https://pratigyakunwar4-beep.github.io/psych-mystery-vn/";

  // Preload small click sound (optional)
  if (clickSfx) clickSfx.volume = 0.7;

  startGame();
});