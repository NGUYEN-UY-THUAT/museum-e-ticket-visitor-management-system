/* ticket-types.js — Loại vé & Giá (pages/ticket-types.html), chỉ quản trị viên. Bảng MySQL: ticket_types(id, name, price, description, active) */
(function () {
  if (!AdminShell.init("ticket-types")) return;
  const $ = (id) => document.getElementById(id);
  const esc = (s) => Format.escape(s);
  const ACTIVE = { 1: { label: "Đang bán", badge: "success" }, 0: { label: "Ngừng bán", badge: "muted" } };
  let types = [];
  let tickets = [];

  function render() {
    const active = types.filter((t) => Number(t.active));
    const prices = active.map((t) => Number(t.price));
    const sold = (id) => tickets.filter((t) => t.ticket_type_id === id && ["paid", "used"].includes(t.status)).reduce((s, t) => s + Number(t.quantity), 0);
    $("stats").innerHTML =
      AdminUI.stat("Loại vé đang bán", "sell", `${active.length}<small>/ ${types.length}</small>`, "") +
      AdminUI.stat("Giá thấp nhất", "south", prices.length ? Format.currency(Math.min(...prices)) : "—", "") +
      AdminUI.stat("Giá cao nhất", "north", prices.length ? Format.currency(Math.max(...prices)) : "—", "");
    $("rows").innerHTML = types.map((t) => `<tr>
        <td class="strong">${esc(t.name)}</td><td class="muted">${esc(t.description || "—")}</td>
        <td class="num strong">${Number(t.price) ? Format.currency(t.price) : "Miễn phí"}</td><td class="num">${Format.number(sold(t.id))}</td>
        <td>${AdminUI.badge(ACTIVE, Number(t.active))}</td>
        <td class="num"><div class="inline-flex gap-2">
          <button class="hh-btn hh-btn--soft hh-btn--sm" type="button" data-edit="${t.id}"><span class="material-symbols-outlined">edit</span> Sửa</button>
          <button class="hh-btn hh-btn--ghost hh-btn--sm" type="button" data-toggle="${t.id}">${Number(t.active) ? "Ngừng bán" : "Mở bán"}</button></div></td></tr>`).join("") || `<tr><td colspan="6" class="empty">Chưa có loại vé</td></tr>`;
  }

  function openForm(t = {}) {
    const root = Modal.open({
      title: t.id ? "Sửa loại vé" : "Thêm loại vé",
      body: `<form class="adm-form" id="typeForm" novalidate>
        <div class="hh-field span-2"><label class="hh-label" for="t_name">Tên loại vé <span class="req">*</span></label><input class="hh-input" id="t_name" name="name" maxlength="60" value="${esc(t.name || "")}" placeholder="vd: Người cao tuổi" /><span class="hh-error"></span></div>
        <div class="hh-field"><label class="hh-label" for="t_price">Giá vé (đồng) <span class="req">*</span></label><input class="hh-input" id="t_price" name="price" type="number" min="0" step="1000" value="${t.price ?? ""}" /><span class="hh-error"></span><span class="hh-hint">Nhập 0 nếu miễn phí</span></div>
        <div class="hh-field"><span class="hh-label">Trạng thái</span><label class="adm-switch mt-2"><span class="adm-switch__text">Đang bán</span><input type="checkbox" name="active" ${t.id && !Number(t.active) ? "" : "checked"} /></label></div>
        <div class="hh-field span-2"><label class="hh-label" for="t_desc">Đối tượng / điều kiện áp dụng</label><input class="hh-input" id="t_desc" name="description" maxlength="120" value="${esc(t.description || "")}" placeholder="vd: Từ 60 tuổi, xuất trình CCCD" /></div>
      </form>`,
      footer: `<button class="hh-btn hh-btn--ghost" data-close type="button">Hủy</button><button class="hh-btn hh-btn--primary" id="saveType" type="button"><span class="material-symbols-outlined">save</span> Lưu</button>`,
    });
    root.querySelector("#saveType").addEventListener("click", async (e) => {
      const f = root.querySelector("#typeForm");
      const d = AdminUI.formValues(f);
      const errors = {};
      if (d.name.length < 2) errors.name = "Vui lòng nhập tên loại vé";
      else if (types.some((x) => x.id !== t.id && x.name.toLowerCase() === d.name.toLowerCase())) errors.name = "Tên loại vé đã tồn tại";
      if (d.price === "" || Number(d.price) < 0) errors.price = "Giá vé không hợp lệ";
      if (!Validation.showFieldErrors(f, errors)) return;
      await Helpers.withBusy(e.currentTarget, async () => {
        await TicketService.saveType({ ...(t.id ? { id: t.id } : {}), name: d.name, price: Number(d.price), description: d.description, active: d.active ? 1 : 0 });
        Modal.close();
        Notify.success("Đã lưu loại vé");
        await load();
      });
    });
  }

  $("rows").addEventListener("click", async (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    const t = types.find((x) => String(x.id) === (b.dataset.edit || b.dataset.toggle));
    if (b.dataset.edit) openForm(t);
    if (b.dataset.toggle) {
      await TicketService.saveType({ id: t.id, active: Number(t.active) ? 0 : 1 });
      Notify.success(Number(t.active) ? "Đã ngừng bán " + t.name : "Đã mở bán " + t.name);
      load();
    }
  });
  $("addBtn").addEventListener("click", () => openForm());

  async function load() {
    [types, tickets] = await Promise.all([TicketService.types(), TicketService.list()]);
    render();
  }
  load().catch((err) => Notify.error(err.message));
})();
