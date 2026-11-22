/* Thanh điều hướng của trang khách tham quan.
   Dùng: <header id="publicNavbar"></header> + PublicNavbar.render(); menu đang chọn lấy từ <body data-page>.
   (Khác js/components/navbar.js là thanh trên của trang quản trị.) */
window.PublicNavbar = (function () {
  const esc = s => Format.escape(s);
  const url = (k, p) => Helpers.routeUrl(k, p);

  function links(active) {
    return APP_CONFIG.PUBLIC_NAV.map(i =>
      `<a class="topbar__link${i.key === active ? " is-active" : ""}" href="${url(i.route)}"${i.key === active ? ' aria-current="page"' : ""}>${esc(i.label)}</a>`
    ).join("");
  }

  /** Menu tài khoản: khách chưa đăng nhập thấy lối tắt; cán bộ đã đăng nhập thấy nút vào trang quản trị */
  function userMenu() {
    const staff = AuthService.isLoggedIn() ? AuthService.user() : null;
    const customer = !staff && window.CustomerService && CustomerService.isLoggedIn() ? CustomerService.current() : null;
    const item = (icon, label, href, extra = "") => `<a class="user-menu__item${extra}" href="${href}"><span class="icon icon--18">${icon}</span><span>${label}</span></a>`;
    const logoutBtn = `<button class="user-menu__item user-menu__item--danger" id="publicLogoutBtn" type="button" style="width:100%"><span class="icon icon--18">logout</span><span>Đăng xuất</span></button>`;
    let items, footer;
    if (staff) {
      // Cán bộ đang đăng nhập: lối tắt vào trang quản trị
      items = item("dashboard", "Trang quản trị", url("DASHBOARD")) + item("qr_code_scanner", "Soát vé / Check-in", url("CHECKIN"));
      footer = logoutBtn;
    } else if (customer) {
      // Khách đã đăng nhập
      items =
        item("confirmation_number", "Vé của tôi", url("MY_TICKETS")) + item("receipt_long", "Lịch sử đơn hàng", url("PROFILE", { tab: "orders" })) +
        item("manage_accounts", "Hồ sơ cá nhân", url("PROFILE")) + item("edit_calendar", "Đổi giờ / Hủy vé", url("TICKET_CHANGE")) +
        item("rate_review", "Khảo sát ý kiến", url("SURVEY"));
      footer = logoutBtn;
    } else {
      // Khách chưa đăng nhập
      items =
        item("login", "Đăng nhập", url("ACCOUNT_LOGIN")) + item("person_add", "Tạo tài khoản", url("ACCOUNT_REGISTER")) +
        item("search", "Tra cứu vé", url("TICKET_LOOKUP")) + item("support_agent", "Liên hệ hỗ trợ", url("CONTACT"));
      footer = item("badge", "Cán bộ đăng nhập", url("LOGIN"));
    }
    const who = staff || customer;
    const headTitle = staff ? "Cán bộ đang đăng nhập" : customer ? "Đang đăng nhập" : "Khách tham quan";
    const headSub = staff ? esc(staff.username) : customer ? esc(customer.email) : "Chưa đăng nhập";

    return `
      <div class="user-menu" id="userMenu">
        <button class="user-menu__toggle" id="userMenuBtn" type="button" aria-haspopup="true" aria-expanded="false">
          <span class="user-menu__avatar"><span class="icon icon--18">person</span></span>
          <span class="user-menu__label">${who ? esc(who.full_name) : "Tài khoản"}</span>
          <span class="icon icon--18 user-menu__caret">expand_more</span>
        </button>
        <div class="user-menu__dropdown" role="menu">
          <div class="user-menu__header">
            <p class="text-label-sm text-muted">${headTitle}</p>
            <p class="user-menu__email truncate">${headSub}</p>
          </div>
          ${items}
          <div class="user-menu__divider"></div>
          ${footer}
        </div>
      </div>`;
  }

  function bind(root) {
    const bar = root.querySelector(".topbar");
    const menu = root.querySelector("#userMenu");
    const btn = root.querySelector("#userMenuBtn");
    const setOpen = open => { menu.classList.toggle("is-open", open); btn.setAttribute("aria-expanded", String(open)); };
    btn.addEventListener("click", e => { e.stopPropagation(); setOpen(!menu.classList.contains("is-open")); });
    document.addEventListener("click", e => { if (!menu.contains(e.target)) setOpen(false); });
    document.addEventListener("keydown", e => { if (e.key === "Escape") setOpen(false); });
    root.querySelector("#topbarBurger").addEventListener("click", () => bar.classList.toggle("is-mobile-open"));
    root.querySelectorAll(".topbar__mobile a").forEach(a => a.addEventListener("click", () => bar.classList.remove("is-mobile-open")));
    const logout = root.querySelector("#publicLogoutBtn");
    if (logout) logout.addEventListener("click", () => (AuthService.isLoggedIn() ? AuthService.logout() : CustomerService.logout()));
  }

  return {
    render(containerId = "publicNavbar") {
      const el = document.getElementById(containerId);
      if (!el) return;
      const active = document.body.dataset.page;
      el.innerHTML = `
        <nav class="topbar">
          <div class="container topbar__inner">
            <a class="brand" href="${url("HOME")}">
              <span class="brand__logo"><span class="icon icon--24">museum</span></span>
              <span class="brand__text">
                <span class="brand__name">${esc(APP_CONFIG.SITE_NAME)}</span>
                <span class="brand__tagline">${esc(APP_CONFIG.SITE_TAGLINE)}</span>
              </span>
            </a>
            <div class="topbar__menu">${links(active)}</div>
            <div class="topbar__actions">
              ${userMenu()}
              <a class="btn btn--primary topbar__cta" href="${url("BOOKING")}"><span class="icon icon--18 icon--accent">local_activity</span><span>Đặt vé ngay</span></a>
              <button class="topbar__burger" id="topbarBurger" type="button" aria-label="Mở menu"><span class="icon">menu</span></button>
            </div>
          </div>
          <div class="topbar__mobile">
            ${links(active)}
            <a class="btn btn--primary" href="${url("BOOKING")}"><span class="icon icon--18 icon--accent">local_activity</span><span>Đặt vé ngay</span></a>
          </div>
        </nav>`;
      bind(el);
    }
  };
})();
