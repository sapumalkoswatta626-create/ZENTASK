(() => {
  // ==========================================
  // ZENTASK PROFILE — SAFE MODE (IIFE) ✅
  // ==========================================

  // 1. Private Helper (won't conflict with other scripts)
  const $ = (id) => document.getElementById(id);

  // 2. Data Helpers
  function daysBetween(a, b) {
    const ms = 24 * 60 * 60 * 1000;
    return Math.ceil((b.getTime() - a.getTime()) / ms);
  }
  function pad2(n) { return String(n).padStart(2, "0"); }
  function ymd(d) { return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`; }
  function monthName(m) {
    return ["January","February","March","April","May","June","July","August","September","October","November","December"][m];
  }
  function ordinal(n) {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  }
  function sameMonth(d, y, m) { return d.getFullYear() === y && d.getMonth() === m; }

  // 3. Elements (Safe Selection)
  // We use optional chaining (?) or checks to prevent crashes if an element is missing
  const profileName = $("profileName");
  const profilePic = $("profilePic");
  const changePicBtn = $("changePicBtn");
  const daysLeftEl = $("daysLeft");
  const examDateInput = $("examDate");

  // Achievement Elements
  const achievementList = $("achievementList");
  const achToggle = $("achToggle");
  const achCollapsed = $("achCollapsed");
  const achExpanded = $("achExpanded");
  const achDoneIcons = $("achDoneIcons");
  const achMiniText = $("achMiniText");
  const achChev = $("achChev");
  const achEmpty = $("achEmpty");

  // Modal Elements
  const nameModal = $("nameModal");
  const nameInput = $("nameInput");
  const cancelNameBtn = $("cancelNameBtn");
  const saveNameBtn = $("saveNameBtn");
  const motModal = $("motModal");
  const motText = $("motText");
  const motCloseBtn = $("motCloseBtn");
  const motBoostBtn = $("motBoostBtn");

  // Satisfaction Elements
  const satTodayText = $("satTodayText");
  const satEmojis = $("satEmojis");
  const satGrid = $("satGrid");
  const satMonthTitle = $("satMonthTitle");
  const satPrev = $("satPrev");
  const satNext = $("satNext");
  const satBanner = $("satBanner");
  const avgSat = $("avgSat");
  const topMood = $("topMood");
  const satStreak = $("satStreak");

  // 4. Storage Keys
  const KEY_NAME = "profile_name";
  const KEY_PIC = "profile_pic";
  const KEY_EXAM_DATE = "exam_date";
  const KEY_TOTAL_HOURS = "total_focus_hours";
  const KEY_TOTAL_DAYS = "total_focus_days";
  const KEY_ACH_EXPANDED = "achievements_expanded";
  const KEY_SAT = "study_satisfaction";

  const satMap = { 4: "😍", 3: "🙂", 2: "😐", 1: "🙁", 0: "😭" };
  let satViewDate = new Date();

  // ============================
  // LOGIC
  // ============================

  function loadProfile() {
    // Name
    const savedName = localStorage.getItem(KEY_NAME);
    if (savedName && profileName) profileName.textContent = savedName;

    // Pic
    const savedPic = localStorage.getItem(KEY_PIC);
    if (savedPic && profilePic) profilePic.src = savedPic;

    // Exam Date
    if (examDateInput) {
      let savedExam = localStorage.getItem(KEY_EXAM_DATE);
      if (!savedExam) {
        savedExam = "2026-11-10"; 
        localStorage.setItem(KEY_EXAM_DATE, savedExam);
      }
      examDateInput.value = savedExam;
      updateCountdown();
    }

    renderAchievements();
    applyAchState();
    updateTodaySat();
    renderSatCalendar();
    renderSatStats();
    checkLowMood();
  }

  function updateCountdown() {
    if (!examDateInput || !daysLeftEl) return;
    const raw = examDateInput.value;
    if (!raw) { daysLeftEl.textContent = "--"; return; }
    
    const now = new Date();
    const examDate = new Date(raw + "T00:00:00");
    const left = daysBetween(now, examDate);
    daysLeftEl.textContent = left < 0 ? "0" : left;
  }

  function getStats() {
    return {
      totalHours: parseFloat(localStorage.getItem(KEY_TOTAL_HOURS) || "0"),
      totalDays: parseInt(localStorage.getItem(KEY_TOTAL_DAYS) || "0", 10)
    };
  }

  // --- Achievements ---
  function renderAchievements() {
    if (!achievementList) return;
    const { totalHours, totalDays } = getStats();

    const achievements = [
      { icon: "⏳", name: "First Focus", desc: "1 hour focus", type: "hours", need: 1 },
      { icon: "⚡", name: "Mini Grinder", desc: "5 focus hours", type: "hours", need: 5 },
      { icon: "🔥", name: "Beast Mode", desc: "25 focus hours", type: "hours", need: 25 },
      { icon: "🏆", name: "Workaholic", desc: "100 focus hours", type: "hours", need: 100 },
      { icon: "📅", name: "Day 1", desc: "1 focused day", type: "days", need: 1 },
      { icon: "🧠", name: "7-Day Streak", desc: "7 focused days", type: "days", need: 7 },
      { icon: "👑", name: "30-Day Legend", desc: "30 focused days", type: "days", need: 30 }
    ];

    achievementList.innerHTML = "";
    if (achDoneIcons) achDoneIcons.innerHTML = "";
    let doneCount = 0;

    achievements.forEach((a) => {
      const value = a.type === "hours" ? totalHours : totalDays;
      const left = a.need - value;
      const unlocked = left <= 0;
      if (unlocked) doneCount++;

      if (unlocked && achDoneIcons) {
        const iconEl = document.createElement("div");
        iconEl.className = "achDoneIcon";
        iconEl.textContent = a.icon;
        achDoneIcons.appendChild(iconEl);
      }

      const row = document.createElement("div");
      row.className = "achRow";
      const rightText = unlocked ? "DONE ✅" : `${Math.max(0, left).toFixed(0)} left`;
      
      row.innerHTML = `
        <div class="achRowLeft">
          <div class="achRowIcon">${a.icon}</div>
          <div class="achTexts"><div class="achBig">${a.name}</div><div class="achSmall">${a.desc}</div></div>
        </div>
        <div class="achCount ${unlocked ? "done" : ""}">${rightText}</div>
      `;
      achievementList.appendChild(row);
    });

    if (achMiniText) achMiniText.textContent = `${doneCount} completed`;
    if (achEmpty) achEmpty.style.display = doneCount === 0 ? "block" : "none";
  }

  function applyAchState() {
    if (!achExpanded || !achCollapsed) return;
    const expanded = localStorage.getItem(KEY_ACH_EXPANDED) === "1";
    if (expanded) {
      achExpanded.classList.remove("hidden");
      achCollapsed.classList.add("hidden");
      if(achChev) achChev.classList.add("up");
    } else {
      achExpanded.classList.add("hidden");
      achCollapsed.classList.remove("hidden");
      if(achChev) achChev.classList.remove("up");
    }
  }

  // --- Satisfaction ---
  function loadSat() {
    try { return JSON.parse(localStorage.getItem(KEY_SAT) || "{}"); } catch(e) { return {}; }
  }
  function saveSat(data) { localStorage.setItem(KEY_SAT, JSON.stringify(data)); }

  function updateTodaySat() {
    if (!satTodayText || !satEmojis) return;
    const data = loadSat();
    const v = data[ymd(new Date())];
    satTodayText.textContent = v === undefined ? "Not rated" : `Today: ${satMap[v]}`;
    
    [...satEmojis.querySelectorAll(".satBtn")].forEach(btn => {
      btn.classList.toggle("active", btn.dataset.val == v);
    });
  }

  function renderSatCalendar() {
    if (!satGrid || !satMonthTitle) return;
    const data = loadSat();
    const year = satViewDate.getFullYear();
    const month = satViewDate.getMonth();
    satMonthTitle.textContent = `${monthName(month)} ${year}`;

    const first = new Date(year, month, 1);
    let startDay = first.getDay(); 
    startDay = startDay === 0 ? 6 : startDay - 1; // Mon start
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    satGrid.innerHTML = "";
    for(let i=0; i<startDay; i++) {
      const empty = document.createElement("div");
      empty.className = "satDay empty";
      satGrid.appendChild(empty);
    }

    const todayKey = ymd(new Date());
    for(let day=1; day<=daysInMonth; day++) {
      const d = new Date(year, month, day);
      const key = ymd(d);
      const box = document.createElement("div");
      box.className = "satDay";
      if (key === todayKey) box.classList.add("today");

      const emo = data[key] !== undefined ? satMap[data[key]] : "＋";
      box.innerHTML = `<div class="emo">${emo}</div><div class="num">${day}</div>`;
      satGrid.appendChild(box);
    }
  }

    // -------------------------
  // ✅ FIX: Mood Calculation
  // -------------------------
  function renderSatStats() {
    if (!satBanner) return;
    const data = loadSat();
    
    // 1. Calculate Average & Counts
    let count = 0, sum = 0;
    const moodCounts = { 0:0, 1:0, 2:0, 3:0, 4:0 }; // To find top mood

    Object.values(data).forEach(v => { 
      const val = parseInt(v, 10);
      if (!isNaN(val)) {
        sum += val; 
        count++;
        moodCounts[val] = (moodCounts[val] || 0) + 1;
      }
    });

    // 2. Calculate Streak
    let curStreak = 0;
    let d = new Date();
    // Check today or yesterday to start streak
    if (data[ymd(d)] === undefined) d.setDate(d.getDate() - 1);
    
    while(data[ymd(d)] !== undefined) { 
      curStreak++; 
      d.setDate(d.getDate() - 1); 
    }

    // 3. Find Top Mood (Mode)
    let bestMood = "--";
    let maxCount = -1;
    Object.entries(moodCounts).forEach(([k, c]) => {
      if (c > maxCount && c > 0) { 
        maxCount = c; 
        bestMood = satMap[k]; 
      }
    });

    // 4. Update UI
    if (avgSat) avgSat.textContent = count ? (sum/count).toFixed(1) : "0.0";
    if (satStreak) satStreak.textContent = `${curStreak} days`;
    if (topMood) topMood.textContent = bestMood; // ✅ Fixed
    
    satBanner.innerHTML = `You have <b>${count}</b> entries total.`;
  }


  function checkLowMood() {
    if (!motModal) return;
    // Logic for low mood check...
  }

  // ============================
  // LISTENERS (Safe)
  // ============================

  if (examDateInput) {
    examDateInput.addEventListener("change", () => {
      localStorage.setItem(KEY_EXAM_DATE, examDateInput.value);
      updateCountdown();
    });
  }

  if (achToggle) {
    achToggle.addEventListener("click", () => {
      const exp = localStorage.getItem(KEY_ACH_EXPANDED) === "1";
      localStorage.setItem(KEY_ACH_EXPANDED, exp ? "0" : "1");
      applyAchState();
    });
  }

  // Edit Name
  function openNameModal() {
    if (nameInput) nameInput.value = profileName?.textContent || "";
    if (nameModal) {
      nameModal.classList.remove("hidden");
      setTimeout(() => nameInput?.focus(), 80);
    }
  }
  
  // Try to find an edit button, OR attach to name click
  const headerEditBtn = document.getElementById("editBtn"); // If existed
  if (headerEditBtn) headerEditBtn.addEventListener("click", openNameModal);
  if (profileName) profileName.addEventListener("click", openNameModal);

  if (cancelNameBtn) cancelNameBtn.addEventListener("click", () => nameModal.classList.add("hidden"));
  if (saveNameBtn) {
    saveNameBtn.addEventListener("click", () => {
      const val = nameInput.value.trim();
      if (val) {
        localStorage.setItem(KEY_NAME, val);
        if (profileName) profileName.textContent = val;
      }
      nameModal.classList.add("hidden");
    });
  }

  // Picture
  if (changePicBtn) {
    changePicBtn.addEventListener("click", () => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.onchange = () => {
        const file = input.files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = () => {
            if(profilePic) profilePic.src = reader.result;
            localStorage.setItem(KEY_PIC, reader.result);
          };
          reader.readAsDataURL(file);
        }
      };
      input.click();
    });
  }

  // Satisfaction
  if (satEmojis) {
    satEmojis.addEventListener("click", (e) => {
      const btn = e.target.closest(".satBtn");
      if (!btn) return;
      const v = parseInt(btn.dataset.val, 10);
      const data = loadSat();
      data[ymd(new Date())] = v;
      saveSat(data);
      updateTodaySat();
      renderSatCalendar();
      renderSatStats();
    });
  }

  if (satPrev) satPrev.addEventListener("click", () => {
    satViewDate.setMonth(satViewDate.getMonth()-1);
    renderSatCalendar();
  });
  if (satNext) satNext.addEventListener("click", () => {
    satViewDate.setMonth(satViewDate.getMonth()+1);
    renderSatCalendar();
  });

  // Modal Close
  if (nameModal) nameModal.addEventListener("click", (e) => {
    if (e.target === nameModal) nameModal.classList.add("hidden");
  });
  if (motCloseBtn) motCloseBtn.addEventListener("click", () => motModal.classList.add("hidden"));

  // INIT
  loadProfile();

})();
