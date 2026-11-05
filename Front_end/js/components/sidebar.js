window.Sidebar = {
  render(activeKey) {
    const el = document.getElementById("sidebar");
    if (!el) return;
    const isAdmin = AuthService.isAdmin();
    const items = APP_CONFIG.MENU.filter((m) => isAdmin || !["settings", "statistics"].includes(m.key));
    el.className = "sidebar";
    el.innerHTML = `<div class="sidebar__brand"><span>🏛️</span>${APP_CONFIG.APP_NAME}</div>` + items.map((m) => (m.section ? `<div class="sidebar__section">${m.section}</div>` : `<a class="sidebar__link ${m.key === activeKey ? "is-active" : ""}" href="${m.href}"><span>${m.icon}</span>${m.label}</a>`)).join("");
  },
  toggle() {
    document.getElementById("sidebar")?.classList.toggle("is-open");
  },
};
