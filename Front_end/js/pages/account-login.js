/* account-login.js — Đăng nhập tài khoản khách (pages/account-login.html) */
PublicNavbar.render();
SiteFooter.render();

(function () {
  const form = document.getElementById("loginForm");
  const btn = document.getElementById("loginBtn");
  Helpers.bindPasswordToggles();

  // Đăng nhập / đăng ký nhanh bằng Google (js/components/google-login.js)
  GoogleLogin.bind(document.getElementById("googleBtn"), (c) => {
    Notify.success("Xin chào " + c.full_name + "!");
    setTimeout(() => (location.href = Helpers.routeUrl("MY_TICKETS")), 500);
  });

  // Đã đăng nhập rồi: cán bộ vào trang quản trị, khách vào trang vé
  if (AuthService.isLoggedIn()) location.replace(APP_CONFIG.ADMIN_HOME);
  else if (CustomerService.isLoggedIn()) location.replace(Helpers.routeUrl("MY_TICKETS"));

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = { account: form.account.value.trim(), password: form.password.value };
    const errors = Validation.validate(data, {
      account: [
        [Validation.required, "Vui lòng nhập email hoặc số điện thoại"],
      ],
      password: [[Validation.required, "Vui lòng nhập mật khẩu"]],
    });
    if (!Validation.showFieldErrors(form, errors)) return;

    Helpers.withBusy(btn, async () => {
      // 1) Tài khoản khách (email / số điện thoại)
      const isContact = Validation.email(data.account) || Validation.phone(data.account);
      if (isContact) {
        try {
          const c = await CustomerService.login(data.account, data.password);
          Notify.success("Xin chào " + c.full_name + "!");
          // Quay lại trang trước khi bị yêu cầu đăng nhập (chỉ cho phép trang nội bộ)
          const next = Helpers.param("next");
          setTimeout(() => (location.href = /^[\w-]+\.html(\?.*)?$/.test(next) ? next : Helpers.routeUrl("MY_TICKETS")), 500);
          return;
        } catch {
          /* thử tiếp tài khoản cán bộ */
        }
      }
      // 2) Tài khoản cán bộ (tên đăng nhập hoặc email công vụ) -> chuyển sang trang quản trị
      try {
        const u = await AuthService.login(data.account, data.password);
        Notify.success("Xin chào " + u.full_name + "!");
        setTimeout(() => (location.href = APP_CONFIG.ADMIN_HOME), 500);
      } catch (err) {
        const locked = /khóa/.test(err.message);
        Validation.showFieldErrors(form, { password: locked ? err.message : "Sai tài khoản hoặc mật khẩu" });
      }
    });
  });
})();
