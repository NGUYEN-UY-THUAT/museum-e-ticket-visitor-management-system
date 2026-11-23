/* visitors.js — Đoàn khách (pages/visitors.html). Bảng MySQL: groups(group_name, leader_name, phone, email, size, visit_date, guide_required, note, status) */
(function () {
  if (!AdminShell.init("visitors")) return;
  const $ = (id) => document.getElementById(id);
  const esc = (s) => Format.escape(s);
  const S = APP_CONFIG.GROUP_STATUS;
  const PAGE = 8;
  const params = new URLSearchParams(location.search);
  let groups = [];
  let tab = S[params.get("status")] ? params.get("status") : "";
  let page = 1;
  let selectedId = params.get("id");

  const filtered = () => {
    const q = $("keyword").value.trim().toLowerCase();
    return groups.filter((g) => (!tab || g.status === tab) && (!q || [g.group_name, g.leader_name, g.phone].some((x) => String(x || "").toLowerCase().includes(q))));
  };

  function renderStats() {
    const upcoming = groups.filter((g) => g.status === "approved" && g.visit_date >= Format.isoDate());
    const pending = groups.filter((g) => g.status === "pending");
    $("stats").innerHTML =
      AdminUI.stat("Chờ duyệt", "pending_actions", Format.number(pending.length), "Cần phản hồi trong 24 giờ", pending.length ? "adm-stat--warn" : "") +
      AdminUI.stat("Đoàn sắp đến", "event_upcoming", Format.number(upcoming.length), `${Format.number(upcoming.reduce((s, g) => s + Number(g.size), 0))} khách`) +
      AdminUI.stat("Cần thuyết minh", "record_voice_over", Format.number(upcoming.filter((g) => Number(g.guide_required)).length), "Trong số đoàn sắp đến") +
      AdminUI.stat("Đã tham quan", "task_alt", Format.number(groups.filter((g) => g.status === "visited").length), "", "adm-stat--ok");
    document.querySelectorAll("#tabs [data-count]").forEach((el) => {
      const k = el.dataset.count;
      el.textContent = `(${groups.filter((g) => !k || g.status === k).length})`;
    });
    document.querySelectorAll("#tabs [data-tab]").forEach((x) => x.classList.toggle("is-active", x.dataset.tab === tab));
  }

  function renderTable() {
    const list = filtered();
    const pg = AdminUI.paginate(list, page, PAGE);
    page = pg.page;
    $("rows").innerHTML = pg.items.map((g) => `<tr data-id="${g.id}" class="${String(g.id) === String(selectedId) ? "is-selected" : ""}">
        <td><p class="strong">${esc(g.group_name)}</p>${Number(g.guide_required) ? `<span class="vg-guide"><span class="material-symbols-outlined">record_voice_over</span>Cần thuyết minh</span>` : ""}</td>
        <td>${esc(g.leader_name)}<div class="muted">${esc(g.phone)}</div></td>
        <td class="num strong">${g.size}</td><td>${Format.date(g.visit_date)}</td><td>${AdminUI.badge(S, g.status)}</td></tr>`).join("") || `<tr><td colspan="5" class="empty">Không có đoàn nào</td></tr>`;
    AdminUI.pager($("pager"), { ...pg, total: list.length, unit: "đoàn" }, (p) => ((page = p), renderTable()));
  }

  function renderDetail(g) {
    const actions = {
      pending: `<div class="grid grid-cols-2 gap-2"><button class="hh-btn hh-btn--primary" data-st="approved" type="button"><span class="material-symbols-outlined">check</span> Duyệt</button><button class="hh-btn hh-btn--soft" data-st="rejected" type="button"><span class="material-symbols-outlined">close</span> Từ chối</button></div>`,
      approved: `<button class="hh-btn hh-btn--primary hh-btn--block" data-st="visited" type="button"><span class="material-symbols-outlined">where_to_vote</span> Xác nhận đoàn đã đến</button>`,
    }[g.status] || "";
    $("detail").innerHTML = `
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0"><p class="adm-panel__label">Đoàn khách</p><h2 class="adm-panel__title">${esc(g.group_name)}</h2></div>${AdminUI.badge(S, g.status)}
      </div>
      <dl class="adm-dl mt-4">
        <dt>Trưởng đoàn</dt><dd>${esc(g.leader_name)}</dd><dt>Điện thoại</dt><dd>${esc(g.phone)}</dd><dt>Email</dt><dd>${esc(g.email || "—")}</dd>
        <dt>Số người</dt><dd>${g.size} khách</dd><dt>Ngày tham quan</dt><dd>${Format.date(g.visit_date)}</dd><dt>Thuyết minh</dt><dd>${Number(g.guide_required) ? "Có" : "Không"}</dd>
      </dl>
      ${g.note ? `<p class="vg-note">${esc(g.note)}</p>` : ""}
      <div class="adm-panel__section flex flex-col gap-2">${actions}
        <button class="hh-btn hh-btn--ghost hh-btn--block" id="editBtn" type="button"><span class="material-symbols-outlined">edit</span> Sửa thông tin</button></div>`;
    $("detail").querySelectorAll("[data-st]").forEach((b) => b.addEventListener("click", async () => {
      const st = b.dataset.st;
      const msg = { approved: `Duyệt đoàn ${g.group_name} (${g.size} khách) ngày ${Format.date(g.visit_date)}?`, rejected: `Từ chối đăng ký của ${g.group_name}?`, visited: `Xác nhận ${g.group_name} đã đến tham quan?` }[st];
      if (!(await Modal.confirm(msg))) return;
      await Helpers.withBusy(b, async () => {
        await VisitorService.setStatus(g.id, st);
        Notify.success(st === "visited" ? "Đã ghi nhận đoàn đến" : "Đã cập nhật, hệ thống sẽ email báo trưởng đoàn");
        await load();
      });
    }));
    $("editBtn").addEventListener("click", () => openForm(g));
  }

  function openForm(g = {}) {
    const v = (k) => esc(g[k] ?? "");
    const root = Modal.open({
      title: g.id ? "Sửa thông tin đoàn" : "Thêm đoàn khách",
      body: `<form class="adm-form" id="gForm" novalidate>
        <div class="hh-field span-2"><label class="hh-label" for="g_name">Tên đoàn / đơn vị <span class="req">*</span></label><input class="hh-input" id="g_name" name="group_name" maxlength="120" value="${v("group_name")}" /><span class="hh-error"></span></div>
        <div class="hh-field"><label class="hh-label" for="g_leader">Trưởng đoàn <span class="req">*</span></label><input class="hh-input" id="g_leader" name="leader_name" maxlength="80" value="${v("leader_name")}" /><span class="hh-error"></span></div>
        <div class="hh-field"><label class="hh-label" for="g_phone">Số điện thoại <span class="req">*</span></label><input class="hh-input" id="g_phone" name="phone" inputmode="tel" value="${v("phone")}" /><span class="hh-error"></span></div>
        <div class="hh-field"><label class="hh-label" for="g_email">Email</label><input class="hh-input" id="g_email" name="email" type="email" value="${v("email")}" /><span class="hh-error"></span></div>
        <div class="hh-field"><label class="hh-label" for="g_size">Số người <span class="req">*</span></label><input class="hh-input" id="g_size" name="size" type="number" min="10" max="500" value="${v("size")}" /><span class="hh-error"></span><span class="hh-hint">Tối thiểu 10 người</span></div>
        <div class="hh-field"><label class="hh-label" for="g_date">Ngày tham quan <span class="req">*</span></label><input class="hh-input" id="g_date" name="visit_date" type="date" value="${v("visit_date")}" /><span class="hh-error"></span></div>
        <div class="hh-field"><span class="hh-label">Thuyết minh viên</span><label class="adm-switch mt-2"><span class="adm-switch__text">Cần thuyết minh</span><input type="checkbox" name="guide_required" ${Number(g.guide_required) ? "checked" : ""} /></label></div>
        <div class="hh-field span-2"><label class="hh-label" for="g_note">Ghi chú</label><textarea class="hh-input" id="g_note" name="note" rows="2" maxlength="300">${v("note")}</textarea></div>
      </form>`,
      footer: `<button class="hh-btn hh-btn--ghost" data-close type="button">Hủy</button><button class="hh-btn hh-btn--primary" id="saveG" type="button"><span class="material-symbols-outlined">save</span> Lưu</button>`,
    });
    root.querySelector("#saveG").addEventListener("click", async (e) => {
      const f = root.querySelector("#gForm");
      const d = AdminUI.formValues(f);
      const errors = {};
      if (d.group_name.length < 3) errors.group_name = "Vui lòng nhập tên đoàn";
      if (d.leader_name.length < 2) errors.leader_name = "Vui lòng nhập tên trưởng đoàn";
      if (!Validation.phone(d.phone)) errors.phone = "Số điện thoại không hợp lệ";
      if (d.email && !Validation.email(d.email)) errors.email = "Email không hợp lệ";
      if (!(Number(d.size) >= 10 && Number(d.size) <= 500)) errors.size = "Đoàn từ 10 đến 500 người";
      if (!d.visit_date) errors.visit_date = "Vui lòng chọn ngày";
      else if (!g.id && !Validation.notPast(d.visit_date)) errors.visit_date = "Ngày tham quan không được ở quá khứ";
      if (!Validation.showFieldErrors(f, errors)) return;
      await Helpers.withBusy(e.currentTarget, async () => {
        const saved = await VisitorService.save({ ...(g.id ? { id: g.id } : {}), ...d, size: Number(d.size), guide_required: d.guide_required ? 1 : 0 });
        Modal.close();
        Notify.success(g.id ? "Đã lưu thông tin đoàn" : "Đã thêm đoàn, đang chờ duyệt");
        if (saved && saved.id) selectedId = saved.id;
        await load();
      });
    });
  }

  $("rows").addEventListener("click", (e) => {
    const tr = e.target.closest("tr[data-id]");
    if (!tr) return;
    selectedId = tr.dataset.id;
    renderDetail(groups.find((g) => String(g.id) === selectedId));
    renderTable();
    if (window.innerWidth < 1200) $("detail").scrollIntoView({ behavior: "smooth", block: "start" });
  });
  document.querySelectorAll("#tabs [data-tab]").forEach((b) => b.addEventListener("click", () => { tab = b.dataset.tab; page = 1; renderStats(); renderTable(); }));
  $("keyword").addEventListener("input", Helpers.debounce(() => ((page = 1), renderTable()), 200));
  $("addBtn").addEventListener("click", () => openForm());
  $("exportBtn").addEventListener("click", () => AdminUI.downloadCsv(`doan-khach-${Format.isoDate()}.csv`, [["Tên đoàn", "Trưởng đoàn", "Điện thoại", "Email", "Số người", "Ngày tham quan", "Thuyết minh", "Ghi chú", "Trạng thái"],
    ...filtered().map((g) => [g.group_name, g.leader_name, g.phone, g.email, g.size, g.visit_date, Number(g.guide_required) ? "Có" : "Không", g.note, S[g.status]?.label || g.status])]));

  async function load() {
    groups = (await VisitorService.list()).sort((a, b) => (a.status === "pending" ? -1 : 0) - (b.status === "pending" ? -1 : 0) || String(a.visit_date).localeCompare(String(b.visit_date)));
    renderStats();
    renderTable();
    const g = groups.find((x) => String(x.id) === String(selectedId));
    if (g) renderDetail(g);
  }
  load().catch((e) => Notify.error(e.message));
})();
