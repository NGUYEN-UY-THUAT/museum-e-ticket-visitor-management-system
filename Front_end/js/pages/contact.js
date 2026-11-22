/* contact.js — Liên hệ & hỗ trợ (pages/contact.html) */
PublicNavbar.render();
SiteFooter.render();

(function () {
  const form = document.getElementById("contactForm");
  const count = document.getElementById("msgCount");

  // Điền sẵn thông tin khi khách đã đăng nhập, hoặc mã vé truyền qua ?code=
  const me = CustomerService.current();
  if (me) {
    form.full_name.value = me.full_name || "";
    form.email.value = me.email || "";
    form.phone.value = me.phone || "";
  }
  form.ticket_code.value = Helpers.param("code");
  if (Helpers.param("topic")) form.topic.value = Helpers.param("topic");

  form.message.addEventListener("input", () => (count.textContent = form.message.value.length + "/1000"));

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = {
      full_name: form.full_name.value.trim(),
      email: form.email.value.trim(),
      phone: form.phone.value.trim(),
      topic: form.topic.value,
      ticket_code: form.ticket_code.value.trim().toUpperCase(),
      message: form.message.value.trim(),
    };
    const errors = Validation.validate(data, {
      full_name: [[Validation.required, "Vui lòng nhập họ tên"]],
      email: [[Validation.required, "Vui lòng nhập email"], [Validation.email, "Email không hợp lệ"]],
      phone: [[(v) => !v || Validation.phone(v), "Số điện thoại không hợp lệ"]],
      topic: [[Validation.required, "Vui lòng chọn chủ đề"]],
      message: [[(v) => v.length >= 10, "Nội dung tối thiểu 10 ký tự"]],
    });
    if (!Validation.showFieldErrors(form, errors)) return;

    Helpers.withBusy(document.getElementById("contactBtn"), async () => {
      try {
        const r = await SupportService.sendMessage({ ...data, send_copy: form.copy.checked });
        document.getElementById("ticketNo").textContent = "#HT-" + String(r.id).padStart(4, "0");
        document.getElementById("contactDone").classList.remove("hidden");
        form.reset();
        count.textContent = "0/1000";
        Notify.success("Đã gửi yêu cầu hỗ trợ");
      } catch (err) {
        Notify.error(err.message);
      }
    });
  });
})();
