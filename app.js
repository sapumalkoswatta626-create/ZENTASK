const $ = (id) => document.getElementById(id);
window.currentUserId = "local_guest";
let dbUnsubscribe = null;

// SVG
const ringFg = $("ringFg");
const waterRect = $("waterRect");
const waterBack = $("waterBack");
const waterFront = $("waterFront");

// hero
const greetText = $("greetText");
const modeTitle = $("modeTitle");

// timer text under ring
const btnOpenTime = $("btnOpenTime");
const timeText = $("timeText");
const metaText = $("metaText");
const sessionDots = $("sessionDots");

// controls
const btnToggle = $("btnToggle");
const toggleIcon = $("toggleIcon");

// theme button
const btnTheme = $("btnTheme");

// subject pill
const btnSubject = $("btnSubject");
const subjectDot = $("subjectDot");
const subjectName = $("subjectName");

// skip break button
const btnSkipBreak = $("btnSkipBreak");

// subject sheet
const subjectSheet = $("subjectSheet");
const subjectBackdrop = $("subjectBackdrop");
const btnCloseSubject = $("btnCloseSubject");
const subjectList = $("subjectList");
const btnAddSubject = $("btnAddSubject");

// color picker sheet
const colorSheet = $("colorSheet");
const colorBackdrop = $("colorBackdrop");
const btnCloseColor = $("btnCloseColor");
const palette = $("palette");
const colorTitle = $("colorTitle");

// pause confirmation
const pauseSheet = $("pauseSheet");
const pauseBackdrop = $("pauseBackdrop");
const btnKeepGoing = $("btnKeepGoing");
const btnPauseAnyway = $("btnPauseAnyway");

// reward overlay
const rewardOverlay = $("rewardOverlay");

// toast
const toast = $("toast");

// time modal
const timeModal = $("timeModal");
const btnCloseTime = $("btnCloseTime");
const btnSaveTime = $("btnSaveTime");
const btnResetDefault = $("btnResetDefault");
const inpFocus = $("inpFocus");
const inpShort = $("inpShort");
const inpLong = $("inpLong");
const inpAfter = $("inpAfter");

// circumference for progress ring
const CIRC = 2 * Math.PI * 92;

window.syncLogsToCloud = function () {
  if (window.db && window.firebaseSetDoc) {
    const docRef = window.firebaseDoc(window.db, "users", window.currentUserId);
    const currentLogs = JSON.parse(localStorage.getItem("zentask_logs") || "[]");
    const currentTimer = JSON.parse(localStorage.getItem("zentask_timer") || "null");

    window.firebaseSetDoc(docRef, {
      logs: currentLogs,
      timer: currentTimer
    }, { merge: true })
      .then(() => console.log("Session/Timer synced to Cloud! 🚀"));
  }
};

// ========= TEXT BANK =========
const MOTIVATION = [
  "Lock in 🔥",
  "Just 1 session. Easy.",
  "No distraction mode 😤",
  "You’re building your future.",
  "Do it for future you 🧠",
  "Small progress = huge results.",
  "Stay consistent. Stay deadly.",
  "25 minutes. No excuses.",
  "Focus = freedom.",
  "Study now, chill later 😮‍💨",
  "Be obsessed with progress.",
  "You got this. Go go go."
];

const BREAK_LINES = [
  "Enjoy your break ☁️",
  "Breathe. You earned this.",
  "Stretch your body a bit.",
  "Hydrate time 💧",
  "Don’t doomscroll 😭",
  "Relax your eyes 👀",
  "Small break, big comeback.",
  "You’re doing amazing.",
  "Reset your brain 🧠",
  "Break = fuel. Not lazy.",
  "This is your recharge moment ⚡"
];

const PAUSED_TEXTS = [
  "Paused — don’t quit now.",
  "Take a breath. Then continue.",
  "Still counts if you continue 😤",
  "You were doing great — resume it.",
  "No pressure. Just restart.",
  "Lock back in 🔥"
];

function pickMotivation() {
  return MOTIVATION[Math.floor(Math.random() * MOTIVATION.length)];
}
function pickBreak() {
  return BREAK_LINES[Math.floor(Math.random() * BREAK_LINES.length)];
}
function pickPaused() {
  return PAUSED_TEXTS[Math.floor(Math.random() * PAUSED_TEXTS.length)];
}

let currentMotivation = pickMotivation();
let currentBreakLine = pickBreak();
let pausedMessage = pickPaused();

// ========= TIMER SETTINGS =========
const DEFAULTS = { focusMin: 25, shortMin: 5, longMin: 15, longAfter: 4 };

const SETTINGS = {
  focus: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
  longAfter: 4
};

function loadTimerSettings() {
  try {
    const s = JSON.parse(localStorage.getItem("zentask_timer") || "null");
    if (!s) return { ...DEFAULTS };
    return {
      focusMin: Number(s.focusMin || DEFAULTS.focusMin),
      shortMin: Number(s.shortMin || DEFAULTS.shortMin),
      longMin: Number(s.longMin || DEFAULTS.longMin),
      longAfter: Number(s.longAfter || DEFAULTS.longAfter)
    };
  } catch (e) {
    return { ...DEFAULTS };
  }
}

let TIMER = loadTimerSettings();

function applyTimerSettings() {
  TIMER = loadTimerSettings();
  SETTINGS.focus = TIMER.focusMin * 60;
  SETTINGS.shortBreak = TIMER.shortMin * 60;
  SETTINGS.longBreak = TIMER.longMin * 60;
  SETTINGS.longAfter = TIMER.longAfter;
}

// ========= COLOR PALETTE =========
const PALETTE = [
  { id: "purple", name: "Purple", a1: "#7a5cff", a2: "#b7a6ff" },
  { id: "blue", name: "Blue", a1: "#2f6bff", a2: "#8fb1ff" },
  { id: "green", name: "Green", a1: "#10b981", a2: "#7ee0b1" },
  { id: "orange", name: "Orange", a1: "#fb923c", a2: "#ffd1a6" },
  { id: "pink", name: "Pink", a1: "#ff4fb1", a2: "#ffb3dc" },
  { id: "red", name: "Red", a1: "#ef4444", a2: "#ff9aa7" }
];

function getPaletteById(id) {
  return PALETTE.find(p => p.id === id) || PALETTE[0];
}

function setAccentByPalette(palId) {
  const pal = getPaletteById(palId);
  document.documentElement.style.setProperty("--accent-1", pal.a1);
  document.documentElement.style.setProperty("--accent-2", pal.a2);

  // Dynamic Auth Button Styling
  const btnSignIn = document.getElementById("btnSignIn");
  const btnSignUp = document.getElementById("btnSignUp");

  if (btnSignIn && pal) {
    // Primary Action: Solid gradient background, white text, no border
    btnSignIn.style.background = `linear-gradient(135deg, ${pal.a1}, ${pal.a2})`;
    btnSignIn.style.color = "#ffffff";
    btnSignIn.style.border = "none";
  }

  if (btnSignUp && pal) {
    // Secondary Action: Transparent background, colored text, subtle colored border
    btnSignUp.style.background = "transparent";
    btnSignUp.style.color = pal.a1;
    btnSignUp.style.borderColor = `${pal.a1}40`; // 40 is hex for 25% opacity
  }
}

// ========= SUBJECTS =========
const SUBJECT_DEFAULTS = [
  { id: "bio", name: "Biology", color: "green" },
  { id: "chem", name: "Chemistry", color: "red" },
  { id: "phy", name: "Physics", color: "purple" }
];

function loadSubjects() {
  try {
    const s = JSON.parse(localStorage.getItem("zentask_subjects") || "null");
    if (!s || !Array.isArray(s) || s.length === 0) return [...SUBJECT_DEFAULTS];
    return s;
  } catch (e) {
    return [...SUBJECT_DEFAULTS];
  }
}
function saveSubjects(arr) {
  localStorage.setItem("zentask_subjects", JSON.stringify(arr));

  if (window.db && window.firebaseSetDoc) {
    const docRef = window.firebaseDoc(window.db, "users", window.currentUserId);
    window.firebaseSetDoc(docRef, { subjects: arr }, { merge: true })
      .then(() => console.log("Subjects synced to Cloud! ☁️✅"))
      .catch((error) => console.log("Cloud sync error:", error));
  }
}
function loadActiveSubject() {
  return localStorage.getItem("zentask_active_subject") || "bio";
}
function saveActiveSubject(id) {
  localStorage.setItem("zentask_active_subject", id);
}
function getSubjectById(id) {
  const arr = loadSubjects();
  return arr.find(x => x.id === id) || arr[0];
}

function applySubject(id) {
  const sub = getSubjectById(id);
  saveActiveSubject(sub.id);

  setAccentByPalette(sub.color);

  subjectName.textContent = sub.name;
  subjectDot.style.background = `linear-gradient(135deg, var(--accent-1), var(--accent-2))`;

  renderSessionDots();
  renderSubjectsSheet();
  showToast(`${sub.name} selected ✨`);
}

// ========= THEME =========
function applyTheme(theme) {
  if (theme === "dark") document.documentElement.setAttribute("data-theme", "dark");
  else document.documentElement.removeAttribute("data-theme");

  localStorage.setItem("zentask_theme", theme);
  btnTheme.querySelector(".icon").textContent = theme === "dark" ? "☀️" : "🌙";
}
function toggleTheme() {
  const isDark = document.documentElement.getAttribute("data-theme") === "dark";
  applyTheme(isDark ? "light" : "dark");
}

// ========= UTIL =========
function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 1500);
}

function updateGreeting() {
  const h = new Date().getHours();
  let g = "Hello";
  if (h >= 5 && h < 12) g = "Good Morning";
  else if (h >= 12 && h < 16) g = "Good Afternoon";
  else if (h >= 16 && h < 20) g = "Good Evening";
  else g = "Good Night";
  greetText.textContent = g;
}

// ✅ Vibrate is Safe (usually doesn't crash app)
function vibrate(ms = 60) {
  try {
    if ("vibrate" in navigator) navigator.vibrate(ms);
  } catch (e) { }
}

function ding() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.type = "sine"; o.frequency.value = 740;
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.22, ctx.currentTime + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);
    o.start(); o.stop(ctx.currentTime + 0.36);
  } catch (e) { }
}

function showReward() {
  if (!rewardOverlay) return;
  rewardOverlay.classList.remove("show");
  void rewardOverlay.offsetHeight;
  rewardOverlay.classList.add("show");
  setTimeout(() => rewardOverlay.classList.remove("show"), 1600);
}

// ========= NOTIFICATIONS (NEW) =========
function tryRequestNotification() {
  try {
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission().then(p => console.log("Perm:", p)).catch(e => console.log("Perm error:", e));
    }
  } catch (e) {
    console.log("Notification API error", e);
  }
}

function sendNotification(title, body) {
  if ("Notification" in window && Notification.permission === "granted") {
    try {
      new Notification(title, { body: body, icon: "icon.png" });
    } catch (e) { console.log("Notify error", e); }
  }
}

// ========= STATE =========
let state = {
  mode: "focus",
  secondsLeft: SETTINGS.focus,
  total: SETTINGS.focus,
  running: false,
  cycle: 1,
  tick: null
};

let lastFrame = performance.now();
let visualSeconds = state.secondsLeft;
let focusElapsed = 0;

function isFocusMode() {
  return state.mode === "focus";
}

function isBreakMode() {
  return state.mode === "short" || state.mode === "long";
}

// ========= DOTS =========
function renderSessionDots() {
  const DOT_INTERVAL = 15 * 60; // 15 minutes in seconds
  const totalDots = 4;

  // Calculate total focus time elapsed in current "set" of 4 dots
  // We use current cycle - 1 to get completed sessions, plus current session elapsed
  // BUT: user wants it to loop every 4 dots.

  // Total engaged time in seconds for this "loop" 
  // We need to track cumulative time more persistently if we want it perfect across sessions
  // For now, let's approximation: 
  // (Sessions Completed * Focus Duration) + Current Session Elapsed

  const focusDuration = SETTINGS.focus;
  let totalSeconds = ((state.cycle - 1) * focusDuration);

  if (state.mode === 'focus') {
    totalSeconds += (focusDuration - state.secondsLeft);
  } else {
    // If in break, we count the full last focus session
    totalSeconds += 0;
  }

  // How many 15-min chunks have we fully completed?
  let dotsLit = Math.floor(totalSeconds / DOT_INTERVAL);

  // Modulo 4 to loop it back to 0 after 4 dots (1 hour)
  // If dotsLit is 4, we want it to show 4, not 0. 
  // Logic: 0-15m -> 0 dots (or 1 blinking? User said "pata wenwa" (coloured) at 15m)
  // User says: "at 15 mins get 1 dot". 

  // Let's use simple modulo 4 but handle the "full" state gracefully before reset
  // If we want it to clear AFTER the 4th dot is done (i.e. start of 5th), 
  // then modulo is fine.

  const currentDisplay = dotsLit % (totalDots + 1); // 0, 1, 2, 3, 4

  // However, user said "loop back". 
  // usually 4 dots = 1 hour.
  // 0-14:59 = 0 dots
  // 15:00-29:59 = 1 dot
  // 30:00-44:59 = 2 dots
  // 45:00-59:59 = 3 dots
  // 60:00+ = 4 dots (until 75?)

  // Let's simple modulo 4 logic:
  // We need to display 1 dot IF we passed 15m.

  let activeDots = Math.floor(totalSeconds / DOT_INTERVAL) % (totalDots + 1);
  if (activeDots > 4) activeDots = 0; // Should reset

  // Actually, standard behavior is usually:
  // Cycle 1..4 maps to dots 1..4.
  // The user wants time-based.

  // Recursive logic:
  // 15m = 1 dot.
  // 30m = 2 dots.
  // 45m = 3 dots.
  // 60m = 4 dots.
  // 75m -> 1 dot (reset and start over).

  let count = Math.floor(totalSeconds / DOT_INTERVAL);
  // If count is 4, we show 4. If count is 5, we show 1.
  // Sequence: 0, 1, 2, 3, 4, 1, 2, 3, 4... ?
  // Or 0,1,2,3,4, 0,1,2... ? 
  // User: "apahu dot 4 mula idan wenawa" -> start from beginning.

  // Let's do:
  // 0-15m: 0
  // 15-30m: 1
  // 30-45m: 2
  // 45-60m: 3
  // 60-75m: 4 (Full set completed)
  // 75-90m: 1 (Cycle restarts) -> This implies at 75 we have 1 "new" dot

  let visibleDots = 0;
  if (count > 0) {
    if (count % 4 === 0) visibleDots = 4; // Special case: multiples of 60m show full 4
    else visibleDots = count % 4;
  }
  // Wait, if totalSeconds is 0 -> 0 dots.

  sessionDots.innerHTML = "";
  for (let i = 1; i <= totalDots; i++) {
    const d = document.createElement("div");
    // Lite up if i <= visibleDots
    d.className = "dotItem" + (i <= visibleDots ? " on" : "");
    sessionDots.appendChild(d);
  }
}

// ========= VISUALS =========
// ========= BUBBLE SYSTEM =========
const bubbles = [];
let bubbleTimer = 0;

function createBubble() {
  const size = 2 + Math.random() * 4; // Random size 2px-6px
  const speed = 0.5 + Math.random() * 0.8;

  // Create SVG circle
  const el = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  el.setAttribute("r", size);
  el.setAttribute("fill", "rgba(255,255,255,0.3)"); // Semi-transparent white
  el.style.transition = "opacity 0.2s";

  // Insert behind the front wave so it looks like it's inside the water
  if (waterFront && waterFront.parentNode) {
    waterFront.parentNode.insertBefore(el, waterFront);
  }

  return {
    el,
    x: 40 + Math.random() * 160, // Random X pos within the circle
    y: 240, // Start at bottom
    speed,
    wobbleOffset: Math.random() * 10,
    size
  };
}

function manageBubbles(levelY, now) {
  // Check if we are in Full Screen
  const isFS = document.body.classList.contains("android-fullscreen");

  // 1. Spawn new bubbles occasionally
  bubbleTimer++;
  if (bubbleTimer > 15) {
    bubbleTimer = 0;
    if (Math.random() > 0.3) {
      bubbles.push(createBubble());
    }
  }

  // 2. Update existing bubbles
  for (let i = bubbles.length - 1; i >= 0; i--) {
    const b = bubbles[i];

    // FIX: Reduce speed to 40% if in Full Screen to prevent "rocketing"
    const moveSpeed = isFS ? (b.speed * 0.4) : b.speed;
    b.y -= moveSpeed;

    // Wiggle effect
    const wobble = Math.sin((now / 1000) * 2 + b.wobbleOffset) * 2;
    b.el.setAttribute("cx", b.x + wobble);
    b.el.setAttribute("cy", b.y);

    // 3. Pop if it hits the surface
    if (b.y <= levelY + b.size) {
      b.el.remove();
      bubbles.splice(i, 1);
    }
  }
}

function progress() {
  const s = Math.max(0, Math.min(state.total, visualSeconds));
  return 1 - (s / state.total);
}

// Premium Liquid Physics: Superposition of two waves
function wavePath(levelY, t, amp, freq, speed, phaseOffset) {
  const width = 240;
  const height = 240;
  const step = 4; // High resolution

  let d = "";

  for (let x = 0; x <= width; x += step) {
    // Normalized position (0 to 1)
    const n = x / width;

    // Wave 1: Main swell
    const w1 = Math.sin(n * Math.PI * 2 * freq + (t * speed) + phaseOffset);
    // Wave 2: Secondary ripples (texture)
    const w2 = Math.sin(n * Math.PI * 4 * freq + (t * speed * 1.5) + phaseOffset);

    // Combine
    const y = levelY + (w1 + 0.2 * w2) * amp;

    if (x === 0) d += `M ${x} ${y} `;
    else d += `L ${x} ${y} `;
  }

  d += `L ${width} ${height} L 0 ${height} Z`;
  return d;
}

function updateVisual(now) {
  const p = progress();
  const isFS = document.body.classList.contains("android-fullscreen");

  const topY = isFS ? -10 : 30;
  const bottomY = isFS ? 245 : 215;
  const levelY = bottomY - (bottomY - topY) * p;

  if (waterRect) waterRect.setAttribute("height", 0);

  const dynamicAmp = 5 + (5 * p);

  // Render Bubbles
  if (window.manageBubbles) manageBubbles(levelY, now);

  // FIX: Reduce wave speed to 50% in Full Screen for a calmer look
  const waveSpeedMod = isFS ? 0.5 : 1.0;

  // Render Waves with modifier
  if (waterBack) {
    waterBack.setAttribute("d", wavePath(levelY - 3, now, dynamicAmp * 0.9, 1.2, 0.0035 * waveSpeedMod, 3));
  }
  if (waterFront) {
    waterFront.setAttribute("d", wavePath(levelY, now, dynamicAmp, 1.6, 0.0055 * waveSpeedMod, 0));
  }

  // Ring Progress (Hide ring in FS)
  const off = CIRC * (1 - p);
  if (ringFg) {
    ringFg.style.opacity = isFS ? "0" : "1";
    ringFg.style.strokeDashoffset = `${off}`;
  }
}


// ========= UI TEXT =========
function updateTextUI() {
  timeText.textContent = formatTime(state.secondsLeft);

  if (state.mode === "focus") {
    metaText.textContent = `Session ${state.cycle} • ${TIMER.focusMin} min`;
  } else if (state.mode === "short") {
    metaText.textContent = `Short break • ${TIMER.shortMin} min`;
  } else {
    metaText.textContent = `Long break • ${TIMER.longMin} min`;
  }

  const isPause = toggleIcon.querySelector(".pauseSvg");
  const isPlay = toggleIcon.querySelector(".playSvg");

  if (state.running && !isPause) {
    toggleIcon.innerHTML = `<svg viewBox="0 0 24 24" class="toggleSvg pauseSvg" aria-hidden="true">
       <path d="M6 5h4v14H6zM14 5h4v14h-4z"/>
     </svg>`;
  } else if (!state.running && !isPlay) {
    toggleIcon.innerHTML = `<svg viewBox="0 0 24 24" class="toggleSvg playSvg" aria-hidden="true">
       <path d="M8 5v14l11-7z"/>
     </svg>`;
  }
  if (btnSkipBreak) {
    btnSkipBreak.style.display = isBreakMode() ? "inline-flex" : "none";
  }

  if (state.running && state.mode === "focus") {
    modeTitle.textContent = currentMotivation;
  } else if (state.running && state.mode !== "focus") {
    modeTitle.textContent = currentBreakLine;
  } else {
    if (state.mode === "focus" && state.secondsLeft < state.total && state.secondsLeft > 0) {
      modeTitle.textContent = pausedMessage;
    } else if (isBreakMode() && state.secondsLeft < state.total && state.secondsLeft > 0) {
      modeTitle.textContent = currentBreakLine;
    } else {
      modeTitle.textContent = "Ready to study";
    }
  }
}

// ========= TIMER LOGIC (BACKGROUND FIX) =========
function setMode(mode) {
  state.mode = mode;

  if (mode === "focus") {
    state.total = SETTINGS.focus;
    state.secondsLeft = SETTINGS.focus;
    currentMotivation = pickMotivation();
    focusElapsed = 0;
  } else if (mode === "short") {
    state.total = SETTINGS.shortBreak;
    state.secondsLeft = SETTINGS.shortBreak;
    currentBreakLine = pickBreak();
  } else {
    state.total = SETTINGS.longBreak;
    state.secondsLeft = SETTINGS.longBreak;
    currentBreakLine = pickBreak();
  }

  visualSeconds = state.secondsLeft;
  updateTextUI();
  renderSessionDots();
}

function nextMode() {
  if (state.mode === "focus") {
    showReward();

    try {
      if ("vibrate" in navigator) {
        navigator.vibrate([500, 200, 500, 200, 1000]);
      }
    } catch (e) { }

    try {
      const logs = JSON.parse(localStorage.getItem("zentask_logs") || "[]");
      const subjects = loadSubjects();
      const activeId = localStorage.getItem("zentask_active_subject") || "bio";
      const active = subjects.find(s => s.id === activeId) || { id: activeId, name: "Study" };
      const dateKey = new Date().toISOString().slice(0, 10);

      logs.push({
        ts: Date.now(),
        date: dateKey,
        subjectId: active.id,
        subjectName: active.name,
        minutes: TIMER.focusMin
      });

      localStorage.setItem("zentask_logs", JSON.stringify(logs));
      if (window.syncLogsToCloud) window.syncLogsToCloud();
    } catch (e) { }

    if (state.cycle % SETTINGS.longAfter === 0) setMode("long");
    else setMode("short");

  } else {
    // End of break
    state.cycle += 1;
    setMode("focus");
  }

  ding();
}

function start() {
  // 1. Ask Permission
  tryRequestNotification();

  if (state.running) return;

  // 2. Background Logic: Set Target Time
  let targetTime = localStorage.getItem("zentask_target_time");

  // If no stored time, calculate it based on current secondsLeft
  if (!targetTime) {
    targetTime = Date.now() + (state.secondsLeft * 1000);
    localStorage.setItem("zentask_target_time", targetTime);
    localStorage.setItem("zentask_saved_mode", state.mode);
  }

  if (state.secondsLeft <= 0) {
    state.secondsLeft = state.total;
    visualSeconds = state.secondsLeft;
    // Update target time if we just reset
    targetTime = Date.now() + (state.secondsLeft * 1000);
    localStorage.setItem("zentask_target_time", targetTime);
  }

  state.running = true;
  visualSeconds = state.secondsLeft;

  if (window.ZentaskNotifications) {
    window.ZentaskNotifications.send(
      "Focus Mode On 🚀",
      "Put your phone down. Let's go.",
      "timer_start"
    );
  }

  state.tick = setInterval(() => {
    // 3. Loop: Calculate based on Real Time
    const now = Date.now();
    const dest = Number(localStorage.getItem("zentask_target_time"));

    if (dest) {
      const diff = Math.ceil((dest - now) / 1000);
      state.secondsLeft = diff;
    } else {
      state.secondsLeft -= 1; // Fallback
    }

    if (state.mode === "focus" && state.secondsLeft >= 0) {
      focusElapsed += 1;
    }

    if (state.secondsLeft <= 0) {
      state.secondsLeft = 0;

      // Clear storage
      localStorage.removeItem("zentask_target_time");
      localStorage.removeItem("zentask_saved_mode");

      // Notify on End
      if (window.ZentaskNotifications) {
        window.ZentaskNotifications.send(
          "Session Complete! 🎉",
          "Great job. Take a break.",
          "timer_end"
        );
      }

      pause(true); // Stop interval
      nextMode();  // Switch to break/focus
      updateTextUI();
      return;
    }

    updateTextUI();
  }, 1000);

  updateTextUI();
}

function pause(silent = false) {
  state.running = false;

  // Clear the background target so it doesn't "catch up" when we resume
  localStorage.removeItem("zentask_target_time");

  if (state.mode === "focus" && state.secondsLeft > 0) {
    pausedMessage = pickPaused();
  }

  if (state.tick) {
    clearInterval(state.tick);
    state.tick = null;
  }

  updateTextUI();
  if (!silent) showToast("Paused 💤");
}

function openPauseSheet() { pauseSheet.classList.add("show"); }
function closePauseSheet() { pauseSheet.classList.remove("show"); }

function requestPause() {
  if (isFocusMode() && state.running && focusElapsed > 10) {
    openPauseSheet();
    return;
  }
  pause();
}

// RESET
function confirmReset() {
  if (state.secondsLeft === state.total && !state.running) return;

  // Use the universalDeleteSheet for WebView-safe confirmation
  const delSheet = $("universalDeleteSheet");
  const delTitle = $("deleteTitle");
  const btnDelConfirm = $("btnDeleteConfirm");
  const btnDelCancel = $("btnDeleteCancel");
  const delBackdrop = $("deleteBackdrop");

  if (delSheet && delTitle) {
    delTitle.textContent = "Reset this session?";
    delSheet.classList.add("show");

    const closeReset = () => delSheet.classList.remove("show");
    const doReset = () => {
      closeReset();
      pause(true);
      state.secondsLeft = state.total;
      visualSeconds = state.secondsLeft;
      focusElapsed = 0;
      updateTextUI();
      showToast("Session reset ✅");
      vibrate(40);
    };

    if (btnDelConfirm) btnDelConfirm.onclick = doReset;
    if (btnDelCancel) btnDelCancel.onclick = closeReset;
    if (delBackdrop) delBackdrop.onclick = closeReset;
  } else {
    // Fallback for when sheet elements aren't available
    pause(true);
    state.secondsLeft = state.total;
    visualSeconds = state.secondsLeft;
    focusElapsed = 0;
    updateTextUI();
    showToast("Session reset ✅");
    vibrate(40);
  }
}

// Skip Break
btnSkipBreak?.addEventListener("click", () => {
  if (!isBreakMode()) return;
  pause(true);
  setMode("focus");
  showToast("Break skipped ↩");
  vibrate(30);
});

// ========= SUBJECT SHEET =========
let colorEditSubjectId = null;

function openSubjectSheet() {
  subjectSheet.classList.add("show");
  renderSubjectsSheet();
}
function closeSubjectSheet() {
  subjectSheet.classList.remove("show");
}

function renderSubjectsSheet() {
  const arr = loadSubjects();
  const active = loadActiveSubject();
  subjectList.innerHTML = "";

  arr.forEach(s => {
    const item = document.createElement("div");
    item.className = "sheetItem";

    const left = document.createElement("div");
    left.className = "sheetLeft";

    const dot = document.createElement("div");
    dot.className = "sheetColor";
    const pal = getPaletteById(s.color);
    dot.style.background = `linear-gradient(135deg, ${pal.a1}, ${pal.a2})`;

    const name = document.createElement("div");
    name.textContent = s.name;

    left.appendChild(dot);
    left.appendChild(name);

    const actions = document.createElement("div");
    actions.className = "sheetActions";

    const paint = document.createElement("button");
    paint.className = "sheetPaint";
    paint.textContent = "🎨";
    paint.addEventListener("click", (e) => {
      e.stopPropagation();
      openColorSheet(s.id);
    });

    // Delete Button (only if > 1 subject)
    if (arr.length > 1) {
      const trash = document.createElement("button");
      trash.className = "sheetPaint"; // Reuse class for layout
      trash.style.color = "#ff4d4d";
      trash.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`;
      trash.addEventListener("click", (e) => {
        e.stopPropagation();
        confirmDeleteSubject(s.id);
      });
      actions.appendChild(trash);
    }

    const check = document.createElement("div");
    check.className = "sheetCheck";
    check.textContent = (s.id === active) ? "✓" : "";

    actions.appendChild(paint);
    actions.appendChild(check);

    item.appendChild(left);
    item.appendChild(actions);

    item.addEventListener("click", () => {
      applySubject(s.id);
      closeSubjectSheet();
    });

    subjectList.appendChild(item);
  });
}

// ========= DELETE SUBJECT LOGIC =========
let subjectToDelete = null;
const deleteSubModal = $("deleteSubModal");
const deleteSubBackdrop = $("deleteSubBackdrop");
const btnCancelDeleteSub = $("btnCancelDeleteSub");
const btnConfirmDeleteSub = $("btnConfirmDeleteSub");

function confirmDeleteSubject(id) {
  subjectToDelete = id;
  if (deleteSubModal) deleteSubModal.classList.add("show");
}

function closeDeleteSubModal() {
  if (deleteSubModal) deleteSubModal.classList.remove("show");
  subjectToDelete = null;
}

if (deleteSubBackdrop) deleteSubBackdrop.addEventListener("click", closeDeleteSubModal);
if (btnCancelDeleteSub) btnCancelDeleteSub.addEventListener("click", closeDeleteSubModal);

if (btnConfirmDeleteSub) {
  btnConfirmDeleteSub.addEventListener("click", () => {
    if (!subjectToDelete) return;

    let arr = loadSubjects();
    // Double check we have > 1
    if (arr.length <= 1) {
      showToast("Cannot delete the last subject ❌");
      closeDeleteSubModal();
      return;
    }

    // Filter out
    arr = arr.filter(s => s.id !== subjectToDelete);
    saveSubjects(arr);

    // If we deleted the active one, switch to first available
    const activeId = loadActiveSubject();
    if (activeId === subjectToDelete) {
      applySubject(arr[0].id); // Switch and save
    } else {
      // Just re-save active to be safe (no change needed really)
    }

    renderSubjectsSheet();
    closeDeleteSubModal();
    showToast("Subject deleted 🗑️");
  });
}

function addCustomSubject() {
  const sheet = $("universalInputSheet");
  const input = $("universalInput");
  const btnSave = $("btnInputSave");
  const btnClose = $("btnCloseInput");
  const backdrop = $("inputBackdrop");

  $("inputTitle").textContent = "New Subject";
  input.value = "";
  sheet.classList.add("show");
  input.focus();

  function handleSave() {
    const name = input.value.trim();
    if (!name) return;

    const id = "sub_" + Date.now();
    const arr = loadSubjects();
    arr.push({ id, name: name, color: "purple" });
    saveSubjects(arr);

    applySubject(id);
    sheet.classList.remove("show");
  }

  btnSave.onclick = handleSave;
  btnClose.onclick = () => sheet.classList.remove("show");
  backdrop.onclick = () => sheet.classList.remove("show");
}

function openColorSheet(subjectId) {
  colorEditSubjectId = subjectId;
  const sub = getSubjectById(subjectId);
  colorTitle.textContent = `Color for ${sub.name}`;
  colorSheet.classList.add("show");
  renderPalette();
}
function closeColorSheet() {
  colorSheet.classList.remove("show");
  colorEditSubjectId = null;
}

function renderPalette() {
  palette.innerHTML = "";
  PALETTE.forEach(p => {
    const btn = document.createElement("button");
    btn.className = "colorBtn";
    btn.style.background = `linear-gradient(135deg, ${p.a1}, ${p.a2})`;
    btn.title = p.name;

    btn.addEventListener("click", () => {
      if (!colorEditSubjectId) return;
      const arr = loadSubjects();
      const idx = arr.findIndex(x => x.id === colorEditSubjectId);
      if (idx === -1) return;

      arr[idx].color = p.id;
      saveSubjects(arr);

      if (loadActiveSubject() === colorEditSubjectId) {
        applySubject(colorEditSubjectId);
      } else {
        renderSubjectsSheet();
      }

      showToast(`${arr[idx].name} color updated 🎨`);
      closeColorSheet();
    });

    palette.appendChild(btn);
  });
}

// ========= TIMER MODAL =========
function openTimeModal() {
  const s = loadTimerSettings();
  inpFocus.value = s.focusMin;
  inpShort.value = s.shortMin;
  inpLong.value = s.longMin;
  inpAfter.value = s.longAfter;
  timeModal.classList.add("show");
}
function closeTimeModal() {
  timeModal.classList.remove("show");
}

// ========= LONG PRESS RESET =========
let holdTimer = null;
let holding = false;

function startHold() {
  holding = false;
  holdTimer = setTimeout(() => {
    holding = true;
    confirmReset();
  }, 900);
}

function endHold() {
  if (holdTimer) clearTimeout(holdTimer);
  holdTimer = null;
  setTimeout(() => holding = false, 0);
}

// ========= EVENTS =========
btnToggle.addEventListener("click", () => {
  if (holding) return;

  if (state.running) requestPause();
  else start();
});

btnToggle.addEventListener("touchstart", startHold, { passive: true });
btnToggle.addEventListener("touchend", endHold);
btnToggle.addEventListener("touchcancel", endHold);

btnToggle.addEventListener("mousedown", startHold);
btnToggle.addEventListener("mouseup", endHold);
btnToggle.addEventListener("mouseleave", endHold);

// tap timer number opens modal
btnOpenTime.addEventListener("click", openTimeModal);

btnTheme.addEventListener("click", toggleTheme);

// time modal events
btnCloseTime.addEventListener("click", closeTimeModal);
timeModal.addEventListener("click", (e) => { if (e.target === timeModal) closeTimeModal(); });

btnResetDefault.addEventListener("click", () => {
  localStorage.setItem("zentask_timer", JSON.stringify(DEFAULTS));
  applyTimerSettings();
  setMode(state.mode);
  closeTimeModal();
  showToast("Reset to default ✅");
});

btnSaveTime.addEventListener("click", () => {
  const focusMin = Math.max(1, Math.min(180, Number(inpFocus.value || 25)));
  const shortMin = Math.max(1, Math.min(60, Number(inpShort.value || 5)));
  const longMin = Math.max(1, Math.min(120, Number(inpLong.value || 15)));
  const longAfter = Math.max(2, Math.min(12, Number(inpAfter.value || 4)));

  localStorage.setItem("zentask_timer", JSON.stringify({ focusMin, shortMin, longMin, longAfter }));
  if (window.syncLogsToCloud) window.syncLogsToCloud();
  applyTimerSettings();
  setMode(state.mode);
  closeTimeModal();
  showToast("Timer updated ✨");
});

// subject sheet
btnSubject.addEventListener("click", openSubjectSheet);
subjectBackdrop.addEventListener("click", closeSubjectSheet);
btnCloseSubject.addEventListener("click", closeSubjectSheet);
btnAddSubject.addEventListener("click", addCustomSubject);

// color sheet
colorBackdrop.addEventListener("click", closeColorSheet);
btnCloseColor.addEventListener("click", closeColorSheet);

// pause confirm
pauseBackdrop.addEventListener("click", closePauseSheet);
btnKeepGoing.addEventListener("click", () => {
  closePauseSheet();
  showToast("Keep going 😤");
});
btnPauseAnyway.addEventListener("click", () => {
  closePauseSheet();
  pause();
});

// ========= SMOOTH LOOP =========
function loop(now) {
  const dt = Math.min(0.05, (now - lastFrame) / 1000);
  lastFrame = now;

  if (state.running) {
    visualSeconds -= dt;
    if (visualSeconds < state.secondsLeft) visualSeconds = state.secondsLeft;
    // Fix: Sync if visual drifts too far (e.g. implicitly paused tab)
    if (Math.abs(visualSeconds - state.secondsLeft) > 1.5) visualSeconds = state.secondsLeft;
  } else {
    visualSeconds = state.secondsLeft;
  }

  updateVisual(now);
  renderSessionDots(); // Update dots based on real-time progress
  requestAnimationFrame(loop);
}

// ========= INIT (UPDATED) =========
(function init() {
  ringFg.style.strokeDasharray = `${CIRC}`;
  ringFg.style.strokeDashoffset = `${CIRC}`;

  const theme = localStorage.getItem("zentask_theme") || "light";
  applyTheme(theme);

  applyTimerSettings();
  updateGreeting();
  setInterval(updateGreeting, 60 * 1000);
  // Sync visual timer immediately
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) return;

    updateGreeting();

    // Fix: Sync visual timer with real timer on return
    if (state.running) {
      const target = localStorage.getItem("zentask_target_time");
      if (target) {
        const diff = Math.ceil((Number(target) - Date.now()) / 1000);
        state.secondsLeft = diff;
        visualSeconds = diff; // Snap visual to actual
        updateTextUI();
        updateVisual(performance.now());
      }
    }
  });

  applySubject(loadActiveSubject());

  // --- NEW: CHECK BACKGROUND TIMER ---
  const savedTarget = localStorage.getItem("zentask_target_time");
  const savedMode = localStorage.getItem("zentask_saved_mode");

  if (savedTarget && savedMode) {
    const diff = Math.ceil((Number(savedTarget) - Date.now()) / 1000);

    if (diff > 0) {
      // It is still running
      setMode(savedMode);
      state.secondsLeft = diff;
      start(); // Resume immediately
    } else {
      // It finished while the app was closed
      setMode(savedMode);
      state.secondsLeft = 0;
      localStorage.removeItem("zentask_target_time");
      localStorage.removeItem("zentask_saved_mode");

      // Finish the session
      nextMode();
      showToast("Timer finished while you were away!");
    }
  } else {
    // Standard Start
    setMode("focus");
  }

  renderSessionDots();

  requestAnimationFrame(loop);
})();

document.querySelectorAll(".navBtn").forEach(b => b.classList.remove("active"));
document.querySelector('.navBtn[data-tab="home"]')?.classList.add("active");

// ===============================
// GLOBAL POPUP FUNCTION (Streak Reward)
// =========================================
window.openCenterPop = function ({ icon = "🔥", big = "0", small = "STREAK", quote = "Nice one ✨" } = {}) {

  const back = $("centerPopBackdrop");
  const pop = $("centerPop");

  if (!back || !pop) {
    console.log("Popup HTML missing!");
    return;
  }

  const elIcon = $("centerPopIcon");
  const elBig = $("centerPopBig");
  const elSmall = $("centerPopSmall");
  const elQuote = $("centerPopQuote");
  const btn = $("centerPopBtn");

  if (elIcon) elIcon.textContent = icon;
  if (elBig) elBig.textContent = big;
  if (elSmall) elSmall.textContent = small;
  if (elQuote) elQuote.textContent = quote;

  back.classList.add("show");
  pop.classList.add("show");

  const close = () => {
    pop.classList.remove("show");
    back.classList.remove("show");
  };

  if (btn) btn.onclick = close;
  back.onclick = close;
};

// ===============================
// BACKUP SYSTEM
// ===============================
const btnSettings = $("btnSettings");
const settingsSheet = $("settingsSheet");
const settingsBackdrop = $("settingsBackdrop");

const btnExportBackup = $("btnExportBackup");
const btnImportBackup = $("btnImportBackup");
const backupFileInput = $("backupFileInput");
const btnResetAll = $("btnResetAll");

function openSettings() {
  settingsSheet?.classList.add("show");
}
function closeSettings() {
  settingsSheet?.classList.remove("show");
}

btnSettings?.addEventListener("click", openSettings);
settingsBackdrop?.addEventListener("click", closeSettings);

function buildBackup() {
  const data = {};
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (!k) continue;

    if (k.startsWith("zentask_")) {
      data[k] = localStorage.getItem(k);
    }
  }

  return {
    app: "ZENTASK",
    version: 1,
    exportedAt: new Date().toISOString(),
    data
  };
}

function downloadJson(filename, obj) {
  const blob = new Blob([JSON.stringify(obj, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();

  setTimeout(() => URL.revokeObjectURL(url), 500);
}

btnExportBackup?.addEventListener("click", () => {
  const backup = buildBackup();
  downloadJson(`zentask-backup-${new Date().toISOString().slice(0, 10)}.json`, backup);
  window.showToast?.("Backup exported ✅");
});

btnImportBackup?.addEventListener("click", () => {
  backupFileInput?.click();
});

backupFileInput?.addEventListener("change", async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;

  try {
    const txt = await file.text();
    const json = JSON.parse(txt);

    if (json?.app !== "ZENTASK" || !json?.data) {
      showToast("Invalid backup file ❌");
      return;
    }

    Object.keys(json.data).forEach(k => {
      localStorage.setItem(k, json.data[k]);
    });

    showToast("Backup imported! Reloading... ✅");
    setTimeout(() => location.reload(), 800);
  } catch (err) {
    showToast("Backup import failed ❌");
  }
});

// ===============================
// ✅ ADD OFFLINE TIME
// ===============================
const btnAddOffline = document.getElementById("btnAddOffline");
if (btnAddOffline) {
  btnAddOffline.addEventListener("click", () => {
    // We already have a universalInputSheet for "Custom Subject"
    // Let's reuse it or use a simple prompt for now to keep it lightweight
    // as per "quick fix" request.

    // Better: Reuse the Universal Sheet for better UI
    const sheet = document.getElementById("universalInputSheet");
    const input = document.getElementById("universalInput");
    const btnSave = document.getElementById("btnInputSave");
    const title = document.getElementById("inputTitle");
    const back = document.getElementById("inputBackdrop");
    const btnClose = document.getElementById("btnCloseInput");

    if (sheet && input && btnSave) {
      // 1. Setup UI
      title.textContent = "Offline Time (min)";
      input.value = "";
      input.type = "number";
      input.placeholder = "e.g. 60";

      sheet.classList.add("show");
      setTimeout(() => input.focus(), 100);

      // 2. Handle Save
      // We must careful not to stack event listeners. 
      // The cleanest way in vanilla JS without removing named functions is 
      // to clone the button or re-assign onclick.

      // Clone to strip old listeners
      const newBtn = btnSave.cloneNode(true);
      btnSave.parentNode.replaceChild(newBtn, btnSave);

      newBtn.onclick = () => {
        const val = parseInt(input.value);
        if (!val || val <= 0) {
          showToast("Invalid minutes ❌");
          return;
        }

        // Add to logs
        try {
          const logs = JSON.parse(localStorage.getItem("zentask_logs") || "[]");
          const activeId = localStorage.getItem("zentask_active_subject") || "bio";
          // We need subject name
          const subjects = JSON.parse(localStorage.getItem("zentask_subjects") || "[]");
          const active = subjects.find(s => s.id === activeId) || { id: activeId, name: "Study" };

          logs.push({
            ts: Date.now(),
            date: new Date().toISOString().slice(0, 10),
            subjectId: active.id,
            subjectName: active.name,
            minutes: val
          });

          localStorage.setItem("zentask_logs", JSON.stringify(logs));
          if (window.syncLogsToCloud) window.syncLogsToCloud();

          showToast(`Added ${val} min to ${active.name} ✅`);

          // Close everything
          sheet.classList.remove("show");
          if (settingsSheet) settingsSheet.classList.remove("show");
          input.type = "text"; // Reset type

          // Refresh charts if needed
          if (window.refreshProgress) window.refreshProgress();

        } catch (e) {
          console.error(e);
          showToast("Error saving data ❌");
        }
      };

      // 3. Handle Close
      const close = () => {
        sheet.classList.remove("show");
        input.type = "text";
      };

      // Re-bind close (safe to overwrite onclick)
      if (btnClose) btnClose.onclick = close;
      if (back) back.onclick = close;

    } else {
      // Fallback
      const m = prompt("Enter offline minutes:");
      if (m) {
        const val = parseInt(m);
        if (val > 0) {
          const logs = JSON.parse(localStorage.getItem("zentask_logs") || "[]");
          const activeId = localStorage.getItem("zentask_active_subject") || "bio";
          const subjects = JSON.parse(localStorage.getItem("zentask_subjects") || "[]");
          const active = subjects.find(s => s.id === activeId) || { id: activeId, name: "Study" };

          logs.push({
            ts: Date.now(),
            date: new Date().toISOString().slice(0, 10),
            subjectId: active.id,
            subjectName: active.name,
            minutes: val
          });
          localStorage.setItem("zentask_logs", JSON.stringify(logs));
          showToast(`Added ${val} min ✅`);
          if (window.refreshProgress) window.refreshProgress();
        }
      }
    }
  });
}

// ===============================
// NEW RESET LOGIC (Custom Sheet)
// ===============================
const resetSheet = $("resetSheet");
const resetBackdrop = $("resetBackdrop");
const btnResetCancel = $("btnResetCancel");
const btnResetConfirm = $("btnResetConfirm");

if (btnResetAll && resetSheet) {
  btnResetAll.addEventListener("click", () => {
    // Close settings first
    $("settingsSheet")?.classList.remove("show");
    // Show reset sheet
    resetSheet.classList.add("show");
  });

  const closeReset = () => resetSheet.classList.remove("show");

  if (resetBackdrop) resetBackdrop.addEventListener("click", closeReset);
  if (btnResetCancel) btnResetCancel.addEventListener("click", closeReset);

  if (btnResetConfirm) {
    btnResetConfirm.addEventListener("click", () => {
      // 1. Delete "Zentask" keys
      const keys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith("zentask_")) keys.push(k);
      }
      keys.forEach(k => localStorage.removeItem(k));

      // 2. Refresh
      closeReset();
      location.reload();
    });
  }
}
// ✅ Force emoji.ttf to apply everywhere (Android WebView fix)
(function forceEmojiFontRendering() {
  function refreshTextNodes() {
    document.querySelectorAll("*").forEach(el => {
      if (el.childNodes && el.childNodes.length > 0) {
        el.childNodes.forEach(n => {
          if (n.nodeType === 3 && n.nodeValue && n.nodeValue.trim() !== "") {
            n.nodeValue = n.nodeValue;
          }
        });
      }
    });
  }

  window.addEventListener("load", () => {
    refreshTextNodes();
    setTimeout(refreshTextNodes, 500); // Retry once
  });
})();

// =========================================
// FULL SCREEN LOGIC (Global Scope)
// =========================================
// We wrap this in a timeout to ensure HTML elements are ready
setTimeout(() => {
  const btnFullScreen = $("btnFullScreen");
  const btnExitFS = $("btnExitFS");
  const fsSubject = $("fsSubject");
  const waterGroup = $("waterGroup");
  const ringSvg = document.querySelector(".ring");

  function toggleFullScreen() {
    // Toggle class
    document.body.classList.toggle("android-fullscreen");
    const isFSClass = document.body.classList.contains("android-fullscreen");

    const fsText = $("fsText");

    if (isFSClass) {
      // 1. Unmask water (let it expand)
      if (waterGroup) waterGroup.removeAttribute("clip-path");

      // 2. Fix Distorted Bubbles / SVG scaling
      if (ringSvg) ringSvg.setAttribute("preserveAspectRatio", "xMidYMid slice");

      // 3. Update Text & Apply Theme Color
      if (fsSubject && fsText) {
        const activeId = localStorage.getItem("zentask_active_subject") || "bio";
        const sub = getSubjectById(activeId);
        const pal = getPaletteById(sub.color);

        // Set Name
        fsText.textContent = sub.name;

        // Apply Gradient to Text
        fsText.style.background = `linear-gradient(135deg, ${pal.a1}, ${pal.a2})`;
        fsText.style.webkitBackgroundClip = "text";
        fsText.style.webkitTextFillColor = "transparent";
      }

    } else {
      // Restore Circular Mask
      if (waterGroup) waterGroup.setAttribute("clip-path", "url(#clipCircle)");

      // Restore SVG Ratio
      if (ringSvg) ringSvg.removeAttribute("preserveAspectRatio");
    }

    // Force visual update
    if (window.updateVisual) window.updateVisual(performance.now());
  }

  // Use addEventListener instead of onclick to prevent overwriting
  // Add touchstart for better responsiveness on Android
  if (btnFullScreen) {
    btnFullScreen.addEventListener("click", toggleFullScreen);
    btnFullScreen.addEventListener("touchstart", (e) => { e.preventDefault(); toggleFullScreen(); }, { passive: false });
  }
  if (btnExitFS) {
    btnExitFS.addEventListener("click", toggleFullScreen);
    btnExitFS.addEventListener("touchstart", (e) => { e.preventDefault(); toggleFullScreen(); }, { passive: false });
  }

  // Also fix Listeners for Add Subject & Settings which user reported as broken
  const btnSettings = $("btnSettings");
  if (btnSettings) {
    btnSettings.addEventListener("touchstart", (e) => { e.preventDefault(); openSettings(); }, { passive: false });
  }

  const btnAddSubject = $("btnAddSubject");
  if (btnAddSubject) {
    btnAddSubject.addEventListener("touchstart", (e) => { e.preventDefault(); addCustomSubject(); }, { passive: false });
  }
}, 300);

window.addEventListener('firebase-ready', () => {
  const loginForm = document.getElementById("loginForm");
  const authEmail = document.getElementById("authEmail");
  const authPass = document.getElementById("authPass");
  const btnSignIn = document.getElementById("btnSignIn");
  const btnSignUp = document.getElementById("btnSignUp");
  const btnLogout = document.getElementById("btnLogout");
  const profileName = document.getElementById("profileName");

  // Custom Auth Error Modal
  const authErrorModal = document.getElementById("authErrorModal");
  const authErrorMessage = document.getElementById("authErrorMessage");
  const btnDismissAuthError = document.getElementById("btnDismissAuthError");

  function showAuthError(msg) {
    if (authErrorMessage) authErrorMessage.textContent = msg;
    if (authErrorModal) authErrorModal.classList.remove("hidden");
  }

  if (btnDismissAuthError) {
    btnDismissAuthError.addEventListener("click", () => {
      if (authErrorModal) authErrorModal.classList.add("hidden");
    });
  }

  // Friendly Error Helper using existing UI styles
  function getFriendlyAuthError(error) {
    const code = error.code || "";
    switch (code) {
      case "auth/invalid-email": return "That email address looks invalid.";
      case "auth/invalid-credential": return "Incorrect email or password.";
      case "auth/wrong-password": return "Incorrect password. Please try again.";
      case "auth/user-not-found": return "No account found with this email.";
      case "auth/email-already-in-use": return "An account already exists with this email.";
      case "auth/weak-password": return "Password should be at least 6 characters.";
      case "auth/requires-recent-login": return "For security, please Log Out and Log In again to do this.";
      default: return error.message || "An unknown error occurred.";
    }
  }

  // Toggle Password
  const togglePass = document.getElementById("togglePass");
  if (togglePass && authPass) {
    togglePass.addEventListener("click", () => {
      const isPass = authPass.type === "password";
      authPass.type = isPass ? "text" : "password";
      togglePass.innerHTML = isPass
        ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="opacity:0.8"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M1 1M1 1l22 22"></path></svg>`
        : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
    });
  }

  // Forgot Password
  const forgotPassBtn = document.getElementById("forgotPassBtn");
  if (forgotPassBtn) {
    forgotPassBtn.addEventListener("click", () => {
      const email = authEmail.value.trim();
      if (!email) return showAuthError("Please enter your email address first.");

      forgotPassBtn.innerText = "Sending...";
      window.firebaseResetPassword(window.auth, email)
        .then(() => {
          showAuthError(`Reset link sent to ${email} ✅`);
          forgotPassBtn.innerText = "Forgot Password?";
        })
        .catch(err => {
          showAuthError(getFriendlyAuthError(err));
          forgotPassBtn.innerText = "Forgot Password?";
        });
    });
  }

  // Delete Account
  const btnDeleteAccount = document.getElementById("btnDeleteAccount");
  if (btnDeleteAccount) {
    btnDeleteAccount.addEventListener("click", () => {
      // Use custom sheet for WebView-safe confirmation
      const delAccSheet = document.getElementById("universalDeleteSheet");
      const delAccTitle = document.getElementById("deleteTitle");
      const btnDelAccConfirm = document.getElementById("btnDeleteConfirm");
      const btnDelAccCancel = document.getElementById("btnDeleteCancel");
      const delAccBackdrop = document.getElementById("deleteBackdrop");

      if (!delAccSheet) return;
      delAccTitle.textContent = "Delete your account? All data will be lost.";
      delAccSheet.classList.add("show");

      const closeDelAcc = () => delAccSheet.classList.remove("show");
      if (btnDelAccCancel) btnDelAccCancel.onclick = closeDelAcc;
      if (delAccBackdrop) delAccBackdrop.onclick = closeDelAcc;

      btnDelAccConfirm.onclick = () => {
        closeDelAcc();

        if (!window.auth.currentUser) return;

        btnDeleteAccount.innerText = "Deleting...";
        const uid = window.auth.currentUser.uid;

        window.firebaseDeleteUser(window.auth.currentUser)
          .then(() => {
            // Ideally also delete Firestore doc here if rules allow, or rely on backend triggers
            // Attempt to delete user doc
            if (window.db && window.firebaseDoc && window.deleteDoc) {
              // We don't have deleteDoc imported in index.html, skipping for safety or assume manual cleanup
            }
            showToast("Account deleted ✅");
            setTimeout(() => location.reload(), 800);
          })
          .catch(err => {
            btnDeleteAccount.innerText = "Delete Account";
            showAuthError(getFriendlyAuthError(err));
          });
      }; // end btnDelAccConfirm.onclick
    });
  }

  if (btnSignUp) {
    btnSignUp.addEventListener("click", () => {
      const email = authEmail.value.trim();
      const pass = authPass.value.trim();
      if (!email || pass.length < 6) return showAuthError("Please enter a valid email and a password (at least 6 characters).");

      btnSignUp.innerText = "⏳...";
      window.firebaseSignUp(window.auth, email, pass)
        .then(() => { btnSignUp.innerText = "Sign Up"; authEmail.value = ""; authPass.value = ""; })
        .catch(err => { showAuthError(getFriendlyAuthError(err)); btnSignUp.innerText = "Sign Up"; });
    });
  }

  if (btnSignIn) {
    btnSignIn.addEventListener("click", () => {
      const email = authEmail.value.trim();
      const pass = authPass.value.trim();
      if (!email || !pass) return showAuthError("Please enter both email and password.");

      btnSignIn.innerText = "⏳...";
      window.firebaseSignIn(window.auth, email, pass)
        .then(() => { btnSignIn.innerText = "Sign In"; authEmail.value = ""; authPass.value = ""; })
        .catch(err => { showAuthError(getFriendlyAuthError(err)); btnSignIn.innerText = "Sign In"; });
    });
  }

  if (btnLogout) {
    btnLogout.addEventListener("click", () => {
      window.firebaseSignOut(window.auth).catch(err => console.error(err));
    });
  }

  // Function to attach database listener based on user ID
  function attachDBListener(uid) {
    if (dbUnsubscribe) dbUnsubscribe(); // Stop listening to old account

    const docRef = window.firebaseDoc(window.db, "users", uid);
    dbUnsubscribe = window.firebaseOnSnapshot(docRef, (docSnap) => {
      if (!docSnap.exists()) {
        if (typeof saveSubjects === "function") saveSubjects(JSON.parse(localStorage.getItem("zentask_subjects") || "null"));
        if (window.syncLogsToCloud) window.syncLogsToCloud();
      } else {
        const cloudData = docSnap.data();
        if (cloudData.subjects) {
          localStorage.setItem("zentask_subjects", JSON.stringify(cloudData.subjects));
          if (typeof renderSubjectsSheet === "function") renderSubjectsSheet();
        }
        if (cloudData.logs) {
          localStorage.setItem("zentask_logs", JSON.stringify(cloudData.logs));
          if (typeof window.refreshProgress === "function") window.refreshProgress();
        }
        if (cloudData.timer) {
          localStorage.setItem("zentask_timer", JSON.stringify(cloudData.timer));
          if (typeof applyTimerSettings === "function") applyTimerSettings();
          if (typeof updateTextUI === "function") updateTextUI();
        }
      }
    });
  }

  // Auth State Listener
  window.firebaseOnAuth(window.auth, (user) => {
    if (user) {
      window.currentUserId = user.uid;
      if (loginForm) loginForm.style.display = "none";
      if (btnLogout) btnLogout.style.display = "flex";
      if (btnDeleteAccount) btnDeleteAccount.style.display = "flex";
      if (profileName) profileName.textContent = user.email.split('@')[0]; // Set name from email

      attachDBListener(window.currentUserId);
    } else {
      window.currentUserId = "local_guest";
      if (loginForm) loginForm.style.display = "flex";
      if (btnLogout) btnLogout.style.display = "none";
      if (btnDeleteAccount) btnDeleteAccount.style.display = "none";
      if (profileName) profileName.textContent = "Your Name";

      attachDBListener(window.currentUserId);
    }
  });
});
