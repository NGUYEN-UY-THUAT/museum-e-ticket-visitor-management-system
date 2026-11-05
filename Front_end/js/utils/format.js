window.Format = {
  currency(v) {
    return Number(v || 0).toLocaleString("vi-VN") + " ₫";
  },
  number(v) {
    return Number(v || 0).toLocaleString("vi-VN");
  },
  date(v) {
    if (!v) return "";
    const d = new Date(v);
    return d.toLocaleDateString("vi-VN");
  },
  dateTime(v) {
    if (!v) return "";
    const d = new Date(v);
    return d.toLocaleString("vi-VN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit", year: "numeric", hour12: false });
  },
  isoDate(d = new Date()) {
    const z = new Date(d);
    z.setMinutes(z.getMinutes() - z.getTimezoneOffset());
    return z.toISOString().slice(0, 10);
  },
  badge(map, key) {
    const s = map[key] || { label: key, badge: "muted" };
    return `<span class="badge badge--${s.badge}">${s.label}</span>`;
  },
  escape(s) {
    return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  },
};

/* ---------- Định dạng cho trang khách tham quan ---------- */
Object.assign(window.Format, {
  /** 1250 -> "1.2k+", 980 -> "980+" */
  reviewCount(n) {
    n = Number(n) || 0;
    if (n < 1000) return n + "+";
    const k = Math.floor(n / 100) / 10;
    return (Number.isInteger(k) ? k : k.toFixed(1)) + "k+";
  },
  /** 4.85 -> "4.9" */
  rating(v) {
    return (Number(v) || 0).toFixed(1);
  },
  /** "08:00:00" (MySQL TIME) -> "08:00" */
  time(v) {
    return String(v || "").slice(0, 5);
  },
  /** Ngày mở cửa [2,3,4,5,6,0] (0 = CN) -> "Thứ 3 - Chủ Nhật"; đủ 7 ngày -> "Hàng ngày" */
  openDays(days) {
    if (!Array.isArray(days) || !days.length) return "";
    if (days.length === 7) return "Hàng ngày";
    const names = ["Chủ Nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
    const sorted = [...days].sort((a, b) => ((a + 6) % 7) - ((b + 6) % 7)); // Thứ 2 -> CN
    const first = names[sorted[0]],
      last = names[sorted[sorted.length - 1]];
    return sorted.length === 1 ? first : `${first} - ${last}`;
  },
  /** -> "08:00 - 17:00 (Thứ 3 - Chủ Nhật)" */
  openingHours(m) {
    const range = `${this.time(m.open_time)} - ${this.time(m.close_time)}`;
    const days = this.openDays(m.open_days);
    return days ? `${range} (${days})` : range;
  },
});
