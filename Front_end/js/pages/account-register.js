/* account-register.js — Đăng ký tài khoản khách (pages/account-register.html) */
PublicNavbar.render();
SiteFooter.render();

(function () {
  const form = document.getElementById("registerForm");
  const btn = document.getElementById("registerBtn");
  Helpers.bindPasswordToggles();

  // Đăng nhập / đăng ký nhanh bằng Google (js/components/google-login.js)
  GoogleLogin.bind(document.getElementById("googleBtn"), (c) => {
    Notify.success("Xin chào " + c.full_name + "!");
    setTimeout(() => (location.href = Helpers.routeUrl("MY_TICKETS")), 500);
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = {
      full_name: form.full_name.value.trim(),
      email: form.email.value.trim(),
      phone: form.phone.value.trim(),
      password: form.password.value,
      confirm: form.confirm.value,
      agree: form.agree.checked,
    };
    const errors = Validation.validate(data, {
      full_name: [[(v) => v.length >= 2, "Vui lòng nhập họ tên"]],
      email: [[Validation.required, "Vui lòng nhập email"], [Validation.email, "Email không hợp lệ"]],
      phone: [[Validation.required, "Vui lòng nhập số điện thoại"], [Validation.phone, "Số điện thoại không hợp lệ (10 số, bắt đầu bằng 0)"]],
      password: [[Validation.password, "Mật khẩu tối thiểu 6 ký tự"]],
      confirm: [[(v) => v === data.password, "Mật khẩu nhập lại không khớp"]],
      agree: [[(v) => v === true, "Bạn cần đồng ý với điều khoản để tiếp tục"]],
    });
    if (!Validation.showFieldErrors(form, errors)) return;

    Helpers.withBusy(btn, async () => {
      try {
        await CustomerService.register({ ...data, newsletter: form.newsletter.checked });
        Notify.success("Tạo tài khoản thành công!");
        setTimeout(() => (location.href = Helpers.routeUrl("MY_TICKETS")), 600);
      } catch (err) {
        const field = /điện thoại/i.test(err.message) ? "phone" : "email";
        Validation.showFieldErrors(form, { [field]: err.message });
      }
    });
  });
})();
