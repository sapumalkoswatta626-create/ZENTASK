(() => {
  // ======================================
  // ZENTASK Tasks Tab — Duolingo Style ✅
  // Streak + XP + Daily goal
  // Uses same theme + subject storage as Pomodoro
  // ======================================

  const $ = (id) => document.getElementById(id);

  // summary
  const taskChip = $("taskChip");
  const taskSummarySub = $("taskSummarySub");
  const taskProgressFill = $("taskProgressFill");

  // duolingo widgets
  const btnStreak = $("todoBtnStreak");
  const streakCount = $("todostreakCount");
  const xpChip = $("xpChip");

  // filter pill
  const btnFilterSubject = $("btnFilterSubject");
  const filterDot = $("filterDot");
  const filterName = $("filterName");

  // list
  const taskList = $("taskList");
  const btnClearDone = $("btnClearDone");

  // add sheet
  const btnOpenAdd = $("btnOpenAdd");
  const addSheet = $("addSheet");
  const addBackdrop = $("addBackdrop");
  const btnCloseAdd = $("btnCloseAdd");

  const inpTaskName = $("inpTaskName");
  const btnPickSubject = $("btnPickSubject");
  const newTaskDot = $("newTaskDot");
  const newTaskSubject = $("newTaskSubject");

  const btnToggleToday = $("btnToggleToday");
  const todayState = $("todayState");

  const btnCreateTask = $("btnCreateTask");

  // subject sheet
  const subjectSheet = $("todoSubjectSheet");
  const subjectBackdrop = $("todoSubjectBackdrop");
  const btnCloseSubject = $("todoBtnCloseSubject");
  const subjectList = $("todoSubjectList");
  const btnAddSubject = $("todoBtnAddSubject");
  const subjectSheetTitle = $("todoSubjectSheetTitle");

  // toast
  const toast = $("toast");
// --------------------
// ✅ SWITCH + ROOMS (Profile <-> Todo)
// --------------------
const btnTodoProfile = $("btnTodoProfile");
const btnTodoTasks = $("btnTodoTasks");
const roomProfile = $("todoRoomProfile");
const roomTasks = $("todoRoomTasks");

function openTodoRoom(which) {
  if (!btnTodoProfile || !btnTodoTasks || !roomProfile || !roomTasks) return;

  btnTodoProfile.classList.toggle("active", which === "profile");
  btnTodoTasks.classList.toggle("active", which === "tasks");

  roomProfile.classList.toggle("active", which === "profile");
  roomTasks.classList.toggle("active", which === "tasks");
}

btnTodoProfile?.addEventListener("click", () => openTodoRoom("profile"));
btnTodoTasks?.addEventListener("click", () => openTodoRoom("tasks"));
  // --------------------
  // Toast
  // --------------------
  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 1500);
  }

  // --------------------
  // Theme sync (no theme button here)
  // --------------------
  function applyThemeSync() {
    const theme = localStorage.getItem("zentask_theme") || "light";
    if (theme === "dark")
      document.documentElement.setAttribute("data-theme", "dark");
    else document.documentElement.removeAttribute("data-theme");
  }

  // --------------------
  // Accent from active subject
  // --------------------
  const PALETTE = [
    { id: "purple", a1: "#7a5cff", a2: "#b7a6ff" },
    { id: "blue", a1: "#2f6bff", a2: "#8fb1ff" },
    { id: "green", a1: "#10b981", a2: "#7ee0b1" },
    { id: "orange", a1: "#fb923c", a2: "#ffd1a6" },
    { id: "pink", a1: "#ff4fb1", a2: "#ffb3dc" },
    { id: "red", a1: "#ef4444", a2: "#ff9aa7" }
  ];

  function getPaletteById(id) {
    return PALETTE.find((p) => p.id === id) || PALETTE[0];
  }
  function setAccentByPalette(palId) {
    const p = getPaletteById(palId);
    document.documentElement.style.setProperty("--accent-1", p.a1);
    document.documentElement.style.setProperty("--accent-2", p.a2);
  }

  // --------------------
  // Subjects (same storage as Pomodoro)
  // --------------------
  const SUBJECT_DEFAULTS = [
    { id: "bio", name: "Biology", color: "green" },
    { id: "chem", name: "Chemistry", color: "red" },
    { id: "phy", name: "Physics", color: "purple" }
  ];

  function loadSubjects() {
    try {
      const s = JSON.parse(localStorage.getItem("zentask_subjects") || "null");
      if (!s || !Array.isArray(s) || s.length === 0)
        return [...SUBJECT_DEFAULTS];
      return s;
    } catch (e) {
      return [...SUBJECT_DEFAULTS];
    }
  }
  function saveSubjects(arr) {
    localStorage.setItem("zentask_subjects", JSON.stringify(arr));
  }
  function loadActiveSubject() {
    return localStorage.getItem("zentask_active_subject") || "bio";
  }
  function getSubjectById(id) {
    const arr = loadSubjects();
    return arr.find((x) => x.id === id) || arr[0];
  }

  // --------------------
  // Tasks storage
  // --------------------
  function todayKey() {
    return new Date().toISOString().slice(0, 10);
  }

  function loadTasks() {
    try {
      const s = JSON.parse(localStorage.getItem("zentask_tasks") || "[]");
      return Array.isArray(s) ? s : [];
    } catch (e) {
      return [];
    }
  }
  function saveTasks(arr) {
    localStorage.setItem("zentask_tasks", JSON.stringify(arr));
  }

  // task model:
  // { id, name, subjectId, subjectName, date, done, createdAt }

  let state = {
    filterSubjectId: "all",
    newTaskSubjectId: loadActiveSubject(),
    newTaskToday: true
  };

  // --------------------
  // Duolingo-like system
  // --------------------
  const DAILY_GOAL = 5; // ✅ change anytime
  const XP_PER_TASK = 10; // ✅ change anytime

  function loadXP() {
    try {
      return JSON.parse(localStorage.getItem("zentask_xp") || "null") || {};
    } catch (e) {
      return {};
    }
  }
  function saveXP(obj) {
    localStorage.setItem("zentask_xp", JSON.stringify(obj));
  }
  function getTodayXP() {
    const xp = loadXP();
    return Number(xp[todayKey()] || 0);
  }
  function setTodayXP(val) {
    const xp = loadXP();
    xp[todayKey()] = Math.max(0, Number(val || 0));
    saveXP(xp);
  }

 function loadStreak(){
  try{
    return JSON.parse(localStorage.getItem("zentask_streak") || "null") || {
      streak: 0,
      lastCompletedDay: null
    };
  }catch(e){
    return { streak: 0, lastCompletedDay: null };
  }
}

function saveStreak(s){
  localStorage.setItem("zentask_streak", JSON.stringify(s));
}

function isYesterdayDayKey(key){
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0,10) === key;
}
// ✅ THIS FUNCTION WAS MISSING
function updateStreakIfNeeded() {
  const s = loadStreak();
  const today = todayKey();
  
  // If never played, or played today, do nothing
  if (!s.lastCompletedDay || s.lastCompletedDay === today) return;

  // If played yesterday, streak is safe.
  if (isYesterdayDayKey(s.lastCompletedDay)) return;

  // Otherwise (played 2+ days ago), streak is broken 💀
  s.streak = 0;
  saveStreak(s);
}

/* call this when user completes FIRST task of the day */
function updateStreakOnFirstCompletionToday(){
  const today = todayKey();
  const s = loadStreak();

  // already counted today
  if(s.lastCompletedDay === today) return;

  // if last completion was NOT yesterday -> reset streak
  if(s.lastCompletedDay && !isYesterdayDayKey(s.lastCompletedDay)){
    s.streak = 0;
  }

  // increase streak
  s.streak = (Number(s.streak) || 0) + 1;
  s.lastCompletedDay = today;

  saveStreak(s);
}

  // --------------------
  // Sheets
  // --------------------
  function openAddSheet() {
    if (!addSheet) return;
    addSheet.classList.add("show");
    inpTaskName.value = "";
    inpTaskName.focus();
    renderNewTaskSubject();
  }
  function closeAddSheet() {
    if (!addSheet) return;
    addSheet.classList.remove("show");
  }

  function openSubjectSheet(mode = "new") {
    if (!subjectSheet) return;
    subjectSheet.dataset.mode = mode;
    subjectSheetTitle.textContent =
      mode === "filter" ? "Filter subject" : "Choose subject";
    subjectSheet.classList.add("show");
    renderSubjectsSheet();
  }
  function closeSubjectSheet() {
    if (!subjectSheet) return;
    subjectSheet.classList.remove("show");
  }

  // --------------------
  // UI helpers
  // --------------------
  function getSubjectDotColor(subjectId) {
    const s = getSubjectById(subjectId);
    const pal = getPaletteById(s.color);
    return `linear-gradient(135deg, ${pal.a1}, ${pal.a2})`;
  }

  function renderNewTaskSubject() {
    const sub = getSubjectById(state.newTaskSubjectId);
    if (newTaskSubject) newTaskSubject.textContent = sub.name;
    if (newTaskDot) newTaskDot.style.background = getSubjectDotColor(sub.id);
  }

  function renderFilterPill() {
    if (!filterName || !filterDot) return;

    if (state.filterSubjectId === "all") {
      filterName.textContent = "All";
      filterDot.style.background = `linear-gradient(135deg, var(--accent-1), var(--accent-2))`;
      return;
    }
    const sub = getSubjectById(state.filterSubjectId);
    filterName.textContent = sub.name;
    filterDot.style.background = getSubjectDotColor(sub.id);
  }

  // --------------------
  // Render tasks
  // --------------------
  function loadTotalDone(){
  return Number(localStorage.getItem("zentask_total_done_tasks") || 0);
}
function saveTotalDone(n){
  localStorage.setItem("zentask_total_done_tasks", String(Math.max(0, Number(n || 0))));
}
function incTotalDone(){
  saveTotalDone(loadTotalDone() + 1);
}
  function getAllTimeDoneCount(){
  const tasks = loadTasks();
  return tasks.filter(t => t.done === true).length;
}
  function renderTasks() {
    const tasks = loadTasks();
    const today = todayKey();

    let filtered = tasks;
    if (state.filterSubjectId !== "all") {
      filtered = filtered.filter((t) => t.subjectId === state.filterSubjectId);
    }

    // today first
    const todayTasks = filtered.filter((t) => t.date === today);
    const otherTasks = filtered.filter((t) => t.date !== today);

    // sort: undone first then newest
    todayTasks.sort((a, b) => a.done - b.done || b.createdAt - a.createdAt);
    otherTasks.sort((a, b) => a.done - b.done || b.createdAt - a.createdAt);

    const allShown = [...todayTasks, ...otherTasks];

    if (taskList) {
      taskList.innerHTML = "";
      if (allShown.length === 0) {
        taskList.innerHTML = `<div class="p-sub">No tasks yet 😮‍💨 Add one.</div>`;
      } else {
        allShown.forEach((t) => taskList.appendChild(renderTaskItem(t)));
      }
    }

    // summary based on today's tasks (not filtered)
    const todayAll = tasks.filter((t) => t.date === today);
    const done = todayAll.filter((t) => t.done).length;
    const total = todayAll.length;

    if (taskChip) taskChip.textContent = `${done} / ${total}`;
    if (taskSummarySub) taskSummarySub.textContent = `${done} completed`;

    const pct = total <= 0 ? 0 : Math.round((done / total) * 100);
    if (taskProgressFill) taskProgressFill.style.width = `${pct}%`;

    // xp chip
    if (xpChip) xpChip.textContent = `⭐ ${getTodayXP()} XP`;

   // 🔥 all-time completed tasks counter (never resets)
if(streakCount){
  streakCount.textContent = loadTotalDone();
  streakCount.style.color = "inherit";
}
  }

  function renderTaskItem(task) {
    const row = document.createElement("div");
    row.className = "taskItem" + (task.done ? " done" : "");
    row.dataset.id = task.id;

    const left = document.createElement("div");
    left.className = "taskLeft";

    const check = document.createElement("button");
    check.className = "taskCheck";
    check.innerHTML = `<span class="tick">✓</span>`;
    check.addEventListener("click", () => toggleDone(task.id));

    const dot = document.createElement("div");
    dot.className = "taskDot";
    dot.style.background = getSubjectDotColor(task.subjectId);

    const text = document.createElement("div");
    text.className = "taskText";

    const name = document.createElement("div");
    name.className = "taskName";
    name.textContent = task.name;

    const meta = document.createElement("div");
    meta.className = "taskMeta";
    meta.textContent = `${task.subjectName}${
      task.date === todayKey() ? " • Today" : ""
    }`;

    text.appendChild(name);
    text.appendChild(meta);

    left.appendChild(check);
    left.appendChild(dot);
    left.appendChild(text);

    const right = document.createElement("div");
    right.className = "taskRight";

    const del = document.createElement("button");
    del.className = "taskDelete";
    del.textContent = "🗑";
    del.addEventListener("click", () => deleteTask(task.id));

    right.appendChild(del);

    row.appendChild(left);
    row.appendChild(right);

    // long press delete
    let holdTimer = null;
    row.addEventListener(
      "touchstart",
      () => {
        holdTimer = setTimeout(() => deleteTask(task.id), 700);
      },
      { passive: true }
    );
    row.addEventListener("touchend", () => {
      if (holdTimer) clearTimeout(holdTimer);
      holdTimer = null;
    });

    return row;
  }

  function toggleDone(id) {
    const tasks = loadTasks();
    const idx = tasks.findIndex((t) => t.id === id);
    if (idx === -1) return;

    const wasDone = !!tasks[idx].done;
    tasks[idx].done = !tasks[idx].done;
    saveTasks(tasks);

    // ✅ completion effects
    if (!wasDone && tasks[idx].done) {
  // ✅ lifetime counter should count ALL completed tasks (any day)
  incTotalDone();

  // ✅ XP + streak only for today's tasks
  if (tasks[idx].date === todayKey()) {
    setTodayXP(getTodayXP() + XP_PER_TASK);
    updateStreakOnFirstCompletionToday();
    showToast(`+${XP_PER_TASK} XP ⭐`);
  } else {
    showToast("Completed ✅");
  }
} else {
  showToast(tasks[idx].done ? "Completed ✅" : "Undone ↩");
}

    renderTasks();
  }

  // --------------------
  // Delete task (Universal Delete Sheet)
  // --------------------
let taskToDeleteId = null;

function deleteTask(id){
  taskToDeleteId = id;

  const tasks = loadTasks();
  const task = tasks.find(t => t.id === id);
  if(!task) return;

  const subject = getSubjectById(task.subjectId);
  const pal = getPaletteById(subject.color);

  const sheet = document.getElementById("universalDeleteSheet");
  const btnCancel = document.getElementById("btnDeleteCancel");
  const btnConfirm = document.getElementById("btnDeleteConfirm");
  const backdrop = document.getElementById("deleteBackdrop");

  if(!sheet || !btnCancel || !btnConfirm){
    const ok = confirm("Delete this task?");
    if(!ok) return;
    const newTasks = loadTasks().filter(t => t.id !== id);
    saveTasks(newTasks);
    showToast("Deleted 🗑");
    renderTasks();
    return;
  }

  // Optional: dynamic title
  const title = document.getElementById("deleteTitle");
  if(title) title.textContent = `Delete "${task.name}"?`;

  // ✅ cancel = outline subject color
  btnCancel.style.color = pal.a1;
  btnCancel.style.border = `2px solid ${pal.a1}55`;
  btnCancel.style.background = `${pal.a1}10`;

  // ✅ delete = filled subject gradient
  btnConfirm.style.background = `linear-gradient(135deg, ${pal.a1}, ${pal.a2})`;
  btnConfirm.style.boxShadow = `0 14px 30px ${pal.a1}45`;

  sheet.classList.add("show");

  btnCancel.onclick = () => {
    sheet.classList.remove("show");
    taskToDeleteId = null;
  };

  btnConfirm.onclick = () => {
    const newTasks = loadTasks().filter(t => t.id !== taskToDeleteId);
    saveTasks(newTasks);
    showToast("Deleted 🗑");
    renderTasks();
    sheet.classList.remove("show");
    taskToDeleteId = null;
  };

  if(backdrop){
    backdrop.onclick = () => {
      sheet.classList.remove("show");
      taskToDeleteId = null;
    };
  }
}

  // --------------------
  // Subject sheet render
  // --------------------
  function renderSubjectsSheet() {
    const arr = loadSubjects();
    if (!subjectList) return;

    subjectList.innerHTML = "";

    if (subjectSheet?.dataset.mode === "filter") {
      const allItem = document.createElement("div");
      allItem.className = "sheetItem";
      allItem.innerHTML = `
        <div class="sheetLeft">
          <div class="sheetColor" style="background:linear-gradient(135deg,var(--accent-1),var(--accent-2));"></div>
          <div>All</div>
        </div>
        <div class="sheetCheck">${state.filterSubjectId === "all" ? "✓" : ""}</div>
      `;
      allItem.addEventListener("click", () => {
        state.filterSubjectId = "all";
        renderFilterPill();
        closeSubjectSheet();
        renderTasks();
      });
      subjectList.appendChild(allItem);
    }

    arr.forEach((s) => {
      const item = document.createElement("div");
      item.className = "sheetItem";

      const pal = getPaletteById(s.color);

      item.innerHTML = `
        <div class="sheetLeft">
          <div class="sheetColor" style="background:linear-gradient(135deg,${pal.a1},${pal.a2});"></div>
          <div>${s.name}</div>
        </div>
        <div class="sheetCheck">${state.filterSubjectId === s.id ? "✓" : ""}</div>
      `;

      item.addEventListener("click", () => {
        if (subjectSheet.dataset.mode === "filter") {
          state.filterSubjectId = s.id;
          renderFilterPill();
          closeSubjectSheet();
          renderTasks();
        } else {
          state.newTaskSubjectId = s.id;
          renderNewTaskSubject();
          closeSubjectSheet();
        }
      });

      subjectList.appendChild(item);
    });
  }

  function addCustomSubject() {
    const name = prompt("Subject name?");
    if (!name) return;

    const id = "sub_" + Date.now();
    const arr = loadSubjects();
    arr.push({ id, name: name.trim(), color: "purple" });
    saveSubjects(arr);

    showToast("Subject added ✨");
    renderSubjectsSheet();
  }

  // --------------------
  // Create task
  // --------------------
  function createTask() {
    const name = (inpTaskName.value || "").trim();
    if (!name) {
      showToast("Type a task name 😤");
      return;
    }

    const sub = getSubjectById(state.newTaskSubjectId);
    const date = todayKey();

    const task = {
      id: "task_" + Date.now(),
      name,
      subjectId: sub.id,
      subjectName: sub.name,
      date,
      done: false,
      createdAt: Date.now()
    };

    const tasks = loadTasks();
    tasks.unshift(task);
    saveTasks(tasks);

    closeAddSheet();
    showToast("Task added ✅");
    renderTasks();
  }

  // --------------------
  // Events (safe)
  // --------------------
  btnOpenAdd?.addEventListener("click", openAddSheet);
  btnCloseAdd?.addEventListener("click", closeAddSheet);
  addBackdrop?.addEventListener("click", closeAddSheet);

  btnPickSubject?.addEventListener("click", () => openSubjectSheet("new"));
  subjectBackdrop?.addEventListener("click", closeSubjectSheet);
  btnCloseSubject?.addEventListener("click", closeSubjectSheet);

  btnAddSubject?.addEventListener("click", addCustomSubject);
  btnFilterSubject?.addEventListener("click", () => openSubjectSheet("filter"));

  btnToggleToday?.addEventListener("click", () => {
    state.newTaskToday = !state.newTaskToday;
    if (todayState)
      todayState.textContent = state.newTaskToday ? "Today ✅" : "Today ❌";
  });

  btnCreateTask?.addEventListener("click", createTask);

function openClearSheet(){
  const sheet = document.getElementById("universalClearSheet");
  const backdrop = document.getElementById("clearBackdrop");
  const btnCancel = document.getElementById("btnClearCancel");
  const btnConfirm = document.getElementById("btnClearConfirm");

  if(!sheet || !btnCancel || !btnConfirm){
    // fallback
    const ok = confirm("Clear completed tasks?");
    if(!ok) return;
    const tasks = loadTasks().filter(t => !t.done);
    saveTasks(tasks);
    showToast("Cleared ✅");
    renderTasks();
    return;
  }

  // subject themed color (use ACTIVE subject accent)
  const activeId = loadActiveSubject();
  const sub = getSubjectById(activeId);
  const pal = getPaletteById(sub.color);

  btnCancel.style.color = pal.a1;
  btnCancel.style.border = `2px solid ${pal.a1}55`;
  btnCancel.style.background = `${pal.a1}10`;

  btnConfirm.style.background = `linear-gradient(135deg, ${pal.a1}, ${pal.a2})`;
  btnConfirm.style.boxShadow = `0 14px 30px ${pal.a1}45`;

  sheet.classList.add("show");

  btnCancel.onclick = () => sheet.classList.remove("show");
  btnConfirm.onclick = () => {
    const tasks = loadTasks().filter(t => !t.done);
    saveTasks(tasks);
    showToast("Cleared ✅");
    renderTasks();
    sheet.classList.remove("show");
  };

  backdrop && (backdrop.onclick = () => sheet.classList.remove("show"));
}

btnClearDone?.addEventListener("click", openClearSheet);

  inpTaskName?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") createTask();
  });

// Inside Todo/todo.js

if (btnStreak) {
    btnStreak.addEventListener("click", () => {
      const s = loadStreak();
      // Use "task" streak count from localStorage if you track it, 
      // or use total done tasks if that's what you want to show.
      // Based on your code, you usually show total done tasks here:
      const count = loadTotalDone(); 
      
      // NEW: Call the popup instead of toast
      window.showStreakPopup("task", count);
    });
}


  // --------------------
  // Init
  // --------------------
  (function init() {
    applyThemeSync();

    const activeId = loadActiveSubject();
    const active = getSubjectById(activeId);
    setAccentByPalette(active.color);

    state.newTaskSubjectId = activeId;

    updateStreakIfNeeded();
    renderFilterPill();
    renderNewTaskSubject();
    renderTasks();
    openTodoRoom("profile");
  })();

  // nav highlight
  
})();