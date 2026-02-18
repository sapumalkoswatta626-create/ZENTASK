(() => {
  // ======================================
  // ZENTASK Progress Tab — FINAL (Apple Glass)
  // Daily ring = solid + glow + shine
  // Weekly bars = glass pillars
  // + Weekly bubble tooltip (NO toast)
  // + Progress switch (Study time / Paper marks)
  // + Paper marks tracker (papers.js module)
  // ======================================

  // --------------------
  // Elements
  // --------------------
  const dailyTotalEl = document.getElementById("dailyTotal");
  const weeklyTotalEl = document.getElementById("weeklyTotal");
  const weeklyBars = document.getElementById("weeklyBars");
  const toast = document.getElementById("toast");

  // DAILY RING
  const pRingSegments = document.getElementById("pRingSegments");
  const btnDailyTotal = document.getElementById("btnDailyTotal");
  const dailyTotalBig = document.getElementById("dailyTotalBig");

  // DAILY BREAKDOWN SHEET
  const dailySheet = document.getElementById("prgdailySheet");
  const dailyBackdrop = document.getElementById("prgdailyBackdrop");
  const btnCloseDaily = document.getElementById("prgbtnCloseDaily");
  const dailyBreakdownList = document.getElementById("prgdailyBreakdownList");

  // STREAK
  const btnStreak = document.getElementById("prgbtnStreak");
  const streakCount = document.getElementById("prgstreakCount");

  // SWITCH + ROOMS
  const btnPrgTime = document.getElementById("btnPrgTime");
  const btnPrgMarks = document.getElementById("btnPrgMarks");
  const roomTime = document.getElementById("progressRoomTime");
  const roomMarks = document.getElementById("progressRoomMarks");
  // WEEK NAV
  let currentWeekOffset = 0;
  const weekRangeLabel = document.getElementById("weekRangeLabel");
  const btnPrevWeek = document.getElementById("btnPrevWeek");
  const btnNextWeek = document.getElementById("btnNextWeek");

  // --------------------
  // Toast (exposed globally for other modules)
  // --------------------
  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 1600);
  }
  window.showToast = showToast;

  // --------------------
  // ✅ Weekly bubble tooltip (NO toast)
  // --------------------
  function ensureWeeklyBubble(container) {
    if (!container) return null;

    let bubble = container.querySelector(".weeklyBubble");
    if (bubble) return bubble;

    bubble = document.createElement("div");
    bubble.className = "weeklyBubble";
    bubble.style.position = "absolute";
    bubble.style.zIndex = "40";
    bubble.style.pointerEvents = "none";
    bubble.style.padding = "10px 12px";
    bubble.style.borderRadius = "18px";
    bubble.style.fontWeight = "950";
    bubble.style.fontSize = "13px";
    bubble.style.backdropFilter = "blur(16px)";
    bubble.style.webkitBackdropFilter = "blur(16px)";
    bubble.style.border = "1px solid rgba(255,255,255,0.18)";
    bubble.style.boxShadow = "0 18px 50px rgba(0,0,0,0.35)";
    bubble.style.display = "none";
    bubble.style.whiteSpace = "nowrap";
    bubble.style.transform = "translate(-50%, -135%)";

    container.style.position = "relative";
    container.appendChild(bubble);
    return bubble;
  }

  function showWeeklyBubble(bubble, x, y, text) {
    if (!bubble) return;

    const theme = localStorage.getItem("zentask_theme") || "light";

    bubble.style.display = "block";
    bubble.style.left = `${x}px`;
    bubble.style.top = `${y}px`;

    bubble.style.background =
      theme === "dark" ? "rgba(15,17,23,0.58)" : "rgba(255,255,255,0.78)";

    bubble.style.color =
      theme === "dark" ? "rgba(255,255,255,0.92)" : "rgba(0,0,0,0.92)";

    bubble.innerHTML = `<span style="font-size:16px">${text}</span>`;
  }

  function hideWeeklyBubble(container) {
    container?.querySelectorAll(".weeklyDot").forEach(x => x.remove());
    const b = container?.querySelector(".weeklyBubble");
    if (b) b.style.display = "none";
  }

  // --------------------
  // Theme + Accent Sync
  // --------------------
  function applyThemeSync() {
    // ✅ In SPA mode (index.html), app.js handles theme/accent. DONT override.
    if (document.getElementById("progress-tab")) return;

    const theme = localStorage.getItem("zentask_theme") || "light";
    if (theme === "dark") document.documentElement.setAttribute("data-theme", "dark");
    else document.documentElement.removeAttribute("data-theme");

    const PALETTE = {
      purple: ["#7a5cff", "#b7a6ff"],
      blue: ["#2f6bff", "#8fb1ff"],
      green: ["#10b981", "#7ee0b1"],
      orange: ["#fb923c", "#ffd1a6"],
      pink: ["#ff4fb1", "#ffb3dc"],
      red: ["#ef4444", "#ff9aa7"]
    };

    try {
      const subjects = JSON.parse(localStorage.getItem("zentask_subjects") || "[]");
      const activeId = localStorage.getItem("zentask_active_subject") || "bio";
      const active = subjects.find(s => s.id === activeId);
      const colorId = (active && active.color) ? active.color : "purple";
      const pair = PALETTE[colorId] || PALETTE.purple;

      document.documentElement.style.setProperty("--accent-1", pair[0]);
      document.documentElement.style.setProperty("--accent-2", pair[1]);
    } catch (e) { }
  }

  // --------------------
  // Storage
  // --------------------
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

  function loadLogs() {
    try {
      const logs = JSON.parse(localStorage.getItem("zentask_logs") || "[]");
      return Array.isArray(logs) ? logs : [];
    } catch (e) {
      return [];
    }
  }

  // UTC keys like your timer logs
  // ✅ Local date keys (fix streak reset bug)
  function todayKey() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  function keyFromDate(dateObj) {
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, "0");
    const day = String(dateObj.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  // --------------------
  // Utils
  // --------------------
  function toHoursMin(totalMin) {
    totalMin = Math.max(0, Math.round(totalMin));
    const h = Math.floor(totalMin / 60);
    const m = totalMin % 60;
    if (h <= 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
  }

  function polarToCartesian(cx, cy, r, angleDeg) {
    const rad = (angleDeg - 90) * Math.PI / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }

  function describeArc(cx, cy, r, startAngle, endAngle) {
    const start = polarToCartesian(cx, cy, r, endAngle);
    const end = polarToCartesian(cx, cy, r, startAngle);
    const largeArc = (endAngle - startAngle) <= 180 ? "0" : "1";
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`;
  }

  // --------------------
  // Subject color map
  // --------------------
  function getSubjectColorMap() {
    const subjects = loadSubjects();

    const PAL = {
      purple: "#7a5cff",
      blue: "#2f6bff",
      green: "#10b981",
      orange: "#fb923c",
      pink: "#ff4fb1",
      red: "#ef4444"
    };

    const mapByName = {};
    const mapById = {};

    subjects.forEach(s => {
      const col = PAL[s.color] || PAL.purple;
      mapById[s.id] = col;
      mapByName[s.name] = col;
    });

    return { mapByName, mapById };
  }

  // --------------------
  // DAILY aggregation
  // --------------------
  function getDailyAgg(dateStr) {
    const logs = loadLogs().filter(l => l.date === dateStr);
    const bySubject = {};

    const subjects = loadSubjects();
    const mapIdToName = {};
    subjects.forEach(s => mapIdToName[s.id] = s.name);

    logs.forEach(l => {
      let name = l.subjectName;
      // if stored as "Study" or missing, try resolve via ID
      if ((!name || name === "Study") && l.subjectId && mapIdToName[l.subjectId]) {
        name = mapIdToName[l.subjectId];
      }
      name = name || "Study";

      if (!bySubject[name]) bySubject[name] = { minutes: 0, subjectId: l.subjectId || "unknown" };
      bySubject[name].minutes += Number(l.minutes || 0);
    });

    const total = Object.values(bySubject).reduce((sum, v) => sum + v.minutes, 0);
    return { total, bySubject };
  }

  // --------------------
  // DAILY ring rendering
  // --------------------
  function renderDailyRing(dateStr) {
    if (!pRingSegments) return;

    const { total, bySubject } = getDailyAgg(dateStr);
    const { mapByName, mapById } = getSubjectColorMap();

    if (dailyTotalEl) dailyTotalEl.textContent = `${total} min`;
    if (dailyTotalBig) dailyTotalBig.textContent = toHoursMin(total);

    const slices = Object.keys(bySubject)
      .map(name => ({
        name,
        minutes: bySubject[name].minutes,
        subjectId: bySubject[name].subjectId,
        color: mapByName[name] || mapById[bySubject[name].subjectId] || "#2f6bff"
      }))
      .sort((a, b) => b.minutes - a.minutes);

    pRingSegments.innerHTML = "";

    if (total <= 0) {
      if (dailyBreakdownList) dailyBreakdownList.innerHTML = `<div class="p-sub">No study sessions yet today 😤</div>`;
      return;
    }

    const cx = 120, cy = 120, r = 86;
    const gap = 16;
    let cursor = 0;

    slices.forEach(s => {
      const portion = (s.minutes / total) * 360;
      const start = cursor + gap / 2;
      const end = cursor + portion - gap / 2;
      cursor += portion;

      if (end - start < 14) return;

      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", describeArc(cx, cy, r, start, end));
      path.setAttribute("class", "pSeg");
      path.style.stroke = s.color;

      const shine = document.createElementNS("http://www.w3.org/2000/svg", "path");
      shine.setAttribute("d", describeArc(cx, cy, r, start, end));
      shine.setAttribute("class", "pSegShine");

      pRingSegments.appendChild(path);
      pRingSegments.appendChild(shine);
    });

    if (dailyBreakdownList) {
      dailyBreakdownList.innerHTML = "";
      slices.forEach(s => {
        const row = document.createElement("div");
        row.className = "sheetItem";

        const left = document.createElement("div");
        left.className = "sheetLeft";

        const dot = document.createElement("div");
        dot.className = "sheetColor";
        dot.style.background = s.color;

        const name = document.createElement("div");
        name.textContent = s.name;

        left.appendChild(dot);
        left.appendChild(name);

        const mins = document.createElement("div");
        mins.style.fontWeight = "950";
        mins.style.opacity = "0.7";
        mins.textContent = toHoursMin(s.minutes);

        row.appendChild(left);
        row.appendChild(mins);
        dailyBreakdownList.appendChild(row);
      });
    }
  }

  // Daily sheet open/close
  function openDailySheet() { dailySheet?.classList.add("show"); }
  function closeDailySheet() { dailySheet?.classList.remove("show"); }
  btnDailyTotal?.addEventListener("click", openDailySheet);
  dailyBackdrop?.addEventListener("click", closeDailySheet);
  btnCloseDaily?.addEventListener("click", closeDailySheet);

  // --------------------
  // WEEKLY aggregation (Calendar Weeks: Mon-Sun)
  // --------------------

  function getMonday(d) {
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    return new Date(d.setDate(diff));
  }

  function formatDateShort(dateObj) {
    return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  function getWeeklyAgg() {
    const logs = loadLogs();
    const { mapByName } = getSubjectColorMap();

    // 1. Determine Monday of the requested week
    const now = new Date();
    // Offset by weeks (7 days * currentWeekOffset)
    now.setDate(now.getDate() + (currentWeekOffset * 7));

    // Get Monday of that week
    const monday = getMonday(new Date(now));

    // Fix: load map for resolution
    const subjects = loadSubjects();
    const mapIdToName = {};
    subjects.forEach(s => mapIdToName[s.id] = s.name);

    // UI Label Update
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    if (weekRangeLabel) {
      if (currentWeekOffset === 0) weekRangeLabel.textContent = "This Week";
      else if (currentWeekOffset === -1) weekRangeLabel.textContent = "Last Week";
      else weekRangeLabel.textContent = `${formatDateShort(monday)} – ${formatDateShort(sunday)}`;
    }

    const days = [];

    // 2. Build Mon-Sun array
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const key = keyFromDate(d);

      const dayLogs = logs.filter(l => l.date === key);
      let total = 0;
      const subjectMinutes = {};

      dayLogs.forEach(l => {
        total += Number(l.minutes || 0);

        let name = l.subjectName;
        // resolve if generic
        if ((!name || name === "Study") && l.subjectId && mapIdToName[l.subjectId]) {
          name = mapIdToName[l.subjectId];
        }
        name = name || "Study";

        subjectMinutes[name] = (subjectMinutes[name] || 0) + Number(l.minutes || 0);
      });

      let topName = null;
      let topMin = 0;
      Object.keys(subjectMinutes).forEach(n => {
        if (subjectMinutes[n] > topMin) {
          topMin = subjectMinutes[n];
          topName = n;
        }
      });

      const color = topName ? (mapByName[topName] || "#7a5cff") : "rgba(255,255,255,0.08)";
      days.push({ key, total, topName, color });
    }

    return days;
  }

  // --------------------
  // ✅ WEEKLY render
  // --------------------
  function renderWeekly() {
    if (!weeklyBars) return;

    const days = getWeeklyAgg();
    const totals = days.map(d => d.total);
    const sum = totals.reduce((a, b) => a + b, 0);
    if (weeklyTotalEl) weeklyTotalEl.textContent = `${sum} min`;

    const max = Math.max(...totals, 60);

    weeklyBars.innerHTML = "";
    const bubble = ensureWeeklyBubble(weeklyBars);

    const labels = ["M", "T", "W", "T", "F", "S", "S"];

    const openWeeklyTip = (bar, d) => {
      weeklyBars.querySelectorAll(".weeklyDot").forEach(x => x.remove());

      const mins = d.total;
      if (mins <= 0) {
        hideWeeklyBubble(weeklyBars);
        return;
      }

      const barRect = bar.getBoundingClientRect();
      const wrapRect = weeklyBars.getBoundingClientRect();

      // Safety check if user switched tabs
      if (barRect.width === 0) return;

      const topX = (barRect.left - wrapRect.left) + barRect.width / 2;
      const topY = (barRect.top - wrapRect.top) + 2;

      const dot = document.createElement("div");
      dot.className = "weeklyDot";
      dot.style.position = "absolute";
      dot.style.width = "12px";
      dot.style.height = "12px";
      dot.style.borderRadius = "999px";
      dot.style.background = d.color;
      dot.style.boxShadow = "0 14px 28px rgba(0,0,0,0.25)";
      dot.style.border = "2px solid rgba(255,255,255,0.7)";
      dot.style.zIndex = "35";

      dot.style.left = `${topX - 6}px`;
      dot.style.top = `${topY - 6}px`;

      weeklyBars.appendChild(dot);
      showWeeklyBubble(bubble, topX, topY, toHoursMin(mins));
    };

    days.forEach((d, i) => {
      const col = document.createElement("div");
      col.className = "barCol";

      const bar = document.createElement("div");
      bar.className = "bar";
      bar.style.height = `${Math.max(12, (d.total / max) * 120)}px`;
      bar.style.opacity = d.total > 0 ? "1" : "0.35";

      if (d.total > 0) {
        bar.style.background = d.color;
        bar.style.boxShadow = `0 18px 40px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.16)`;
        bar.style.border = "1px solid rgba(255,255,255,0.10)";
        const shine = document.createElement("span");
        shine.className = "barShine";
        bar.appendChild(shine);
      } else {
        bar.style.background = "rgba(255,255,255,0.06)";
        bar.style.border = "1px solid rgba(255,255,255,0.06)";
        bar.style.boxShadow = "none";
      }

      // Interaction
      bar.addEventListener("click", (ev) => { ev.stopPropagation(); openWeeklyTip(bar, d); });

      const label = document.createElement("div");
      label.className = "barLabel";
      label.textContent = labels[i];

      col.appendChild(bar);
      col.appendChild(label);
      weeklyBars.appendChild(col);
    });
  }

  // Listeners
  if (btnPrevWeek) {
    btnPrevWeek.addEventListener("click", (e) => {
      e.stopPropagation();
      currentWeekOffset--;
      renderWeekly();
    });
  }
  if (btnNextWeek) {
    btnNextWeek.addEventListener("click", (e) => {
      e.stopPropagation();
      currentWeekOffset++;
      renderWeekly();
    });
  }

  // --------------------

  // Duolingo-style streak
  // --------------------
  function calcStreak() {
    const logs = loadLogs();
    const hasStudy = (dateStr) =>
      logs.some(l => l.date === dateStr && Number(l.minutes || 0) > 0);

    // ✅ If no study today yet, streak should start from yesterday (not become 0)
    const startOffset = hasStudy(todayKey()) ? 0 : 1;

    let streak = 0;

    for (let i = startOffset; i < 366; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = keyFromDate(d);

      if (hasStudy(key)) streak++;
      else break;
    }

    return streak;
  }

  // Inside Progress/progress.js

  function renderStreak() {
    const s = calcStreak();
    if (streakCount) streakCount.textContent = s;

    if (btnStreak) {
      btnStreak.onclick = () => {
        // NEW: Call the popup instead of toast
        window.showStreakPopup("day", s);
      };
    }
  }


  // ===============================
  // SWITCH (Study time <-> Paper marks)
  // ===============================
  function openRoom(which) {
    if (!btnPrgTime || !btnPrgMarks || !roomTime || !roomMarks) return;

    btnPrgTime.classList.toggle("active", which === "time");
    btnPrgMarks.classList.toggle("active", which === "marks");

    roomTime.classList.toggle("active", which === "time");
    roomMarks.classList.toggle("active", which === "marks");

    if (which === "time") window.refreshProgressCore?.();
    else window.refreshPapers?.();
  }

  btnPrgTime?.addEventListener("click", () => openRoom("time"));
  btnPrgMarks?.addEventListener("click", () => openRoom("marks"));

  // --------------------
  // AI ANALYSIS
  // --------------------
  function getAiStrategy(topSub, lowSub) {
    const strategies = [
      `Focus on consistency. Try to beat yesterday's time by 10 mins.`,
      `Great momentum! Now try to balance your subjects.`,
      `You're doing well in ${topSub || "studies"}. Don't forget ${lowSub || "others"}!`,
      `Consistency is key. A little bit every day adds up to big results.`,
      `Review your weak spots in ${lowSub || "challenging topics"}. Spend 15 mins focusing there.`,
      `Push a bit harder today. You have the potential to do more.`,
      `Excellent work! Maintain this pace to truly master your subjects.`,
      `If you feel tired, take a short break, but come back stronger.`,
      `Try the Pomodoro technique for ${lowSub || "difficult subjects"} to boost focus.`,
      `Review your notes for ${topSub || "your best subject"} to solidify your knowledge.`
    ];
    return strategies[Math.floor(Math.random() * strategies.length)];
  }

  function getYesterdayKey() {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return keyFromDate(d);
  }

  function renderAI() {
    const aiContent = document.getElementById("aiContent");
    if (!aiContent) return;

    // -------------------------------------
    // 1. Daily Comparison (Today vs Yesterday)
    // -------------------------------------
    const todayTotal = getDailyAgg(todayKey()).total;
    const yestTotal = getDailyAgg(getYesterdayKey()).total;

    let dayPct = 0;
    if (yestTotal > 0) dayPct = Math.round(((todayTotal - yestTotal) / yestTotal) * 100);
    else if (todayTotal > 0) dayPct = 100;

    const dayColor = dayPct >= 0 ? "#10b981" : "#ef4444";
    const dayArrow = dayPct >= 0 ? "▲" : "▼";
    const daySign = dayPct >= 0 ? "+" : "";

    // -------------------------------------
    // 2. Weekly Subject Breakdown
    // -------------------------------------
    const subjects = loadSubjects();
    const mapIdToName = {};
    subjects.forEach(s => mapIdToName[s.id] = s.name);

    // Get This Week's Data
    const savedOffset = currentWeekOffset;

    // Calculate stats for "This Week" (offset 0)
    currentWeekOffset = 0;

    // We need detailed log data for the current week, not just daily totals
    // So let's manually filter logs for this week range
    const logs = loadLogs();
    const d = new Date();
    // Calculate Monday of current week
    const currentDay = d.getDay();
    const diff = d.getDate() - currentDay + (currentDay === 0 ? -6 : 1); // adjust when day is sunday
    const monday = new Date(d.setDate(diff));
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    const thisWeekStats = {};
    let thisWeekTotal = 0;

    logs.forEach(l => {
      const logDate = new Date(l.date);
      if (logDate >= monday && logDate <= sunday) {
        let name = l.subjectName;
        if ((!name || name === "Study") && l.subjectId && mapIdToName[l.subjectId]) {
          name = mapIdToName[l.subjectId];
        }
        name = name || "Study";

        thisWeekStats[name] = (thisWeekStats[name] || 0) + Number(l.minutes || 0);
        thisWeekTotal += Number(l.minutes || 0);
      }
    });

    // Determine Top and Low subjects for strategy
    let topSub = "";
    let maxMin = -1;
    let lowSub = "";
    let minMin = Infinity;

    Object.entries(thisWeekStats).forEach(([name, mins]) => {
      if (mins > maxMin) { maxMin = mins; topSub = name; }
      if (mins < minMin) { minMin = mins; lowSub = name; }
    });

    if (Object.keys(thisWeekStats).length === 0) {
      topSub = "General"; lowSub = "General";
    }

    // 2. Previous Week Comparison (Total Time)
    // Calc Last Week (-1)
    currentWeekOffset = -1;
    const prevWeekDays = getWeeklyAgg();
    const prevWeekTotal = prevWeekDays.reduce((a, b) => a + b.total, 0);

    // Restore offset
    currentWeekOffset = savedOffset;

    let weekPct = 0;
    if (prevWeekTotal > 0) weekPct = Math.round(((thisWeekTotal - prevWeekTotal) / prevWeekTotal) * 100);
    else if (thisWeekTotal > 0) weekPct = 100;

    const pctColor = weekPct >= 0 ? "#10b981" : "#ef4444"; // Green or Red
    const arrow = weekPct >= 0 ? "▲" : "▼";
    const sign = weekPct >= 0 ? "+" : "";

    // 3. Build HTML
    // Strategy
    const strategy = getAiStrategy(topSub, lowSub);

    // Summary Rows
    let summaryHtml = "";
    if (Object.keys(thisWeekStats).length === 0) {
      summaryHtml = `<div class="aiText" style="opacity:0.7;">No study data for this week yet.</div>`;
    } else {
      // Sort by time desc
      const sorted = Object.entries(thisWeekStats).sort((a, b) => b[1] - a[1]);

      sorted.forEach(([name, mins]) => {
        summaryHtml += `
            <div style="display:flex; justify-content:space-between; align-items:center; font-size:13px; margin-bottom:6px;">
                <span style="opacity:0.8; font-weight:700;">${name}</span>
                <span style="font-weight:800; background:rgba(255,255,255,0.1); padding:2px 8px; border-radius:6px;">${toHoursMin(mins)}</span>
            </div>`;
      });
    }

    aiContent.innerHTML = `
      <div class="aiRow">
        <div class="aiMeta">
            <span class="aiLabel">Daily vs Yesterday</span>
            <span class="aiBadge" style="background:${dayColor}20; color:${dayColor}">${daySign}${dayPct}% ${dayArrow}</span>
        </div>
        <div class="aiText" style="margin-top:4px; font-size:13px; opacity:0.8;">
            You studied <b>${toHoursMin(todayTotal)}</b> today. (Yesterday: ${toHoursMin(yestTotal)})
        </div>
      </div>

      <div class="aiRow" style="margin-top:10px">
        <div class="aiMeta">
            <span class="aiLabel">Weekly Summary</span>
            <span class="aiBadge" style="background:${pctColor}20; color:${pctColor}">${sign}${weekPct}% ${arrow}</span>
        </div>
        <div style="margin-top:12px; padding-top:10px; border-top:1px solid rgba(0,0,0,0.06);">
            ${summaryHtml}
        </div>
        <div style="margin-top:10px; font-size:12px; opacity:0.6; text-align:right; border-top:1px solid rgba(0,0,0,0.06); padding-top:6px;">
            Total: <b>${toHoursMin(thisWeekTotal)}</b>
        </div>
      </div>

      <div class="aiRow" style="margin-top:10px; border-left: 3px solid var(--accent-1);">
        <div class="aiMeta">
          <span class="aiLabel">Smart Strategy</span>
          <span class="aiIcon" style="font-size:14px;">🧠</span>
        </div>
        <div class="aiText" style="margin-top:6px; font-style:italic; font-size:13px; opacity:0.85;">"${strategy}"</div>
      </div>
    `;
  }

  // --------------------
  // Init
  // --------------------
  function initCore() {
    applyThemeSync();
    renderDailyRing(todayKey());
    renderWeekly();
    renderStreak();
    renderAI(); // ✅ Added AI Render

    window.initPapersTracker?.();

    // Only manage nav state if NOT in index.html (SPA mode handles it via openTab)
    if (!document.getElementById("progress-tab")) {
      document.querySelectorAll(".navBtn").forEach(b => b.classList.remove("active"));
      document.querySelector('.navBtn[data-tab="progress"]')?.classList.add("active");
    }
  }

  initCore();

  window.refreshProgressCore = initCore;
  window.refreshProgress = function () {
    initCore();
    window.refreshPapers?.();
  };

  openRoom("time");
})();