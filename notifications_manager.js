// ======================================
// ZENTASK — Notification Manager (Safe)
// ======================================

(function () {

    // 1. Permission Logic
    function ensurePermissions() {
        if (!("Notification" in window)) return;

        if (Notification.permission !== "granted" && Notification.permission !== "denied") {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    console.log("🔔 Notifications enabled!");
                    new Notification("Zentask", { body: "Notifications are active! ✨" });
                }
            });
        }
    }

    // 2. Send Notification
    function send(title, body, tag) {
        if (!("Notification" in window) || Notification.permission !== "granted") return;

        try {
            // Android Chrome often requires a service worker for some features, 
            // but basic notifications work if the app is open/foreground.
            // Tag prevents stacking multiple messages
            new Notification(title, {
                body: body,
                icon: 'icon.png',
                badge: 'icon.png',
                tag: tag || 'zentask_general',
                renotify: true
            });
        } catch (e) {
            console.error("Notify failed:", e);
        }
    }

    // 3. Status Checks (Run every minute)
    function checkStatus() {
        const now = new Date();
        const hr = now.getHours();
        const min = now.getMinutes();

        const todayKey = now.toISOString().slice(0, 10);
        const last6PM = localStorage.getItem("zentask_notif_6pm");
        const last9PM = localStorage.getItem("zentask_notif_9pm");

        // --- 6 PM CHECK (If no work done) ---
        if (hr === 18 && min >= 0 && min < 15) { // Window 6:00 - 6:15 PM
            if (last6PM !== todayKey) {
                // Check if any progress today
                const logs = JSON.parse(localStorage.getItem("zentask_logs") || "[]");
                const hasWork = logs.some(l => l.date === todayKey);

                if (!hasWork) {
                    const msgs = [
                        "Keep your streak safe! 🔥 Start studying now.",
                        "Your streak is at risk! ⚠️ Don't lose it.",
                        "Protect your progress! Study now. 🛡️",
                        "Don't let your streak die today. 🛑",
                        "Streak expiring soon... ⏳ Hop in!",
                        "Are you there? 👀 Let's get some work done.",
                        "0 minutes today? You can do better! 🚀",
                        "Just 10 minutes. Don't break the chain! ⛓️",
                        "Future you is waiting. Start now. ⏳"
                    ];
                    send("Zentask", msgs[Math.floor(Math.random() * msgs.length)], 'daily_check');
                }
                localStorage.setItem("zentask_notif_6pm", todayKey);
            }
        }

        // --- 9 PM CHECK (Rating) ---
        if (hr === 21 && min >= 0 && min < 15) { // Window 9:00 - 9:15 PM
            if (last9PM !== todayKey) {
                send("Zentask", "How was your study today? Rate it! 🌟", 'daily_rate');
                localStorage.setItem("zentask_notif_9pm", todayKey);
            }
        }
    }

    // Hook into global scope
    window.ZentaskNotifications = {
        init: () => {
            ensurePermissions();
            // Check every 60 seconds
            setInterval(checkStatus, 60000);
            checkStatus(); // Check immediately on load too
        },
        send: send
    };

    // Auto-init on load
    window.addEventListener('load', () => {
        // Delay slightly
        setTimeout(() => window.ZentaskNotifications.init(), 2000);
    });

})();
