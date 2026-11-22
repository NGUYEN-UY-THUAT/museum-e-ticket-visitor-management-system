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
  if (!API_CONFIG.USE_MOCK) document.getElementById("demoHint").remove();

  // Đã đăng nhập rồi thì vào thẳng trang vé
  if (CustomerService.isLoggedIn()) location.replace(Helpers.routeUrl("MY_TICKETS"));

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = { account: form.account.value.trim(), password: form.password.value };
    const errors = Validation.validate(data, {
      account: [
        [Validation.required, "Vui lòng nhập email hoặc số điện thoại"],
        [(v) => Validation.email(v) || Validation.phone(v), "Email hoặc số điện thoại không hợp lệ"],
      ],
      password: [[Validation.required, "Vui lòng nhập mật khẩu"]],
    });
    if (!Validation.showFieldErrors(form, errors)) return;

    Helpers.withBusy(btn, async () => {
      try {
        const c = await CustomerService.login(data.account, data.password);
        Notify.success("Xin chào " + c.full_name + "!");
        // Quay lại trang trước khi bị yêu cầu đăng nhập (chỉ cho phép trang nội bộ)
        const next = Helpers.param("next");
        setTimeout(() => (location.href = /^[\w-]+\.html(\?.*)?$/.test(next) ? next : Helpers.routeUrl("MY_TICKETS")), 500);
      } catch (err) {
        Validation.showFieldErrors(form, { password: err.message });
      }
    });
  });
})();
