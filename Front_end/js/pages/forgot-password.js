/* forgot-password.js — Quên mật khẩu 3 bước: email → mã OTP + mật khẩu mới → hoàn tất */
PublicNavbar.render();
SiteFooter.render();

(function () {
  const $ = (id) => document.getElementById(id);
  const emailForm = $("emailForm");
  const resetForm = $("resetForm");
  let email = "";
  Helpers.bindPasswordToggles();

  function goStep(n) {
    document.querySelectorAll("#steps .hh-step").forEach((s) => {
      const k = Number(s.dataset.step);
      s.classList.toggle("is-active", k === n);
      s.classList.toggle("is-done", k < n);
    });
    emailForm.classList.toggle("hidden", n !== 1);
    resetForm.classList.toggle("hidden", n !== 2);
    $("doneBox").classList.toggle("hidden", n !== 3);
  }

  async function sendOtp() {
    const r = await CustomerService.requestReset(email);
    // Khi chạy mock không có email thật nên hiện mã để thử
    if (r && r.demo_otp) Notify.show("Mã xác nhận (chạy thử): " + r.demo_otp, "info", 10000);
    else Notify.success("Đã gửi mã xác nhận tới email của bạn");
  }

  emailForm.addEventListener("submit", (e) => {
    e.preventDefault();
    email = emailForm.email.value.trim();
    const errors = Validation.validate({ email }, { email: [[Validation.required, "Vui lòng nhập email"], [Validation.email, "Email không hợp lệ"]] });
    if (!Validation.showFieldErrors(emailForm, errors)) return;
    Helpers.withBusy($("sendOtpBtn"), async () => {
      try {
        await sendOtp();
        $("sentTo").textContent = email;
        goStep(2);
        resetForm.otp.focus();
      } catch (err) {
        Validation.showFieldErrors(emailForm, { email: err.message });
      }
    });
  });

  $("resendBtn").addEventListener("click", () => sendOtp().catch((err) => Notify.error(err.message)));

  resetForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = { otp: resetForm.otp.value.trim(), password: resetForm.password.value, confirm: resetForm.confirm.value };
    const errors = Validation.validate(data, {
      otp: [[(v) => /^\d{6}$/.test(v), "Mã xác nhận gồm 6 chữ số"]],
      password: [[Validation.password, "Mật khẩu tối thiểu 6 ký tự"]],
      confirm: [[(v) => v === data.password, "Mật khẩu nhập lại không khớp"]],
    });
    if (!Validation.showFieldErrors(resetForm, errors)) return;
    Helpers.withBusy($("resetBtn"), async () => {
      try {
        await CustomerService.resetPassword(email, data.otp, data.password);
        goStep(3);
      } catch (err) {
        Validation.showFieldErrors(resetForm, { otp: err.message });
      }
    });
  });
})();
