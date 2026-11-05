window.Notify = {
  show(message, type = "info", ms = 3000) {
    let stack = document.querySelector(".notification-stack");
    if (!stack) {
      stack = document.createElement("div");
      stack.className = "notification-stack";
      document.body.appendChild(stack);
    }
    const el = document.createElement("div");
    el.className = `notification notification--${type}`;
    el.textContent = message;
    stack.appendChild(el);
    setTimeout(() => el.remove(), ms);
  },
  success(m) {
    this.show(m, "success");
  },
  error(m) {
    this.show(m, "error", 4500);
  },
  info(m) {
    this.show(m, "info");
  },
  warning(m) {
    this.show(m, "warning");
  },
};
