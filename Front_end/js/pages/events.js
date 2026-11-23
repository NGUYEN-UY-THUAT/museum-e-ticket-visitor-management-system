/* events.js — Sự kiện (pages/events.html). Bảng MySQL: events(title, description, location, start_time, end_time, capacity, registered, status) */
(function () {
  if (!AdminShell.init("events")) return;
  const $ = (id) => document.getElementById(id);
  const esc = (s) => Format.escape(s);
  const S = APP_CONFIG.EVENT_STATUS;
  const ORDER = { ongoing: 0, upcoming: 1, finished: 2, cancelled: 3 };
  let events = [];
  let tab = "";

  $("tabs").innerHTML = [["", "Tất cả"], ...Object.entries(S).map(([k, v]) => [k, v.label])]
    .map(([k, l]) => `<button class="hh-tab${k === tab ? " is-active" : ""}" type="button" data-tab="${k}">${l} <span data-count="${k}"></span></button>`).join("");

  const hm = (t) => String(t || "").slice(11, 16);

  function render() {
    const active = events.filter((e) => ["upcoming", "ongoing"].includes(e.status));
    const regs = active.reduce((s, e) => s + Number(e.registered), 0);
    const cap = active.reduce((s, e) => s + Number(e.capacity), 0);
    $("stats").innerHTML =
      AdminUI.stat("Sắp & đang diễn ra", "event_upcoming", Format.number(active.length), "") +
      AdminUI.stat("Lượt đăng ký", "how_to_reg", Format.number(regs), `Trên ${Format.number(cap)} chỗ`) +
      AdminUI.stat("Tỉ lệ lấp đầy", "donut_large", cap ? Math.round((regs / cap) * 100) + "%" : "—", "Các sự kiện sắp diễn ra") +
      AdminUI.stat("Đã kết thúc", "event_available", Format.number(events.filter((e) => e.status === "finished").length), "", "adm-stat--ok");
    document.querySelectorAll("#tabs [data-count]").forEach((el) => (el.textContent = `(${events.filter((e) => !el.dataset.count || e.status === el.dataset.count).length})`));
    document.querySelectorAll("#tabs [data-tab]").forEach((b) => b.classList.toggle("is-active", b.dataset.tab === tab));

    const q = $("keyword").value.trim().toLowerCase();
    const list = events.filter((e) => (!tab || e.status === tab) && (!q || [e.title, e.location].some((x) => String(x || "").toLowerCase().includes(q))));
    $("grid").innerHTML = list.map((e) => {
      const pct = e.capacity ? Math.min(100, Math.round((e.registered / e.capacity) * 100)) : 0;
      const d = new Date(e.start_time);
      const canCheck = ["upcoming", "ongoing"].includes(e.status);
      return `<article class="adm-panel ev-card">
        <div class="flex items-start justify-between gap-3">
          <div class="ev-card__date"><div class="ev-card__cal"><span>TH ${d.getMonth() + 1}</span><b>${d.getDate()}</b></div>
          <div class="min-w-0"><h3 class="ev-card__title">${esc(e.title)}</h3></div></div>${AdminUI.badge(S, e.status)}
        </div>
        <p class="ev-card__desc">${esc(e.description || "")}</p>
        <div class="ev-card__meta"><span><span class="material-symbols-outlined">schedule</span>${Format.date(e.start_time)} · ${hm(e.start_time)} – ${hm(e.end_time)}</span><span><span class="material-symbols-outlined">location_on</span>${esc(e.location)}</span></div>
        <div><div class="flex justify-between text-[13px] mb-1"><span class="muted">Đã đăng ký</span><b>${e.registered}/${e.capacity}</b></div>
          <div class="ev-bar${pct >= 100 ? " is-full" : pct >= 80 ? " is-busy" : ""}"><div style="width:${pct}%"></div></div></div>
        <div class="ev-card__foot">
          <a class="hh-btn hh-btn--soft hh-btn--sm" href="event-checkin.html?event_id=${e.id}"><span class="material-symbols-outlined">${canCheck ? "how_to_reg" : "list_alt"}</span> ${canCheck ? "Điểm danh" : "Danh sách"}</a>
          <button class="hh-btn hh-btn--ghost hh-btn--sm" type="button" data-edit="${e.id}"><span class="material-symbols-outlined">edit</span> Sửa</button>
          ${Number(e.registered) ? "" : `<button class="hh-btn hh-btn--ghost hh-btn--sm" type="button" data-del="${e.id}"><span class="material-symbols-outlined">delete</span> Xóa</button>`}
        </div></article>`;
    }).join("") || `<div class="adm-card ev-empty"><p class="empty">Không có sự kiện nào</p></div>`;
  }

  function openForm(ev = {}) {
    const v = (k) => esc(ev[k] ?? "");
    const root = Modal.open({
      title: ev.id ? "Sửa sự kiện" : "Tạo sự kiện",
      body: `<form class="adm-form" id="evForm" novalidate>
        <div class="hh-field span-2"><label class="hh-label" for="e_title">Tên sự kiện <span class="req">*</span></label><input class="hh-input" id="e_title" name="title" maxlength="150" value="${v("title")}" /><span class="hh-error"></span></div>
        <div class="hh-field span-2"><label class="hh-label" for="e_desc">Mô tả</label><textarea class="hh-input" id="e_desc" name="description" rows="3" maxlength="1000">${v("description")}</textarea></div>
        <div class="hh-field"><label class="hh-label" for="e_loc">Địa điểm <span class="req">*</span></label><input class="hh-input" id="e_loc" name="location" maxlength="120" value="${v("location")}" placeholder="vd: Phòng trưng bày 2" /><span class="hh-error"></span></div>
        <div class="hh-field"><label class="hh-label" for="e_cap">Số chỗ <span class="req">*</span></label><input class="hh-input" id="e_cap" name="capacity" type="number" min="1" value="${v("capacity")}" /><span class="hh-error"></span>${ev.registered ? `<span class="hh-hint">Đã có ${ev.registered} người đăng ký</span>` : ""}</div>
        <div class="hh-field"><label class="hh-label" for="e_start">Bắt đầu <span class="req">*</span></label><input class="hh-input" id="e_start" name="start_time" type="datetime-local" value="${v("start_time")}" /><span class="hh-error"></span></div>
        <div class="hh-field"><label class="hh-label" for="e_end">Kết thúc <span class="req">*</span></label><input class="hh-input" id="e_end" name="end_time" type="datetime-local" value="${v("end_time")}" /><span class="hh-error"></span></div>
        <div class="hh-field"><label class="hh-label" for="e_status">Trạng thái</label><select class="hh-input" id="e_status" name="status">${Object.entries(S).map(([k, s]) => `<option value="${k}" ${k === (ev.status || "upcoming") ? "selected" : ""}>${s.label}</option>`).join("")}</select></div>
      </form>`,
      footer: `<button class="hh-btn hh-btn--ghost" data-close type="button">Hủy</button><button class="hh-btn hh-btn--primary" id="saveEv" type="button"><span class="material-symbols-outlined">save</span> Lưu</button>`,
    });
    root.querySelector("#saveEv").addEventListener("click", async (e) => {
      const f = root.querySelector("#evForm");
      const d = AdminUI.formValues(f);
      const errors = {};
      if (d.title.length < 3) errors.title = "Vui lòng nhập tên sự kiện";
      if (!d.location) errors.location = "Vui lòng nhập địa điểm";
      if (!(Number(d.capacity) > 0)) errors.capacity = "Số chỗ phải lớn hơn 0";
      else if (Number(d.capacity) < Number(ev.registered || 0)) errors.capacity = `Không được ít hơn số đã đăng ký (${ev.registered})`;
      if (!d.start_time) errors.start_time = "Chọn thời gian bắt đầu";
      if (!d.end_time) errors.end_time = "Chọn thời gian kết thúc";
      else if (d.start_time && d.end_time <= d.start_time) errors.end_time = "Kết thúc phải sau bắt đầu";
      if (!Validation.showFieldErrors(f, errors)) return;
      await Helpers.withBusy(e.currentTarget, async () => {
        await EventService.save({ ...(ev.id ? { id: ev.id } : {}), ...d, capacity: Number(d.capacity) });
        Modal.close();
        Notify.success("Đã lưu sự kiện");
        await load();
      });
    });
  }

  $("grid").addEventListener("click", async (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    const ev = events.find((x) => String(x.id) === (b.dataset.edit || b.dataset.del));
    if (b.dataset.edit) openForm(ev);
    if (b.dataset.del && (await Modal.confirm(`Xóa sự kiện "${ev.title}"?`))) {
      await EventService.remove(ev.id);
      Notify.success("Đã xóa sự kiện");
      load();
    }
  });
  $("tabs").addEventListener("click", (e) => {
    const b = e.target.closest("[data-tab]");
    if (b) { tab = b.dataset.tab; render(); }
  });
  $("keyword").addEventListener("input", Helpers.debounce(render, 200));
  $("addBtn").addEventListener("click", () => openForm());

  async function load() {
    events = (await EventService.list()).sort((a, b) => ORDER[a.status] - ORDER[b.status] || String(a.start_time).localeCompare(String(b.start_time)));
    render();
  }
  load().catch((e) => Notify.error(e.message));
})();
