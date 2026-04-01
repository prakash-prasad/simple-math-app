// Generate a session ID once per page load
const SESSION_ID = (() => {
  try {
    return crypto.randomUUID();
  } catch (_) {
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
  }
})();

/**
 * @param {string} buttonName  - one of the 6 tracked button names
 * @param {string} page        - page filename, e.g. "app.html"
 * @param {MouseEvent|null} event - original click event (for coordinates)
 * @param {string|null} tabId  - currently active tab ("addition" | "subtraction" | "multiplication")
 */
async function trackClick(buttonName, page, event, tabId = null) {
  const userId = getUserId();
  if (!userId) return;

  const payload = {
    user_id: userId,
    button_name: buttonName,
    page: page,
    x: event ? Math.round(event.clientX) : 0,
    y: event ? Math.round(event.clientY) : 0,
    timestamp: new Date().toISOString(),
    tab_id: tabId,
    session_id: SESSION_ID,
    viewport_width: window.innerWidth,
    viewport_height: window.innerHeight,
  };

  try {
    await fetch("/api/clicks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.warn("[tracker] Failed to record click:", err);
  }
}
