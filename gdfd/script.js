(() => {
  const SERVER_IP = "play.logver.net";

  // --- Utils ---
  const qs = (sel, root = document) => root.querySelector(sel);
  const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  function getModeLabel(mode) {
    // Normalize spaces and use title-case from dataset as source of truth.
    return String(mode || "").trim() || "Режим";
  }

  async function copyText(text) {
    // Uses Clipboard API when available.
    if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
      await navigator.clipboard.writeText(text);
      return true;
    }

    // Fallback for older browsers.
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  }

  // --- Toasts ---
  const toastWrap = qs("#toastWrap");

  function showToast(message, iconClass = "fa-solid fa-bolt") {
    if (!toastWrap) return;

    const toast = document.createElement("div");
    toast.className = "toast";
    toast.setAttribute("role", "status");

    toast.innerHTML = `
      <div class="toast__icon" aria-hidden="true"><i class="${iconClass}"></i></div>
      <div>
        <div class="toast__title">LogVer</div>
        <div class="toast__msg">${escapeHtml(message)}</div>
      </div>
    `;

    toastWrap.appendChild(toast);

    window.setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(12px)";
      toast.style.transition = "opacity 220ms ease, transform 220ms ease";
    }, 2400);

    window.setTimeout(() => toast.remove(), 2700);
  }

  function escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  // --- Copy IP ---
  async function handleCopyIP({ mode = null, showModeToast = false } = {}) {
    try {
      await copyText(SERVER_IP);
      if (showModeToast && mode) {
        // Requirement: exactly "Выбран режим: [название]".
        showToast(`Выбран режим: ${getModeLabel(mode)}`, "fa-solid fa-copy");
      } else if (mode && showModeToast === false) {
        // Not used currently, but keeps behavior consistent.
        showToast(`IP скопирован: ${SERVER_IP}`, "fa-solid fa-copy");
      } else {
        showToast(`IP скопирован: ${SERVER_IP}`, "fa-solid fa-copy");
      }
    } catch (e) {
      // Still show a friendly hint.
      showToast(`Не удалось скопировать IP автоматически. IP: ${SERVER_IP}`, "fa-solid fa-triangle-exclamation");
      // Also log for debugging.
      console.log("Copy IP failed:", e);
    }
  }

  // --- Mobile menu ---
  const burgerBtn = qs("#burgerBtn");
  const mobileMenu = qs("#mobileMenu");
  function setMobileMenu(open) {
    if (!burgerBtn || !mobileMenu) return;
    burgerBtn.setAttribute("data-open", open ? "true" : "false");
    burgerBtn.setAttribute("aria-expanded", open ? "true" : "false");
    mobileMenu.hidden = !open;
  }

  if (burgerBtn && mobileMenu) {
    burgerBtn.addEventListener("click", () => {
      const open = burgerBtn.getAttribute("aria-expanded") !== "true";
      setMobileMenu(open);
    });

    // Close menu when clicking a nav link inside.
    qsa("[data-nav]", mobileMenu).forEach((link) => {
      link.addEventListener("click", () => setMobileMenu(false));
    });
  }

  // --- Smooth nav (single-page, no reload) ---
  function scrollToSection(sectionId) {
    const el = qs(`#${CSS.escape(sectionId)}`);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  qsa("[data-nav]").forEach((link) => {
    link.addEventListener("click", (e) => {
      const href = link.getAttribute("href") || "";
      if (!href.startsWith("#")) return;
      e.preventDefault();

      const id = href.slice(1);
      scrollToSection(id);
      setMobileMenu(false);
    });
  });

  // --- Hero buttons ---
  const heroScrollBtn = qsa("[data-action='scroll-to-games']");
  heroScrollBtn.forEach((btn) => {
    btn.addEventListener("click", () => scrollToSection("games"));
  });

  qsa("[data-action='copy-ip']").forEach((btn) => {
    btn.addEventListener("click", () => handleCopyIP());
  });

  // --- Games cards/buttons ---
  // Card hover scaling already exists in CSS; ensure click works.
  qsa(".gameCard").forEach((card) => {
    const mode = card.dataset.mode;
    const btn = qs("[data-action='play']", card);

    const onActivate = async () => {
      await handleCopyIP({ mode, showModeToast: true });
    };

    // Click on card itself.
    card.addEventListener("click", (e) => {
      // Avoid double-trigger when button inside clicked.
      if (e.target && e.target.closest && e.target.closest("[data-action='play']")) return;
      onActivate();
    });

    // Keyboard accessibility.
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onActivate();
      }
    });

    if (btn) {
      btn.addEventListener("click", async () => {
        await handleCopyIP({ mode, showModeToast: true });
      });
    }
  });

  // --- Leaderboard tabs ---
  const leaderModeLabel = qs("#leaderModeLabel");
  const leaderTbody = qs("#leaderTbody");
  const tabs = qsa("[data-leader-tab]");

  const leaderboardData = {
    BedWars: [
      { name: "Player1", kills: 1840 },
      { name: "Player2", kills: 1625 },
      { name: "Player3", kills: 1498 },
      { name: "Player4", kills: 1372 },
      { name: "Player5", kills: 1216 },
    ],
    SkyWars: [
      { name: "Player1", kills: 1710 },
      { name: "Player2", kills: 1583 },
      { name: "Player3", kills: 1464 },
      { name: "Player4", kills: 1330 },
      { name: "Player5", kills: 1194 },
    ],
    "Murder Mystery": [
      { name: "Player1", kills: 2105 },
      { name: "Player2", kills: 1962 },
      { name: "Player3", kills: 1788 },
      { name: "Player4", kills: 1654 },
      { name: "Player5", kills: 1511 },
    ],
    SkyPVP: [
      { name: "Player1", kills: 2320 },
      { name: "Player2", kills: 2196 },
      { name: "Player3", kills: 2055 },
      { name: "Player4", kills: 1882 },
      { name: "Player5", kills: 1734 },
    ],
  };

  function setActiveTab(mode) {
    tabs.forEach((t) => {
      const isActive = t.dataset.leaderTab === mode;
      t.classList.toggle("tab--active", isActive);
      t.setAttribute("aria-selected", String(isActive));
    });

    if (leaderModeLabel) leaderModeLabel.textContent = mode;
  }

  function renderLeaderboard(mode) {
    if (!leaderTbody) return;
    const rows = leaderboardData[mode] || [];

    leaderTbody.innerHTML = "";
    rows.forEach((row, idx) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td class="tdRank">${idx + 1}</td>
        <td>${escapeHtml(row.name)}</td>
        <td class="tdKills">${escapeHtml(row.kills)}</td>
      `;
      leaderTbody.appendChild(tr);
    });
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", async () => {
      const mode = tab.dataset.leaderTab;
      setActiveTab(mode);
      renderLeaderboard(mode);
      showToast(`Таблица лидеров: ${mode}`, "fa-solid fa-ranking-star");
    });
  });

  // Init leaderboard.
  const initialMode = "BedWars";
  setActiveTab(initialMode);
  renderLeaderboard(initialMode);

  // --- Generic notify buttons ---
  // Any button with `data-action="notify"` and `data-notify="..."` will show a toast.
  qsa("[data-action='notify']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const msg = btn.dataset.notify || "Событие";
      showToast(msg, "fa-solid fa-bell");
    });
  });

  // Donate stub
  qsa("[data-action='donate-info']").forEach((btn) => {
    btn.addEventListener("click", () => {
      showToast("Магазин в разработке", "fa-solid fa-store");
    });
  });

  // --- Preloader ---
  function hidePreloader() {
    const preloader = qs("#preloader");
    if (!preloader) return;
    preloader.classList.add("is-hidden");
    // Remove after animation so it doesn't block clicks.
    window.setTimeout(() => {
      preloader.remove();
    }, 520);
  }

  window.addEventListener("load", hidePreloader);

  // --- Misc: year ---
  const yearEl = qs("#year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();

