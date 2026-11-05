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
