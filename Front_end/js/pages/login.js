(function () {
  if (AuthService.isLoggedIn()) {
    location.href = "dashboard.html";
    return;
  }
  const form = document.getElementById("loginForm");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = Helpers.formData(form);
    const ok = Validation.showErrors(
      form,
      Validation.validate(data, {
        username: [[Validation.required, "Vui lòng nhập tên đăng nhập"]],
        password: [[Validation.required, "Vui lòng nhập mật khẩu"]],
      }),
    );
    if (!ok) return;
    const btn = document.getElementById("loginBtn");
    btn.disabled = true;
    btn.textContent = "Đang đăng nhập...";
    try {
      await AuthService.login(data.username, data.password);
      location.href = "dashboard.html";
    } catch (err) {
      Notify.error(err.message);
      btn.disabled = false;
      btn.textContent = "Đăng nhập";
    }
  });
})();
