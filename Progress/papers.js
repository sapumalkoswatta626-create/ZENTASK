// ======================================
// ZENTASK — Paper Marks Tracker (SAFE MODULE)
// Storage: zentask_papers
// Tracks marks per subjectId (selectable)
// Premium features:
// - chart index based (no fake zeros by date)
// - dot touch tooltip bubble
// - subject color based gradient
// - NO x-axis labels (clean UI)
// - prevents saving empty marks (fix fake 0 last)
// - FIXED subject switching bug ✅
// ======================================

(function () {
  const STORAGE_KEY = "zentask_papers";
  const SUBJECT_VIEW_KEY = "zentask_paper_subject_view";

  const PALETTE = {
    purple: ["#7a5cff", "#b7a6ff"],
    blue: ["#2f6bff", "#8fb1ff"],
    green: ["#10b981", "#7ee0b1"],
    orange: ["#fb923c", "#ffd1a6"],
    pink: ["#ff4fb1", "#ffb3dc"],
    red: ["#ef4444", "#ff9aa7"]
  };

  // ---------- utils ----------
  function getTheme() {
    return localStorage.getItem("zentask_theme") || "light";
  }

  function todayKey() {
    return new Date().toISOString().slice(0, 10);
  }

  function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
  }

  function loadSubjects() {
    try {
      const subjects = JSON.parse(localStorage.getItem("zentask_subjects") || "[]");
      if (Array.isArray(subjects) && subjects.length > 0) return subjects;
    } catch { }

    return [
      { id: "bio", name: "Biology", color: "green" },
      { id: "chem", name: "Chemistry", color: "red" },
      { id: "phy", name: "Physics", color: "purple" }
    ];
  }

  function loadPapers() {
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  }

  function savePapers(arr) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
  }

  function getAccentPairFromSubject(sub) {
    const colorId = sub?.color || "purple";
    return PALETTE[colorId] || PALETTE.purple;
  }

  function loadViewSubjectId() {
    return (
      localStorage.getItem(SUBJECT_VIEW_KEY) ||
      localStorage.getItem("zentask_active_subject") ||
      "bio"
    );
  }

  function saveViewSubjectId(id) {
    localStorage.setItem(SUBJECT_VIEW_KEY, id);
  }

  function getViewSubject() {
    const subjects = loadSubjects();
    const id = loadViewSubjectId();
    return (
      subjects.find(s => s.id === id) ||
      subjects[0] ||
      { id: "bio", name: "Study", color: "purple" }
    );
  }

  // ---------- Bubble ----------
  function ensureChartBubble(container) {
    if (!container) return null;

    let bubble = container.querySelector(".chartBubble");
    if (bubble) return bubble;

    bubble = document.createElement("div");
    bubble.className = "chartBubble";
    bubble.style.position = "absolute";
    bubble.style.zIndex = "25";
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
    bubble.style.transform = "translate(-50%, -120%)";
    bubble.style.whiteSpace = "nowrap";

    container.appendChild(bubble);
    return bubble;
  }

  function showBubble(bubble, x, y, html) {
    if (!bubble) return;

    const theme = getTheme();
    bubble.style.display = "block";
    bubble.style.left = `${x}px`;
    bubble.style.top = `${y}px`;

    bubble.style.background =
      theme === "dark"
        ? "rgba(15,17,23,0.62)"
        : "rgba(255,255,255,0.78)";

    bubble.style.color =
      theme === "dark"
        ? "rgba(255,255,255,0.95)"
        : "rgba(0,0,0,0.92)";

    bubble.innerHTML = html;
  }

  function hideBubble(bubble) {
    if (!bubble) return;
    bubble.style.display = "none";
  }

  // ---------- Chart ----------
  function drawChart(canvas, entries, subject, wrapEl) {
    if (!canvas || !wrapEl) return;

    const ctx = canvas.getContext("2d");
    const w = (canvas.width = canvas.clientWidth);
    const h = (canvas.height = canvas.clientHeight);

    ctx.clearRect(0, 0, w, h);

    const theme = getTheme();
    const [a1, a2] = getAccentPairFromSubject(subject);

    const bubble = ensureChartBubble(wrapEl);

    const bgGrid = theme === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
    const txt = theme === "dark" ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.55)";

    if (!entries.length) {
      ctx.fillStyle = txt;
      ctx.font = "800 14px system-ui";
      ctx.fillText("No papers yet — add your first marks 😤", 14, h / 2);
      hideBubble(bubble);
      return;
    }

    entries = [...entries].sort((a, b) => Number(a.ts || 0) - Number(b.ts || 0));

    const padL = 34, padR = 16, padT = 18, padB = 28;
    const chartW = w - padL - padR;
    const chartH = h - padT - padB;

    function yFor(v) { return padT + (1 - v / 100) * chartH; }
    function xFor(i) {
      return (entries.length === 1)
        ? padL + chartW / 2
        : padL + (i / (entries.length - 1)) * chartW;
    }

    // grid
    ctx.strokeStyle = bgGrid;
    ctx.lineWidth = 1;
    [25, 50, 75, 100].forEach(val => {
      const y = yFor(val);
      ctx.beginPath();
      ctx.moveTo(padL, y);
      ctx.lineTo(w - padR, y);
      ctx.stroke();

      ctx.fillStyle = txt;
      ctx.font = "900 11px system-ui";
      ctx.fillText(val.toString(), 6, y + 4);
    });

    const pts = entries.map((e, i) => ({
      x: xFor(i),
      y: yFor(clamp(Number(e.marks ?? 0), 0, 100)),
      marks: clamp(Number(e.marks ?? 0), 0, 100),
      name: e.name || "Paper",
      date: e.date || ""
    }));

    // gradient
    const grad = ctx.createLinearGradient(padL, padT, w - padR, padT);
    grad.addColorStop(0, a1);
    grad.addColorStop(1, a2);

    // line
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = grad;

    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);

    for (let i = 1; i < pts.length; i++) {
      const prev = pts[i - 1];
      const cur = pts[i];
      const midX = (prev.x + cur.x) / 2;
      ctx.quadraticCurveTo(prev.x, prev.y, midX, (prev.y + cur.y) / 2);
      ctx.quadraticCurveTo(midX, (prev.y + cur.y) / 2, cur.x, cur.y);
    }
    ctx.stroke();

    // fill
    ctx.globalAlpha = 0.16;
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.lineTo(pts[pts.length - 1].x, padT + chartH);
    ctx.lineTo(pts[0].x, padT + chartH);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;

    // dots
    pts.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 5.5, 0, Math.PI * 2);
      ctx.fillStyle = theme === "dark" ? "rgba(15,17,23,0.92)" : "rgba(255,255,255,0.92)";
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = grad;
      ctx.stroke();
    });

    // handlers (reset each render)
    canvas.onpointerdown = null;

    const findNearest = (clientX, clientY) => {
      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;

      let best = null;
      let bestDist = 999999;
      pts.forEach(p => {
        const dx = p.x - x, dy = p.y - y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < bestDist) { bestDist = d; best = p; }
      });

      if (!best || bestDist > 28) return null;
      return { best, rect };
    };

    const showHit = (clientX, clientY) => {
      const hit = findNearest(clientX, clientY);
      if (!hit) { hideBubble(bubble); return; }

      const wrapRect = wrapEl.getBoundingClientRect();
      const bx = (hit.rect.left - wrapRect.left) + hit.best.x;
      const by = (hit.rect.top - wrapRect.top) + hit.best.y;

      showBubble(
        bubble,
        bx,
        by,
        `${hit.best.name}<br/>
        <span style="opacity:.75">${hit.best.date}</span><br/>
        <span style="font-size:16px">Marks: ${hit.best.marks}/100</span>`
      );
    };

    canvas.onpointerdown = (e) => showHit(e.clientX, e.clientY);

    canvas.addEventListener("touchstart", (e) => {
      const t = e.touches?.[0];
      if (!t) return;
      showHit(t.clientX, t.clientY);
    }, { passive: true });

    canvas.addEventListener("touchmove", (e) => {
      const t = e.touches?.[0];
      if (!t) return;
      showHit(t.clientX, t.clientY);
    }, { passive: true });
  }

  // ---------- init ----------
  window.initPapersTracker = function initPapersTracker() {
    const btnPaperSubject = document.getElementById("btnPaperSubject");
    const paperSubjectDot = document.getElementById("paperSubjectDot");
    const paperSubjectName = document.getElementById("paperSubjectName");

    const btnAddPaper = document.getElementById("btnAddPaper");

    const paperSheet = document.getElementById("paperSheet");
    const paperBackdrop = document.getElementById("paperBackdrop");
    const btnClosePaper = document.getElementById("btnClosePaper");
    const btnSavePaper = document.getElementById("btnSavePaper");

    const inpPaperName = document.getElementById("inpPaperName");
    const inpPaperMarks = document.getElementById("inpPaperMarks");
    const inpPaperDate = document.getElementById("inpPaperDate");

    const paperChart = document.getElementById("paperChart");
    const paperChartWrap = document.querySelector(".paperChartWrap");

    const paperLast = document.getElementById("paperLast");
    const paperBest = document.getElementById("paperBest");
    const paperAvg = document.getElementById("paperAvg");

    const paperAiContent = document.getElementById("paperAiContent");

    // ✅ subject sheet elements (from YOUR HTML)
    const paperSubjectSheet = document.getElementById("paperSubjectSheet");
    const paperSubjectBackdrop = document.getElementById("paperSubjectBackdrop");
    const paperSubjectList = document.getElementById("paperSubjectList");

    function updatePillUI(sub) {
      if (paperSubjectName) paperSubjectName.textContent = sub.name || "Subject";
      if (paperSubjectDot) {
        const [a1, a2] = getAccentPairFromSubject(sub);
        paperSubjectDot.style.background = `linear-gradient(135deg, ${a1}, ${a2})`;
      }
    }

    function openAddSheet() {
      if (!paperSheet) return;
      paperSheet.classList.add("show");
      if (inpPaperDate) inpPaperDate.value = todayKey();
      setTimeout(() => inpPaperName?.focus(), 80);
    }
    function closeAddSheet() {
      paperSheet?.classList.remove("show");
    }

    function openSubjectSheet() {
      if (!paperSubjectSheet || !paperSubjectList) return;

      const subjects = loadSubjects();
      if (!subjects.length) {
        window.showToast?.("No subjects yet 😭");
        return;
      }

      const selectedId = loadViewSubjectId();
      const theme = getTheme();
      const mainText = theme === "dark" ? "rgba(255,255,255,0.92)" : "rgba(0,0,0,0.92)";
      const subText = theme === "dark" ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.55)";

      paperSubjectList.innerHTML = "";

      subjects.forEach(sub => {
        const [a1, a2] = getAccentPairFromSubject(sub);
        const isSelected = sub.id === selectedId;

        const row = document.createElement("button");
        row.type = "button";
        row.className = "markCard";
        row.style.width = "100%";
        row.style.border = "none";
        row.style.cursor = "pointer";
        row.style.textAlign = "left";
        row.style.display = "flex";
        row.style.justifyContent = "space-between";
        row.style.alignItems = "center";

        row.innerHTML = `
          <div style="display:flex;align-items:center;gap:12px;">
            <div style="width:14px;height:14px;border-radius:999px;background:linear-gradient(135deg,${a1},${a2});"></div>
            <div style="display:flex;flex-direction:column;gap:2px;">
              <div style="font-weight:950;color:${mainText}">${sub.name}</div>
              <div style="font-weight:900;color:${subText};font-size:12px;">Tap to view marks</div>
            </div>
          </div>
          <div style="font-weight:950;color:${subText}">${isSelected ? "Selected" : "Select"}</div>
        `;

        row.addEventListener("click", () => {
          saveViewSubjectId(sub.id);
          paperSubjectSheet.classList.remove("show");
          render();
        });

        paperSubjectList.appendChild(row);
      });

      paperSubjectSheet.classList.add("show");
    }

    function closeSubjectSheet() {
      paperSubjectSheet?.classList.remove("show");
    }

    function render() {
      const sub = getViewSubject();
      updatePillUI(sub);

      const all = loadPapers();
      const list = all.filter(p => p.subjectId === sub.id);

      if (!list.length) {
        if (paperLast) paperLast.textContent = "—";
        if (paperBest) paperBest.textContent = "—";
        if (paperAvg) paperAvg.textContent = "—";
      } else {
        const sorted = [...list].sort((a, b) => Number(a.ts || 0) - Number(b.ts || 0));
        const last = sorted[sorted.length - 1];
        const best = Math.max(...sorted.map(x => Number(x.marks ?? 0)));
        const avg = Math.round(sorted.reduce((s, x) => s + Number(x.marks ?? 0), 0) / sorted.length);

        if (paperLast) paperLast.textContent = `${Number(last.marks ?? 0)}/100`;
        if (paperBest) paperBest.textContent = `${best}/100`;
        if (paperAvg) paperAvg.textContent = `${avg}/100`;
      }

      drawChart(paperChart, list, sub, paperChartWrap);
      updateAiInsight(list);
    }

    function updateAiInsight(list) {
      // Re-select to be safe
      const el = document.getElementById("paperAiContent");
      if (!el) return;

      if (!list || !list.length) {
        el.innerHTML = `
          <div class="aiRow" style="text-align:center; opacity:0.7;">
            Add paper marks to unlock AI insights 🤖
          </div>
        `;
        return;
      }

      // Calculate average for overall level
      const avg = Math.round(list.reduce((s, x) => s + Number(x.marks ?? 0), 0) / list.length);

      let grade = "";
      let instruction = "";
      let colorClass = "flat";

      // Static Feedback (Status)
      const feedbackMap = {
        A: "Excellent work! You're mastering this subject. Maintain this consistency.",
        B: "Great job! A little push and you'll reach an 'A'.",
        C: "Good foundation. You need to focus on your weak areas.",
        S: "You passed, but barely. It's time to get serious about core concepts.",
        F: "Don't give up. Consistency and basics are your best friends right now."
      };

      // Random Plans (Strategy)
      const plans = {
        A: [
          "Review past papers 2015-2020 for subtle pattern changes.",
          "Try teaching this topic to a friend to solidify your mastery.",
          "Time yourself strictly to finish 10 minutes early.",
          "Challenge yourself with advanced questions beyond the syllabus.",
          "Keep revising small details to aim for 100%.",
          "Help others who are struggling to reinforce your own knowledge.",
          "Focus on presentation and handwriting for that extra edge.",
          "Treat every practice paper like the final exam."
        ],
        B: [
          "Review your mistakes carefully. Those few lost marks are key.",
          "Focus on the topics you find slightly tricky.",
          "Practice more structured questions to ensure you don't miss points.",
          "Speed up your answering process without sacrificing accuracy.",
          "Compare answers with marking schemes to see what examiners want.",
          "A distinction is just a few correct answers away!"
        ],
        C: [
          "Identify the one chapter dragging your average down and conquer it.",
          "Practice past paper questions specifically on your weaker topics.",
          "Don't just read; write down answers to improve retention.",
          "Focus on understanding the 'why', not just memorizing.",
          "Consistent daily practice of 30 mins defaults to a B grade soon!",
          "Check your definitions. Precision matters."
        ],
        S: [
          "Don't ignore the difficult chapters. Break them down.",
          "Create short summary notes for quick revision every morning.",
          "Focus on the 20% of the syllabus that carries 80% of the marks.",
          "Practice simplified problems first to build confidence.",
          "Review the basics. A strong foundation boosts marks quickly.",
          "Ask for help on topics you don't understand immediately."
        ],
        F: [
          "Start small. Master one topic at a time.",
          "Read the textbook summaries before attempting questions.",
          "Focus on passing first. Identify easy marks to grab.",
          "Study 15 minutes every single day. Consistency beats intensity.",
          "Rewrite class notes in your own words.",
          "Use diagrams to visualize concepts.",
          "Believe in yourself. Every expert was once a beginner."
        ]
      };

      const pickPlan = (arr) => arr[Math.floor(Math.random() * arr.length)];

      let feedback = "";
      let plan = "";

      if (avg >= 75) {
        grade = "A (Distinction)";
        feedback = feedbackMap.A;
        plan = pickPlan(plans.A);
        colorClass = "up";
      } else if (avg >= 65) {
        grade = "B (Very Good)";
        feedback = feedbackMap.B;
        plan = pickPlan(plans.B);
        colorClass = "up";
      } else if (avg >= 55) {
        grade = "C (Credit)";
        feedback = feedbackMap.C;
        plan = pickPlan(plans.C);
        colorClass = "flat";
      } else if (avg >= 35) {
        grade = "S (Ordinary)";
        feedback = feedbackMap.S;
        plan = pickPlan(plans.S);
        colorClass = "down";
      } else {
        grade = "F (Weak)";
        feedback = feedbackMap.F;
        plan = pickPlan(plans.F);
        colorClass = "down";
      }

      el.innerHTML = `
        <div class="aiRow">
          <div class="aiMeta">
            <div class="aiLabel">Current Level</div>
            <div class="aiBadge ${colorClass}">${grade}</div>
          </div>
          
          <div style="margin-top:8px; font-weight:800; font-size:14px; opacity:0.95; color:var(--fg);">
            ${feedback}
          </div>

          <div style="margin: 10px 0; border-top: 1px solid rgba(120,120,120,0.15);"></div>

          <div class="aiMeta" style="margin-bottom:4px;">
            <div class="aiLabel" style="font-size:12px; opacity:0.75; text-transform:uppercase; letter-spacing:0.5px;">Recommended Strategy</div>
          </div>
          <div style="font-size:13px; opacity:0.85; line-height:1.5; font-style:italic;">
            "${plan}"
          </div>
        </div>
      `;
    }

    // ✅ SUBJECT BUTTON FIX: touchstart + click
    const openPicker = (e) => {
      e?.preventDefault?.();
      openSubjectSheet();
    };
    btnPaperSubject?.addEventListener("touchstart", openPicker, { passive: false });
    btnPaperSubject?.addEventListener("click", openPicker);

    // ✅ Subject sheet close ONLY backdrop (since button removed)
    paperSubjectBackdrop?.addEventListener("click", closeSubjectSheet);

    // add sheet handlers
    btnAddPaper?.addEventListener("click", openAddSheet);
    paperBackdrop?.addEventListener("click", closeAddSheet);
    btnClosePaper?.addEventListener("click", closeAddSheet);

    // save paper (no empty marks)
    btnSavePaper?.addEventListener("click", () => {
      const sub = getViewSubject();
      const name = (inpPaperName?.value || "").trim() || "Paper";

      const rawMarks = (inpPaperMarks?.value ?? "").toString().trim();
      if (!rawMarks) {
        window.showToast?.("Enter marks 😤");
        return;
      }

      const marks = clamp(Number(rawMarks), 0, 100);
      if (isNaN(marks)) {
        window.showToast?.("Invalid marks 😭");
        return;
      }

      const date = inpPaperDate?.value || todayKey();

      const all = loadPapers();
      all.push({
        id: "paper_" + Date.now(),
        subjectId: sub.id,
        subjectName: sub.name,
        name,
        marks,
        date,
        ts: Date.now()
      });

      savePapers(all);

      if (inpPaperName) inpPaperName.value = "";
      if (inpPaperMarks) inpPaperMarks.value = "";

      closeAddSheet();
      render();
      window.showToast?.("Paper saved ✅");
    });

    window.addEventListener("storage", render);

    // ✅ Separate render function exposed for tab switching
    window.refreshPapers = function () {
      render();
      // Force chart redraw if canvas exists and has size
      const c = document.getElementById("paperChart");
      if (c) {
        const sub = getViewSubject();
        const all = loadPapers();
        const list = all.filter(p => p.subjectId === sub.id);
        drawChart(c, list, sub, document.querySelector(".paperChartWrap"));
      }
    };

    render();
  };
})();