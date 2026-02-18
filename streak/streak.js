// ==========================================
// GLOBAL STREAK POPUP CONTROLLER
// ==========================================

const quotes = [
  "“Small progress is still progress.”",
  "“Discipline is your superpower.”",
  "“You didn’t quit. That’s the flex.”",
  "“Consistency beats motivation.”",
  "“Your future self is proud of you.”",
  "“Tiny wins build huge results.”",
  "“One more day stronger. Keep going.”",
  "“This is how champions are made.”",
  "“You’re doing way better than you think.”",
];

function randomQuote() {
  return quotes[Math.floor(Math.random() * quotes.length)];
}

// Global function to open the popup
window.showStreakPopup = function(type, count) {
  const popup = document.getElementById("streakPopup");
  if (!popup) return;

  // Elements
  const elTitle = document.getElementById("streakTitle");
  const elSub = document.getElementById("streakSub");
  const elNum = document.getElementById("streakNumber");
  const elLabel = document.getElementById("streakLabel");
  const elQuote = document.getElementById("streakQuote");
  const elIcon = document.getElementById("streakIconSpan");

  // 1. Configure Content based on Type
  elQuote.textContent = randomQuote();
  elNum.textContent = count;

  if (type === "day") {
    elTitle.textContent = "Daily Streak 🔥";
    elSub.textContent = "You stayed consistent today.";
    elLabel.textContent = "day streak";
    elIcon.innerHTML = "<span>🔥</span>";
  } else {
    elTitle.textContent = "Task Streak ⚔️";
    elSub.textContent = "You are crushing your tasks!";
    elLabel.textContent = count === 1 ? "task done" : "tasks done";
    elIcon.innerHTML = "<span>🔥</span>";
  }

  // 2. Show Animation
  popup.classList.remove("hidden");
  popup.setAttribute("aria-hidden", "false");
  
  // Force browser reflow to trigger CSS transition
  void popup.offsetWidth; 
  
  popup.classList.add("show");

  // 3. Auto-close timer setup
  if (window.streakTimer) clearTimeout(window.streakTimer);
  window.streakTimer = setTimeout(() => {
     window.hideStreakPopup();
  }, 5000);
};

// Global function to close
window.hideStreakPopup = function() {
  const popup = document.getElementById("streakPopup");
  if (!popup) return;

  popup.classList.remove("show");
  setTimeout(() => {
    popup.classList.add("hidden");
    popup.setAttribute("aria-hidden", "true");
  }, 250); // Matches CSS transition
};

// Close on click
document.addEventListener("DOMContentLoaded", () => {
  const popup = document.getElementById("streakPopup");
  if (popup) {
    popup.addEventListener("click", window.hideStreakPopup);
  }
});
