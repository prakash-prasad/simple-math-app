// Maps button_name → DOM selector
const BUTTON_MAP = {
  tab_addition:        '.tab-btn[data-tab="addition"]',
  tab_subtraction:     '.tab-btn[data-tab="subtraction"]',
  tab_multiplication:  '.tab-btn[data-tab="multiplication"]',
  show_addition:       '#show-btn-addition',
  show_subtraction:    '#show-btn-subtraction',
  show_multiplication: '#show-btn-multiplication',
};

const SHOW_BUTTONS = ["show_addition", "show_subtraction", "show_multiplication"];

let overlayActive = false;

function heatColor(ratio) {
  if (ratio <= 0) return "rgba(191,219,254,0.35)"; // blue-200, faint
  const stops = [
    [0,    [191, 219, 254]],  // blue-200
    [0.25, [253, 230, 138]],  // yellow-200
    [0.5,  [253, 186, 116]],  // orange-300
    [0.75, [249, 115,  22]],  // orange-500
    [1,    [220,  38,  38]],  // red-600
  ];
  let lo = stops[0], hi = stops[stops.length - 1];
  for (let i = 0; i < stops.length - 1; i++) {
    if (ratio >= stops[i][0] && ratio <= stops[i + 1][0]) {
      lo = stops[i]; hi = stops[i + 1]; break;
    }
  }
  const t = hi[0] === lo[0] ? 0 : (ratio - lo[0]) / (hi[0] - lo[0]);
  const r = Math.round(lo[1][0] + t * (hi[1][0] - lo[1][0]));
  const g = Math.round(lo[1][1] + t * (hi[1][1] - lo[1][1]));
  const b = Math.round(lo[1][2] + t * (hi[1][2] - lo[1][2]));
  return `rgba(${r},${g},${b},0.72)`;
}

function applyHeat(counts) {
  const values = Object.values(counts);
  const maxCount = Math.max(1, ...values);

  // Tint tab buttons and show-result buttons
  Object.entries(BUTTON_MAP).forEach(([btnName, selector]) => {
    const el = document.querySelector(selector);
    if (!el) return;
    const count = counts[btnName] || 0;
    const ratio = count / maxCount;
    el.style.backgroundColor = heatColor(ratio);
    el.style.borderColor = count > 0 ? heatColor(Math.min(1, ratio + 0.15)) : "";

    // Inject badge
    removeBadge(el);
    const badge = document.createElement("span");
    badge.className = "heat-badge";
    badge.textContent = count;
    el.appendChild(badge);
  });

  // Update show-result summary line in overlay bar
  const summaryEl = document.getElementById("overlay-show-counts");
  if (summaryEl) {
    const parts = SHOW_BUTTONS.map(b => {
      const label = b.replace("show_", "");
      return `${label.charAt(0).toUpperCase() + label.slice(1)}: <span>${counts[b] || 0}</span>`;
    });
    summaryEl.innerHTML = "Show Result — " + parts.join(" &nbsp;|&nbsp; ");
  }
}

function removeBadge(el) {
  const existing = el.querySelector(".heat-badge");
  if (existing) existing.remove();
}

function clearHeat() {
  Object.values(BUTTON_MAP).forEach(selector => {
    const el = document.querySelector(selector);
    if (!el) return;
    el.style.backgroundColor = "";
    el.style.borderColor = "";
    removeBadge(el);
  });
  const summaryEl = document.getElementById("overlay-show-counts");
  if (summaryEl) summaryEl.innerHTML = "";
}

async function fetchOverlayData() {
  const select = document.getElementById("overlay-user-select");
  const selectedUser = select ? select.value : "all";

  const params = new URLSearchParams();
  if (selectedUser && selectedUser !== "all") {
    params.set("users", selectedUser);
  }

  try {
    const res = await fetch(`/api/heatmap?${params}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();

    // Populate user dropdown once
    if (select && select.dataset.populated !== "1") {
      (json.users || []).forEach(uid => {
        const opt = document.createElement("option");
        opt.value = uid;
        opt.textContent = uid;
        select.appendChild(opt);
      });
      select.dataset.populated = "1";
    }

    const counts = {};
    (json.data || []).forEach(d => { counts[d.button_name] = d.count; });
    applyHeat(counts);
  } catch (err) {
    console.warn("[overlay] Failed to fetch heatmap data:", err);
  }
}

function showControls() {
  const bar = document.getElementById("overlay-controls");
  if (bar) bar.style.display = "flex";
}

function hideControls() {
  const bar = document.getElementById("overlay-controls");
  if (bar) bar.style.display = "none";
}

/**
 * Toggle the overlay on/off.
 * @returns {boolean} true if overlay is now active
 */
function toggleOverlay() {
  overlayActive = !overlayActive;
  if (overlayActive) {
    showControls();
    fetchOverlayData();
  } else {
    hideControls();
    clearHeat();
  }
  return overlayActive;
}

// Wire up controls once DOM is ready (overlay.js is loaded after app.js)
document.addEventListener("DOMContentLoaded", () => {
  const refreshBtn = document.getElementById("overlay-refresh-btn");
  if (refreshBtn) {
    refreshBtn.addEventListener("click", () => {
      if (overlayActive) fetchOverlayData();
    });
  }

  const userSelect = document.getElementById("overlay-user-select");
  if (userSelect) {
    userSelect.addEventListener("change", () => {
      if (overlayActive) fetchOverlayData();
    });
  }
});
