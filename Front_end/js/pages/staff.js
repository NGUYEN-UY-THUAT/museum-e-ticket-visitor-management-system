/* staff.js — Cán bộ & Phân quyền (pages/staff.html), chỉ quản trị viên.
   Vai trò theo biểu đồ lớp: admin | staff. Quyền cố định theo vai trò (APP_CONFIG.ROLE_PERMISSIONS). */
(function () {
  const me = AdminShell.init("staff");
  if (!me) return;
  const $ = (id) => document.getElementById(id);
  const esc = (s) => Format.escape(s);
  const PAGE_SIZE = 8;
  const ROLE_BADGE = { admin: { label: "Quản trị viên", badge: "info" }, staff: { label: "Cán bộ vận hành", badge: "muted" } };
  const code = (u) => "CB-" + String(u.id).padStart(3, "0");
  let staff = [];
  let page = 1;
  let selectedId = null;

  $("permRows").innerHTML = APP_CONFIG.ROLE_PERMISSIONS.map((g) =>
    `<tr class="perm-group"><td colspan="3">${esc(g.group)}</td></tr>` +
    g.items.map((i) => `<tr><td>${esc(i.label)}</td>${[i.staff, i.admin].map((ok) => `<td class="text-center"><span class="material-symbols-outlined perm-${ok ? "yes" : "no"}">${ok ? "check_circle" : "remove"}</span></td>`).join("")}</tr>`).join("")
  ).join("");

  function renderStats() {
    const active = staff.filter((u) => u.status !== "locked");
    const stat = (label, icon, value, note, cls = "") => `<div class="adm-stat ${cls}"><div class="adm-stat__top"><span>${label}</span><span class="adm-stat__icon"><span class="material-symbols-outlined">${icon}</span></span></div><div class="adm-stat__value">${value}</div><div class="adm-stat__note">${note}</div></div>`;
    $("stats").innerHTML =
      stat("Tổng cán bộ", "groups", staff.length, "Tài khoản đăng nhập trang quản trị") +
      stat("Đang hoạt động", "verified_user", active.length, `${staff.length - active.length} tài khoản đang bị khóa`, "adm-stat--ok") +
      stat("Quản trị viên", "admin_panel_settings", staff.filter((u) => u.role === "admin").length, "Toàn quyền hệ thống") +
      stat("Cán bộ vận hành", "badge", staff.filter((u) => u.role === "staff").length, "Soát vé, đơn hàng, sự kiện");
  }

  function filtered() {
    const q = Helpers.normalizeText($("keyword").value);
    const role = $("roleFilter").value, st = $("statusFilter").value;
    return staff.filter((u) => (!role || u.role === role) && (!st || u.status === st) && (!q || Helpers.normalizeText(`${u.full_name} ${u.email} ${u.username}`).includes(q)));
  }

  function renderTable() {
    const list = filtered();
    const pg = AdminUI.paginate(list, page, PAGE_SIZE);
    page = pg.page;
    $("rows").innerHTML = pg.items.length
      ? pg.items.map((u) => `<tr data-id="${u.id}" class="${String(u.id) === String(selectedId) ? "is-selected" : ""}${u.status === "locked" ? " is-locked" : ""}">
          <td><span class="adm-code">${code(u)}</span></td>
          <td><div class="adm-person"><span class="adm-avatar${u.role === "admin" ? " adm-avatar--gold" : ""}">${esc(AdminShell.initials(u.full_name))}</span>
            <span class="min-w-0"><span class="adm-person__name">${esc(u.full_name)}${u.id === me.id ? ' <span class="hh-hint">(bạn)</span>' : ""}</span><span class="adm-person__sub">${esc(u.username)} · ${esc(u.email || "—")}</span></span></div></td>
          <td>${AdminUI.badge(ROLE_BADGE, u.role)}</td>
          <td>${AdminUI.badge(APP_CONFIG.STAFF_STATUS, u.status)}</td>
          <td class="nowrap muted">${u.last_login ? Format.dateTime(u.last_login) : "Chưa đăng nhập"}</td></tr>`).join("")
      : `<tr><td colspan="5" class="empty">Không có cán bộ phù hợp</td></tr>`;
    AdminUI.pager($("pager"), { ...pg, total: list.length, unit: "cán bộ" }, (p) => ((page = p), renderTable()));
    $("rows").querySelectorAll("tr[data-id]").forEach((tr) => tr.addEventListener("click", () => select(tr.dataset.id)));
  }

  function renderDetail(u) {
    const self = u.id === me.id;
    const locked = u.status === "locked";
    $("detail").innerHTML = `
      <div class="flex items-center gap-3">
        <span class="adm-avatar adm-avatar--gold staff-avatar">${esc(AdminShell.initials(u.full_name))}</span>
        <div class="min-w-0"><h2 class="adm-panel__title">${esc(u.full_name)}</h2><p class="adm-panel__sub">${code(u)} · ${esc(u.username)}</p></div>
      </div>
      <div class="adm-panel__section">
        <dl class="adm-dl"><dt>Email</dt><dd>${esc(u.email || "—")}</dd><dt>Điện thoại</dt><dd>${esc(u.phone || "—")}</dd>
          <dt>Trạng thái</dt><dd>${AdminUI.badge(APP_CONFIG.STAFF_STATUS, u.status)}</dd><dt>Tạo lúc</dt><dd>${Format.date(u.created_at) || "—"}</dd></dl>
      </div>
      <form class="adm-panel__section flex flex-col gap-4" id="staffForm" novalidate>
        <div class="hh-field"><label class="hh-label" for="d_role">Vai trò</label>
          <select class="hh-input" id="d_role" name="role" ${self ? "disabled" : ""}><option value="staff" ${u.role === "staff" ? "selected" : ""}>Cán bộ vận hành</option><option value="admin" ${u.role === "admin" ? "selected" : ""}>Quản trị viên</option></select>
          ${self ? `<span class="hh-hint">Bạn không thể tự đổi vai trò hoặc khóa tài khoản của chính mình.</span>` : ""}</div>
        <div class="hh-field"><label class="hh-label" for="d_phone">Điện thoại</label><input class="hh-input" id="d_phone" name="phone" value="${esc(u.phone || "")}" /><span class="hh-error"></span></div>
        <button class="hh-btn hh-btn--primary hh-btn--block" type="submit" id="saveStaff"><span class="material-symbols-outlined">save</span> Lưu thay đổi</button>
      </form>
      <div class="adm-panel__section flex flex-col gap-2">
        <button class="hh-btn hh-btn--soft hh-btn--block" type="button" id="resetPw"><span class="material-symbols-outlined">key</span> Đặt lại mật khẩu</button>
        ${self ? "" : `<button class="hh-btn ${locked ? "hh-btn--soft" : "hh-btn--ghost staff-danger"} hh-btn--block" type="button" id="toggleLock"><span class="material-symbols-outlined">${locked ? "lock_open" : "lock"}</span> ${locked ? "Mở khóa tài khoản" : "Khóa tài khoản"}</button>`}
      </div>`;
    $("staffForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const f = e.currentTarget;
      const phone = f.phone.value.trim();
      if (!Validation.showFieldErrors(f, phone && !Validation.phone(phone) ? { phone: "Số điện thoại không hợp lệ" } : {})) return;
      Helpers.withBusy($("saveStaff"), async () => {
        await StaffService.save({ id: u.id, phone, ...(self ? {} : { role: f.role.value }) });
        Notify.success("Đã lưu thông tin cán bộ");
        await load();
      });
    });
    $("resetPw").addEventListener("click", async (e) => {
      if (!(await Modal.confirm(`Đặt lại mật khẩu cho ${u.full_name}? Mật khẩu cũ sẽ không dùng được nữa.`, "Đặt lại mật khẩu"))) return;
      const temp = await StaffService.resetPassword(u.id);
      if (temp) Modal.open({ title: "Mật khẩu tạm thời", body: `<p class="hh-hint">Gửi mật khẩu này cho <b>${esc(u.full_name)}</b> và yêu cầu đổi sau khi đăng nhập:</p><p class="staff-temp">${esc(temp)}</p>`, footer: `<button class="hh-btn hh-btn--primary" data-close type="button">Đã ghi lại</button>` });
      else Notify.success("Đã gửi mật khẩu mới qua email cán bộ");
    });
    $("toggleLock")?.addEventListener("click", async () => {
      if (!locked && !(await Modal.confirm(`Khóa tài khoản ${u.username}? Người này sẽ không đăng nhập được nữa.`, "Khóa tài khoản"))) return;
      await StaffService.setStatus(u.id, locked ? "active" : "locked");
      Notify.success(locked ? "Đã mở khóa tài khoản" : "Đã khóa tài khoản");
      await load();
    });
  }

  function openAdd() {
    const root = Modal.open({
      title: "Thêm cán bộ",
      body: `<form class="adm-form" id="addForm" novalidate>
        <div class="hh-field span-2"><label class="hh-label" for="a_name">Họ và tên <span class="req">*</span></label><input class="hh-input" id="a_name" name="full_name" /><span class="hh-error"></span></div>
        <div class="hh-field"><label class="hh-label" for="a_user">Tên đăng nhập <span class="req">*</span></label><input class="hh-input" id="a_user" name="username" autocomplete="off" placeholder="vd: hoa.nguyen" /><span class="hh-error"></span></div>
        <div class="hh-field"><label class="hh-label" for="a_role">Vai trò</label><select class="hh-input" id="a_role" name="role"><option value="staff">Cán bộ vận hành</option><option value="admin">Quản trị viên</option></select></div>
        <div class="hh-field"><label class="hh-label" for="a_email">Email công vụ <span class="req">*</span></label><input class="hh-input" id="a_email" name="email" type="email" /><span class="hh-error"></span></div>
        <div class="hh-field"><label class="hh-label" for="a_phone">Điện thoại</label><input class="hh-input" id="a_phone" name="phone" type="tel" /><span class="hh-error"></span></div>
        <div class="hh-field span-2"><label class="hh-label" for="a_pw">Mật khẩu ban đầu <span class="req">*</span></label><input class="hh-input" id="a_pw" name="password" type="password" autocomplete="new-password" /><span class="hh-error"></span><span class="hh-hint">Ít nhất 6 ký tự. Cán bộ nên đổi mật khẩu ở lần đăng nhập đầu.</span></div>
      </form>`,
      footer: `<button class="hh-btn hh-btn--ghost" type="button" data-close>Hủy</button><button class="hh-btn hh-btn--primary" type="button" id="addOk"><span class="material-symbols-outlined">person_add</span> Tạo tài khoản</button>`,
    });
    root.querySelector("#addOk").addEventListener("click", async (e) => {
      const f = root.querySelector("#addForm");
      const d = { full_name: f.full_name.value.trim(), username: f.username.value.trim().toLowerCase(), role: f.role.value, email: f.email.value.trim().toLowerCase(), phone: f.phone.value.trim(), password: f.password.value };
      const errors = {};
      if (d.full_name.length < 2) errors.full_name = "Vui lòng nhập họ tên";
      if (!/^[a-z0-9._]{3,30}$/.test(d.username)) errors.username = "3–30 ký tự: chữ thường, số, dấu chấm, gạch dưới";
      if (!Validation.email(d.email)) errors.email = "Email không hợp lệ";
      if (d.phone && !Validation.phone(d.phone)) errors.phone = "Số điện thoại không hợp lệ";
      if (d.password.length < 6) errors.password = "Mật khẩu tối thiểu 6 ký tự";
      if (!Validation.showFieldErrors(f, errors)) return;
      await Helpers.withBusy(e.currentTarget, async () => {
        try {
          const u = await StaffService.save(d);
          Modal.close();
          Notify.success("Đã tạo tài khoản " + u.username);
          selectedId = u.id;
          await load();
        } catch (err) {
          Validation.showFieldErrors(f, { username: err.message });
        }
      });
    });
  }

  function select(id) {
    selectedId = id;
    renderTable();
    renderDetail(staff.find((u) => String(u.id) === String(id)));
    if (window.innerWidth < 1200) $("detail").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function load() {
    staff = await StaffService.list();
    renderStats();
    renderTable();
    const u = staff.find((x) => String(x.id) === String(selectedId));
    if (u) renderDetail(u);
  }

  ["roleFilter", "statusFilter"].forEach((id) => $(id).addEventListener("change", () => ((page = 1), renderTable())));
  $("keyword").addEventListener("input", Helpers.debounce(() => ((page = 1), renderTable()), 200));
  $("addBtn").addEventListener("click", openAdd);
  load().catch((err) => Notify.error(err.message));
})();
