const BUTTON_META = {
  tab_addition:        { label: "Tab: Addition",        section: "tabs" },
  tab_subtraction:     { label: "Tab: Subtraction",     section: "tabs" },
  tab_multiplication:  { label: "Tab: Multiplication",  section: "tabs" },
  show_addition:       { label: "Show: Addition",       section: "show" },
  show_subtraction:    { label: "Show: Subtraction",    section: "show" },
  show_multiplication: { label: "Show: Multiplication", section: "show" },
};

const ALL_BUTTONS = Object.keys(BUTTON_META);

function heatColor(ratio) {
  // 0 → cool blue, 0.5 → yellow, 1 → hot red
  if (ratio <= 0) return "rgba(219,234,254,0.5)";     // blue-100
  const stops = [
    [0,    [219,234,254]],   // blue-100
    [0.25, [254,249,195]],   // yellow-100
    [0.5,  [254,215,170]],   // orange-200
    [0.75, [249,115,22]],    // orange-500
    [1,    [220,38,38]],     // red-600
  ];
  let lo = stops[0], hi = stops[stops.length - 1];
  for (let i = 0; i < stops.length - 1; i++) {
    if (ratio >= stops[i][0] && ratio <= stops[i+1][0]) {
      lo = stops[i]; hi = stops[i+1]; break;
    }
  }
  const t = (ratio - lo[0]) / (hi[0] - lo[0]);
  const r = Math.round(lo[1][0] + t * (hi[1][0] - lo[1][0]));
  const g = Math.round(lo[1][1] + t * (hi[1][1] - lo[1][1]));
  const b = Math.round(lo[1][2] + t * (hi[1][2] - lo[1][2]));
  return `rgb(${r},${g},${b})`;
}

function renderHeatmap(counts) {
  const maxCount = Math.max(1, ...Object.values(counts));

  ALL_BUTTONS.forEach(btnName => {
    const el = document.getElementById(`hmap-${btnName}`);
    if (!el) return;
    const count = counts[btnName] || 0;
    const ratio = count / maxCount;
    el.style.background = heatColor(ratio);
    el.style.borderColor = count > 0 ? heatColor(Math.min(1, ratio + 0.2)) : "";
    el.querySelector(".btn-count").textContent = count;
  });
}

async function fetchAndRender() {
  const userSelect = document.getElementById("user-select");
  const selectedUser = userSelect ? userSelect.value : "all";

  const params = new URLSearchParams();
  if (selectedUser && selectedUser !== "all") {
    params.set("users", selectedUser);
  }

  try {
    const res = await fetch(`/api/heatmap?${params}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();

    const counts = {};
    (json.data || []).forEach(d => { counts[d.button_name] = d.count; });
    renderHeatmap(counts);

    // Populate user dropdown (once)
    if (userSelect && userSelect.dataset.populated !== "1") {
      const allOpt = userSelect.querySelector('option[value="all"]');
      (json.users || []).forEach(uid => {
        const opt = document.createElement("option");
        opt.value = uid;
        opt.textContent = uid;
        userSelect.appendChild(opt);
      });
      userSelect.dataset.populated = "1";
    }
  } catch (err) {
    console.warn("[heatmap] Fetch error:", err);
    document.getElementById("heatmap-error").style.display = "block";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  requireAuth();

  // Logout
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      clearUserId();
      window.location.href = "/index.html";
    });
  }

  const userSelect = document.getElementById("user-select");
  if (userSelect) userSelect.addEventListener("change", fetchAndRender);

  const refreshBtn = document.getElementById("refresh-btn");
  if (refreshBtn) refreshBtn.addEventListener("click", fetchAndRender);

  fetchAndRender();
});
