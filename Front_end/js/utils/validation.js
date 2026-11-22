window.Validation = {
  required: (v) => String(v ?? "").trim() !== "",
  email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
  phone: (v) => /^(0|\+84)\d{9,10}$/.test(String(v).replace(/\s/g, "")),
  positive: (v) => Number(v) > 0,
  notPast: (v) => v >= Format.isoDate(),
  /** rules: { field: [[fn, "thông báo"], ...] } → trả về { field: "lỗi" } */
  validate(data, rules) {
    const errors = {};
    for (const [field, list] of Object.entries(rules)) {
      for (const [fn, msg] of list) {
        if (!fn(data[field])) {
          errors[field] = msg;
          break;
        }
      }
    }
    return errors;
  },
  showErrors(form, errors) {
    form.querySelectorAll(".form-error").forEach((e) => e.remove());
    for (const [field, msg] of Object.entries(errors)) {
      const input = form.elements[field];
      if (!input) continue;
      const el = document.createElement("span");
      el.className = "form-error";
      el.textContent = msg;
      input.closest(".form-group")?.appendChild(el);
    }
    return Object.keys(errors).length === 0;
  },
};

/* ---------- Biểu mẫu trang khách (khung .hh-field / .hh-error trong heritage-ui.css) ---------- */
Object.assign(window.Validation, {
  password: (v) => String(v || "").length >= 6,
  /** Hiện lỗi dưới từng ô; trả về true nếu không có lỗi */
  showFieldErrors(form, errors) {
    form.querySelectorAll(".hh-error").forEach((e) => (e.textContent = ""));
    form.querySelectorAll(".hh-input.is-invalid").forEach((e) => e.classList.remove("is-invalid"));
    let first = null;
    for (const [field, msg] of Object.entries(errors)) {
      const input = form.elements[field];
      if (!input) continue;
      const box = input.closest(".hh-field");
      const err = box && box.querySelector(".hh-error");
      if (err) err.textContent = msg;
      if (input.classList) input.classList.add("is-invalid");
      first = first || input;
    }
    if (first && first.focus) first.focus();
    return Object.keys(errors).length === 0;
  },
});
