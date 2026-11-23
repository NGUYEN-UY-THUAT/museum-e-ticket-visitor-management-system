/* Khung trang quản trị kiểu mới (menu trái + thanh trên), dùng cho các trang quản trị giao diện Heritage.
   Dùng: <aside id="adminSidebar"></aside> ... <header id="adminTopbar"></header>
         const me = AdminShell.init("orders", { title: "Đơn hàng & Hoàn tiền" }); if (!me) return;
   Chỉ tài khoản cán bộ (admin / staff) đã đăng nhập mới vào được; mục adminOnly chỉ quản trị viên thấy. */
window.AdminShell = (function () {
  const esc = (s) => Format.escape(s);
  const initials = (name) => String(name || "?").trim().split(/\s+/).slice(-2).map((w) => w[0]).join("").toUpperCase();

  function sidebar(key, user) {
    const isAdmin = user.role === APP_CONFIG.ROLES.ADMIN;
    const items = APP_CONFIG.ADMIN_MENU.filter((m) => m.section || isAdmin || !m.adminOnly);
    // bỏ tiêu đề nhóm không còn mục nào
    const visible = items.filter((m, i) => !m.section || (items[i + 1] && !items[i + 1].section));
    return `
      <div class="adm-brand">
        <span class="adm-brand__logo"><span class="material-symbols-outlined">account_balance</span></span>
        <span><span class="adm-brand__name">${esc(APP_CONFIG.SITE_NAME)}</span><span class="adm-brand__sub">Quản trị Cổng Vé</span></span>
      </div>
      <nav class="adm-nav">
        ${visible
          .map((m) =>
            m.section
              ? `<p class="adm-nav__section">${esc(m.section)}</p>`
              : `<a class="adm-nav__link${m.key === key ? " is-active" : ""}" href="${m.href}"${m.key === key ? ' aria-current="page"' : ""}><span class="material-symbols-outlined">${m.icon}</span><span>${esc(m.label)}</span></a>`
          )
          .join("")}
      </nav>
      <div class="adm-user">
        <span class="adm-avatar adm-avatar--gold">${esc(initials(user.full_name))}</span>
        <span class="adm-user__text"><span class="adm-user__name">${esc(user.full_name)}</span><span class="adm-user__role">${esc(APP_CONFIG.ROLE_LABELS[user.role] || user.role)}</span></span>
        <button class="adm-user__logout" id="admLogout" type="button" title="Đăng xuất" aria-label="Đăng xuất"><span class="material-symbols-outlined">logout</span></button>
      </div>`;
  }

  function topbar(title) {
    return `
      <button class="adm-burger" id="admBurger" type="button" aria-label="Mở menu"><span class="material-symbols-outlined">menu</span></button>
      <nav class="adm-crumb" aria-label="Breadcrumb">
        <a href="${APP_CONFIG.ADMIN_HOME}">Quản trị</a><span class="material-symbols-outlined">chevron_right</span><span>${esc(title)}</span>
      </nav>
      <a class="hh-btn hh-btn--ghost hh-btn--sm adm-topbar__site" href="../index.html" target="_blank" rel="noopener"><span class="material-symbols-outlined">open_in_new</span><span>Xem trang khách</span></a>`;
  }

  return {
    initials,
    /** Kiểm tra quyền + vẽ khung. Trả về người dùng hiện tại, hoặc null nếu đã chuyển hướng. */
    init(key, { title = "", adminOnly } = {}) {
      const item = APP_CONFIG.ADMIN_MENU.find((m) => m.key === key);
      const needAdmin = adminOnly ?? !!item?.adminOnly;
      if (!AuthService.requireAuth(needAdmin)) return null;
      const user = AuthService.user();
      const side = document.getElementById("adminSidebar");
      const top = document.getElementById("adminTopbar");
      side.innerHTML = sidebar(key, user);
      top.innerHTML = topbar(title || item?.label || "");
      document.title = `${title || item?.label} | Quản trị ${APP_CONFIG.SITE_NAME}`;

      const backdrop = document.createElement("div");
      backdrop.className = "adm-backdrop";
      document.body.appendChild(backdrop);
      const setOpen = (open) => document.body.classList.toggle("adm-menu-open", open);
      top.querySelector("#admBurger").addEventListener("click", () => setOpen(true));
      backdrop.addEventListener("click", () => setOpen(false));
      side.querySelector("#admLogout").addEventListener("click", () => AuthService.logout());
      return user;
    },
  };
})();
