async function trackClick(buttonName, page, event) {
  const userId = getUserId();
  if (!userId) return;

  const payload = {
    user_id: userId,
    button_name: buttonName,
    page: page,
    x: event ? Math.round(event.clientX) : 0,
    y: event ? Math.round(event.clientY) : 0,
    timestamp: new Date().toISOString(),
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
