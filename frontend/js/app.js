document.addEventListener("DOMContentLoaded", () => {
  requireAuth();

  // Show logged-in user
  const userDisplay = document.getElementById("user-display");
  if (userDisplay) userDisplay.textContent = getUserId();

  // Logout
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      clearUserId();
      window.location.href = "/index.html";
    });
  }

  // ── Active tab tracking ───────────────────────────────
  let activeTab = "addition";

  function getActiveTab() { return activeTab; }

  // ── Random number generation ──────────────────────────
  function randInt(min = 1, max = 99) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function generateNumbers(op) {
    let a = randInt();
    let b = randInt();
    if (op === "subtraction" && b > a) { const tmp = a; a = b; b = tmp; }
    document.getElementById(`num-a-${op}`).textContent = a;
    document.getElementById(`num-b-${op}`).textContent = b;
    document.getElementById(`result-${op}`).textContent = "";
    document.getElementById(`result-${op}`).classList.remove("show");
  }

  // ── Tab switching ─────────────────────────────────────
  const tabBtns = document.querySelectorAll(".tab-btn");
  const tabPanels = document.querySelectorAll(".tab-panel");

  function activateTab(op, evt) {
    activeTab = op;
    tabBtns.forEach(b => b.classList.remove("active"));
    tabPanels.forEach(p => p.classList.remove("active"));

    const btn = document.querySelector(`.tab-btn[data-tab="${op}"]`);
    const panel = document.getElementById(`panel-${op}`);
    if (btn) btn.classList.add("active");
    if (panel) panel.classList.add("active");

    generateNumbers(op);
    trackClick(`tab_${op}`, "app.html", evt, op);
  }

  tabBtns.forEach(btn => {
    btn.addEventListener("click", (e) => {
      activateTab(btn.dataset.tab, e);
    });
  });

  // ── Show result buttons ───────────────────────────────
  const ops = ["addition", "subtraction", "multiplication"];

  ops.forEach(op => {
    const showBtn = document.getElementById(`show-btn-${op}`);
    if (!showBtn) return;

    showBtn.addEventListener("click", (e) => {
      const a = parseInt(document.getElementById(`num-a-${op}`).textContent, 10);
      const b = parseInt(document.getElementById(`num-b-${op}`).textContent, 10);
      let result;
      if (op === "addition")         result = a + b;
      else if (op === "subtraction") result = a - b;
      else                           result = a * b;

      const resultEl = document.getElementById(`result-${op}`);
      resultEl.textContent = result;
      resultEl.classList.add("show");

      trackClick(`show_${op}`, "app.html", e, getActiveTab());
    });
  });

  // ── Analytics overlay toggle ──────────────────────────
  const analyticsBtn = document.getElementById("analytics-toggle-btn");
  if (analyticsBtn) {
    analyticsBtn.addEventListener("click", () => {
      const isActive = toggleOverlay();
      analyticsBtn.textContent = isActive ? "Hide Analytics" : "Analytics";
      analyticsBtn.classList.toggle("active", isActive);
    });
  }

  // ── Activate first tab on load ────────────────────────
  activateTab("addition", null);
  document.querySelector('.tab-btn[data-tab="addition"]').classList.add("active");
});
