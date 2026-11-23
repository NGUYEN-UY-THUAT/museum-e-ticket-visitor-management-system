/* Tiện ích giao diện dùng chung cho các trang quản trị kiểu mới. */
window.AdminUI = {
  /** Nhãn trạng thái hh-badge theo bảng {key: {label, badge}} trong APP_CONFIG */
  badge(map, key) {
    const s = map[key] || { label: key || "—", badge: "muted" };
    return `<span class="hh-badge hh-badge--${s.badge}">${Format.escape(s.label)}</span>`;
  },
  /** Thẻ số liệu (.adm-stat) */
  stat(label, icon, value, note = "", cls = "") {
    return `<div class="adm-stat ${cls}"><div class="adm-stat__top"><span>${label}</span><span class="adm-stat__icon"><span class="material-symbols-outlined">${icon}</span></span></div>
      <div class="adm-stat__value">${value}</div>${note ? `<div class="adm-stat__note">${note}</div>` : ""}</div>`;
  },
  /** Đọc dữ liệu form thành object (dùng form.elements để tránh trùng thuộc tính có sẵn như form.name) */
  formValues(form) {
    return Object.fromEntries([...form.elements].filter((el) => el.name).map((el) => [el.name, el.type === "checkbox" ? el.checked : el.value.trim()]));
  },
  /** Cắt danh sách theo trang */
  paginate(list, page, size) {
    const pages = Math.max(1, Math.ceil(list.length / size));
    const p = Math.min(Math.max(1, page), pages);
    return { items: list.slice((p - 1) * size, p * size), page: p, pages, from: list.length ? (p - 1) * size + 1 : 0, to: Math.min(p * size, list.length) };
  },
  /** Vẽ thanh phân trang vào el; onChange(page) khi bấm */
  pager(el, { page, pages, from, to, total, unit = "dòng" }, onChange) {
    const btn = (p, label, extra = "") => `<button type="button" data-p="${p}" ${extra}>${label}</button>`;
    let nums = "";
    for (let i = 1; i <= pages; i++) if (i === 1 || i === pages || Math.abs(i - page) <= 1) nums += btn(i, i, i === page ? 'class="is-active"' : "");
      else if (!nums.endsWith("…")) nums += "…";
    el.innerHTML = `<span>Hiển thị ${from}–${to} trong ${Format.number(total)} ${unit}</span>
      <div class="adm-pager__btns">${btn(page - 1, "‹", page <= 1 ? "disabled" : "")}${nums.replace(/…/g, "<span>…</span>")}${btn(page + 1, "›", page >= pages ? "disabled" : "")}</div>`;
    el.querySelectorAll("button[data-p]").forEach((b) => b.addEventListener("click", () => onChange(Number(b.dataset.p))));
  },
  /** Tải tệp CSV (UTF-8 có BOM để Excel đọc đúng tiếng Việt) */
  downloadCsv(filename, rows) {
    const cell = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const csv = "﻿" + rows.map((r) => r.map(cell).join(",")).join("\r\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  },
  /** "2026-11-23" -> "T2 23/11" */
  shortDay(iso) {
    const d = new Date(iso);
    return { dow: ["CN", "T2", "T3", "T4", "T5", "T6", "T7"][d.getDay()], dm: `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}` };
  },
  /** Thứ Hai của tuần chứa ngày d */
  monday(d = new Date()) {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    x.setDate(x.getDate() - ((x.getDay() + 6) % 7));
    return x;
  },
};
