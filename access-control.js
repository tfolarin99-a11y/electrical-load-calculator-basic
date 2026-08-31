// ── ACCESS CONTROL — ElectraSuite Basic Edition ───────────────────
// Centralised plan configuration. Change CURRENT_PLAN here to switch tiers.
const CURRENT_PLAN = "basic";

const PLAN_ACCESS = {
  basic: {
    allowed: ["projects", "load", "demand", "current"]
  },
  standard: {
    allowed: ["projects", "load", "demand", "current",
              "cable", "voltdrop", "breaker", "generator", "inverter", "transformer"]
  },
  pro: {
    allowed: ["projects", "load", "demand", "current",
              "cable", "voltdrop", "breaker", "generator", "inverter", "transformer",
              "bom", "phasebal", "carbon", "utility", "report"]
  }
};

// Maps tab index → module key
const TAB_MODULE_MAP = {
  0: "projects",
  1: "load",
  2: "demand",
  3: "current",
  4: "cable",
  5: "voltdrop",
  6: "breaker",
  7: "generator",
  8: "inverter",
  9: "transformer",
  10: "bom",
  11: "phasebal",
  12: "carbon",
  13: "utility",
  14: "report"
};

/**
 * Check whether the current plan grants access to a module.
 * This is the single source of truth — all navigation must call this.
 */
function canAccess(moduleKey) {
  const plan = PLAN_ACCESS[CURRENT_PLAN];
  if (!plan) return false;
  return plan.allowed.indexOf(moduleKey) !== -1;
}

/**
 * Tab navigation with access gate.
 * Replaces the original T() for all tab clicks.
 */
function accessTab(n, moduleKey) {
  // Always derive the module key from the map if caller passes index only
  const key = moduleKey || TAB_MODULE_MAP[n] || "";

  if (!canAccess(key)) {
    showUpgradeModal();
    return; // Do NOT switch panels or update URL state
  }

  // Perform the legitimate tab switch
  T(n);

  // Fire any panel-specific init functions for allowed tabs
  if (n === 2) cD();
  if (n === 3) uCC();
}

// ── UPGRADE MODAL ─────────────────────────────────────────────────
function showUpgradeModal() {
  var modal = document.getElementById("upgradeModal");
  if (modal) {
    modal.style.display = "flex";
    document.body.style.overflow = "hidden";
    // Trap focus inside modal
    setTimeout(function() {
      var btn = modal.querySelector(".upgrade-btn-primary");
      if (btn) btn.focus();
    }, 50);
  }
}

function closeUpgradeModal(evt) {
  // If called from overlay click, only close when clicking the backdrop itself
  if (evt && evt.target !== document.getElementById("upgradeModal")) return;
  var modal = document.getElementById("upgradeModal");
  if (modal) {
    modal.style.display = "none";
    document.body.style.overflow = "";
  }
}

function handleUpgradeStandard() {
  // Existing Basic customers pay only the difference to move to Standard
  window.open("https://taewoodigital.com/product/powerdesk-upgrade-basic-standard/", "_blank", "noopener,noreferrer");
}

function handleUpgradePro() {
  // Existing Basic customers pay only the difference to move to Pro
  window.open("https://taewoodigital.com/product/powerdesk-upgrade-basic-%E2%86%92-pro/", "_blank", "noopener,noreferrer");
}

// Close modal on Escape key
document.addEventListener("keydown", function(e) {
  if (e.key === "Escape") closeUpgradeModal();
});

// ── HASH / URL MANIPULATION GUARD ────────────────────────────────
// Prevent users from bypassing access via URL hash changes
window.addEventListener("hashchange", function() {
  // Strip any hash the user might inject
  if (window.location.hash) {
    history.replaceState(null, "", window.location.pathname);
  }
});

// On load, ensure we start at the first allowed tab
window.addEventListener("DOMContentLoaded", function() {
  // Force panel 0 active regardless of any URL state
  T(0);
});
