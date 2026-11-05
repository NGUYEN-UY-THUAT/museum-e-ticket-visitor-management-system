window.Navbar = {
  render(title) {
    const el = document.getElementById("navbar");
    if (!el) return;
    const u = AuthService.user() || { full_name: "Khách", role: "" };
    el.className = "navbar";
    el.innerHTML = `
      <div style="display:flex;align-items:center;gap:12px">
        <button class="navbar__toggle" id="sidebarToggle" aria-label="Menu">☰</button>
        <span class="navbar__title">${Format.escape(title)}</span>
      </div>
      <div class="navbar__right">
        <a class="btn btn--outline btn--sm" href="../index.html" target="_blank">Trang khách</a>
        <div class="navbar__user">
          <div class="navbar__avatar">${Format.escape(u.full_name.charAt(0))}</div>
          <div><div>${Format.escape(u.full_name)}</div><div class="text-small text-muted">${u.role === "admin" ? "Quản trị" : "Cán bộ vận hành"}</div></div>
        </div>
        <button class="btn btn--outline btn--sm" id="logoutBtn">Đăng xuất</button>
      </div>`;
    el.querySelector("#sidebarToggle").onclick = () => Sidebar.toggle();
    el.querySelector("#logoutBtn").onclick = () => AuthService.logout();
  },
};
/** Khởi tạo khung trang quản trị: kiểm tra đăng nhập + vẽ sidebar, navbar */
window.initLayout = function (key, title, adminOnly = false) {
  if (!AuthService.requireAuth(adminOnly)) return false;
  Sidebar.render(key);
  Navbar.render(title);
  return true;
};
