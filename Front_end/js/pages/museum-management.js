/* museum-management.js — Quản lý bảo tàng (pages/museum-management.html), chỉ quản trị viên.
   Trường dữ liệu khớp bảng museums (xem js/services/mock/museum.mock.js) + status, slot_capacity. */
(function () {
  if (!AdminShell.init("museums")) return;
  const $ = (id) => document.getElementById(id);
  const esc = (s) => Format.escape(s);
  const PAGE_SIZE = 6;
  const cityLabel = (c) => APP_CONFIG.CITIES.find((x) => x.code === c)?.label || c;
  const typeLabel = (c) => APP_CONFIG.MUSEUM_TYPES.find((x) => x.code === c)?.label || c;
  const code = (m) => "BT-" + String(m.id).padStart(2, "0");
  let museums = [];
  let page = 1;
  let selectedId = null;

  $("cityFilter").innerHTML = APP_CONFIG.CITIES.map((c) => `<option value="${c.code === "all" ? "" : c.code}">${c.code === "all" ? "Mọi khu vực" : esc(c.label)}</option>`).join("");
  $("typeFilter").innerHTML = APP_CONFIG.MUSEUM_TYPES.map((c) => `<option value="${c.code === "all" ? "" : c.code}">${esc(c.label)}</option>`).join("");

  function renderStats() {
    const open = museums.filter((m) => m.status !== "closed");
    const cap = open.reduce((s, m) => s + (Number(m.slot_capacity) || APP_CONFIG.SLOT_CAPACITY) * APP_CONFIG.TIME_SLOTS.length, 0);
    const stat = (label, icon, value, note, cls = "") => `<div class="adm-stat ${cls}"><div class="adm-stat__top"><span>${label}</span><span class="adm-stat__icon"><span class="material-symbols-outlined">${icon}</span></span></div><div class="adm-stat__value">${value}</div><div class="adm-stat__note">${note}</div></div>`;
    $("stats").innerHTML =
      stat("Tổng số điểm", "account_balance", museums.length, `${new Set(museums.map((m) => m.city_code)).size} tỉnh, thành phố`) +
      stat("Đang mở cửa", "check_circle", open.length, "Đang bán vé trực tuyến", "adm-stat--ok") +
      stat("Tạm đóng cửa", "construction", museums.length - open.length, "Bảo trì hoặc tạm dừng đón khách", museums.length - open.length ? "adm-stat--warn" : "") +
      stat("Sức chứa mỗi ngày", "groups", Format.number(cap), "Tổng của các điểm đang mở");
  }

  function filtered() {
    const q = Helpers.normalizeText($("keyword").value);
    const city = $("cityFilter").value, type = $("typeFilter").value, st = $("statusFilter").value;
    return museums.filter((m) => (!city || m.city_code === city) && (!type || m.category_code === type) && (!st || (m.status || "open") === st) && (!q || Helpers.normalizeText(`${m.name} ${m.address}`).includes(q)));
  }

  function renderTable() {
    const list = filtered();
    const pg = AdminUI.paginate(list, page, PAGE_SIZE);
    page = pg.page;
    $("countBadge").textContent = list.length + " điểm";
    $("rows").innerHTML = pg.items.length
      ? pg.items.map((m) => `<tr data-id="${m.id}" class="${String(m.id) === String(selectedId) ? "is-selected" : ""}">
          <td><span class="adm-code">${code(m)}</span></td>
          <td><div class="adm-person"><img class="adm-thumb" src="${esc(m.image_url)}" alt="" loading="lazy" onerror="this.style.visibility='hidden'" />
            <span class="min-w-0"><span class="adm-person__name">${esc(m.name)}</span><span class="adm-person__sub">${esc(cityLabel(m.city_code))} · ${esc(typeLabel(m.category_code))}</span></span></div></td>
          <td class="nowrap">${Format.time(m.open_time)} – ${Format.time(m.close_time)}<div class="muted">${esc(Format.openDays(m.open_days))}</div></td>
          <td class="num">${Number(m.min_price) ? Format.currency(m.min_price) : "Miễn phí"}</td>
          <td>${AdminUI.badge(APP_CONFIG.MUSEUM_STATUS, m.status || "open")}</td></tr>`).join("")
      : `<tr><td colspan="5" class="empty">Không có bảo tàng phù hợp</td></tr>`;
    AdminUI.pager($("pager"), { ...pg, total: list.length, unit: "bảo tàng" }, (p) => ((page = p), renderTable()));
    $("rows").querySelectorAll("tr[data-id]").forEach((tr) => tr.addEventListener("click", () => select(tr.dataset.id)));
  }

  function renderDetail(m) {
    const closed = m.status === "closed";
    $("detail").innerHTML = `
      <div class="flex items-center justify-between gap-2"><p class="adm-panel__label" style="margin:0">Xem nhanh</p><span class="adm-code">${code(m)}</span></div>
      <div class="mm-cover mt-3"><img src="${esc(m.image_url)}" alt="" onerror="this.remove()" /><div><span class="hh-badge hh-badge--${closed ? "warning" : "success"}">${closed ? "Tạm đóng cửa" : "Đang mở cửa"}</span><h2>${esc(m.name)}</h2></div></div>
      <div class="grid grid-cols-2 gap-3 mt-4">
        <div class="mm-box"><span>Sức chứa / khung giờ</span><b>${Number(m.slot_capacity) || APP_CONFIG.SLOT_CAPACITY} khách</b></div>
        <div class="mm-box"><span>Giá vé từ</span><b>${Number(m.min_price) ? Format.currency(m.min_price) : "Miễn phí"}</b></div>
      </div>
      <ul class="mm-info">
        <li><span class="material-symbols-outlined">location_on</span><span>${esc(m.address)}</span></li>
        <li><span class="material-symbols-outlined">schedule</span><span>${esc(Format.openingHours(m))}</span></li>
        <li><span class="material-symbols-outlined">category</span><span>${esc(typeLabel(m.category_code))} · ${esc(cityLabel(m.city_code))}</span></li>
      </ul>
      <div class="flex flex-col gap-2 mt-4">
        <div class="grid grid-cols-2 gap-2">
          <button class="hh-btn hh-btn--primary" type="button" id="editBtn"><span class="material-symbols-outlined">edit</span> Sửa</button>
          <a class="hh-btn hh-btn--soft" href="time-slots.html?museum_id=${m.id}"><span class="material-symbols-outlined">schedule</span> Khung giờ</a>
        </div>
        <a class="hh-btn hh-btn--ghost" href="museum-detail.html?id=${m.id}" target="_blank" rel="noopener"><span class="material-symbols-outlined">open_in_new</span> Xem trên trang khách</a>
        <button class="hh-btn ${closed ? "hh-btn--soft" : "hh-btn--ghost mm-danger"}" type="button" id="statusBtn"><span class="material-symbols-outlined">${closed ? "lock_open" : "block"}</span> ${closed ? "Mở cửa đón khách trở lại" : "Tạm đóng cửa (ngừng bán vé)"}</button>
      </div>`;
    $("editBtn").addEventListener("click", () => openForm(m));
    $("statusBtn").addEventListener("click", async () => {
      const next = closed ? "open" : "closed";
      if (next === "closed" && !(await Modal.confirm(`Tạm đóng cửa "${m.name}"? Khách sẽ không đặt được vé mới cho bảo tàng này.`, "Tạm đóng cửa"))) return;
      await MuseumService.setStatus(m.id, next);
      Notify.success(next === "closed" ? "Đã tạm đóng cửa bảo tàng" : "Đã mở cửa trở lại");
      await load();
    });
  }

  function openForm(m = {}) {
    const days = Array.isArray(m.open_days) ? m.open_days : [2, 3, 4, 5, 6, 0];
    const dayNames = [[1, "T2"], [2, "T3"], [3, "T4"], [4, "T5"], [5, "T6"], [6, "T7"], [0, "CN"]];
    const opt = (list, val) => list.filter((c) => c.code !== "all").map((c) => `<option value="${c.code}" ${c.code === val ? "selected" : ""}>${esc(c.label)}</option>`).join("");
    const root = Modal.open({
      title: m.id ? "Sửa thông tin bảo tàng" : "Thêm bảo tàng mới",
      body: `<form class="adm-form" id="museumForm" novalidate>
        <div class="hh-field span-2"><label class="hh-label" for="f_name">Tên bảo tàng <span class="req">*</span></label><input class="hh-input" id="f_name" name="name" value="${esc(m.name || "")}" maxlength="150" /><span class="hh-error"></span></div>
        <div class="hh-field"><label class="hh-label" for="f_city">Khu vực</label><select class="hh-input" id="f_city" name="city_code">${opt(APP_CONFIG.CITIES, m.city_code)}</select></div>
        <div class="hh-field"><label class="hh-label" for="f_type">Thể loại</label><select class="hh-input" id="f_type" name="category_code">${opt(APP_CONFIG.MUSEUM_TYPES, m.category_code)}</select></div>
        <div class="hh-field span-2"><label class="hh-label" for="f_address">Địa chỉ <span class="req">*</span></label><input class="hh-input" id="f_address" name="address" value="${esc(m.address || "")}" /><span class="hh-error"></span></div>
        <div class="hh-field"><label class="hh-label" for="f_open">Giờ mở cửa</label><input class="hh-input" id="f_open" name="open_time" type="time" value="${Format.time(m.open_time) || "08:00"}" /></div>
        <div class="hh-field"><label class="hh-label" for="f_close">Giờ đóng cửa</label><input class="hh-input" id="f_close" name="close_time" type="time" value="${Format.time(m.close_time) || "17:00"}" /><span class="hh-error"></span></div>
        <div class="hh-field span-2"><span class="hh-label">Ngày mở cửa</span><div class="adm-days" id="f_days">${dayNames.map(([v, l]) => `<label><input type="checkbox" value="${v}" ${days.includes(v) ? "checked" : ""} /> ${l}</label>`).join("")}</div><span class="hh-error" data-for="open_days"></span></div>
        <div class="hh-field"><label class="hh-label" for="f_price">Giá vé thấp nhất (đ)</label><input class="hh-input" id="f_price" name="min_price" type="number" min="0" step="1000" value="${m.min_price ?? 30000}" /><span class="hh-error"></span></div>
        <div class="hh-field"><label class="hh-label" for="f_cap">Sức chứa / khung giờ <span class="req">*</span></label><input class="hh-input" id="f_cap" name="slot_capacity" type="number" min="1" value="${m.slot_capacity || APP_CONFIG.SLOT_CAPACITY}" /><span class="hh-error"></span></div>
        <div class="hh-field span-2"><label class="hh-label" for="f_img">Ảnh đại diện (đường dẫn)</label><input class="hh-input" id="f_img" name="image_url" value="${esc(m.image_url || "")}" placeholder="../assets/images/ten-anh.jpg" /></div>
        <div class="hh-field span-2"><label class="hh-label" for="f_desc">Giới thiệu ngắn</label><textarea class="hh-input" id="f_desc" name="description" maxlength="500">${esc(m.description || "")}</textarea></div>
      </form>`,
      footer: `<button class="hh-btn hh-btn--ghost" type="button" data-close>Hủy</button><button class="hh-btn hh-btn--primary" type="button" id="saveMuseum"><span class="material-symbols-outlined">save</span> Lưu</button>`,
    });
    root.querySelector("#saveMuseum").addEventListener("click", async (e) => {
      const f = root.querySelector("#museumForm");
      const data = {
        name: f.elements.name.value.trim(), city_code: f.city_code.value, category_code: f.category_code.value, address: f.address.value.trim(),
        open_time: f.open_time.value, close_time: f.close_time.value, min_price: Number(f.min_price.value || 0), slot_capacity: Number(f.slot_capacity.value),
        open_days: [...f.querySelectorAll("#f_days input:checked")].map((i) => Number(i.value)), image_url: f.image_url.value.trim(), description: f.description.value.trim(),
      };
      const errors = {};
      if (data.name.length < 3) errors.name = "Vui lòng nhập tên bảo tàng";
      if (!data.address) errors.address = "Vui lòng nhập địa chỉ";
      if (data.close_time <= data.open_time) errors.close_time = "Giờ đóng cửa phải sau giờ mở cửa";
      if (data.min_price < 0) errors.min_price = "Giá không hợp lệ";
      if (!Number.isInteger(data.slot_capacity) || data.slot_capacity < 1) errors.slot_capacity = "Sức chứa phải là số nguyên dương";
      Validation.showFieldErrors(f, errors);
      f.querySelector('[data-for="open_days"]').textContent = data.open_days.length ? "" : "Chọn ít nhất một ngày";
      if (Object.keys(errors).length || !data.open_days.length) return;
      await Helpers.withBusy(e.currentTarget, async () => {
        try {
          const saved = await MuseumService.save(m.id ? { ...data, id: m.id } : data);
          Modal.close();
          Notify.success(m.id ? "Đã lưu thông tin bảo tàng" : "Đã thêm bảo tàng mới");
          selectedId = saved.id;
          await load();
        } catch (err) {
          Notify.error(err.message);
        }
      });
    });
  }

  function select(id) {
    selectedId = id;
    renderTable();
    renderDetail(museums.find((m) => String(m.id) === String(id)));
    if (window.innerWidth < 1200) $("detail").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function load() {
    museums = await MuseumService.adminList();
    renderStats();
    renderTable();
    const m = museums.find((x) => String(x.id) === String(selectedId));
    if (m) renderDetail(m);
  }

  ["cityFilter", "typeFilter", "statusFilter"].forEach((id) => $(id).addEventListener("change", () => ((page = 1), renderTable())));
  $("keyword").addEventListener("input", Helpers.debounce(() => ((page = 1), renderTable()), 200));
  $("addBtn").addEventListener("click", () => openForm());
  load().catch((err) => Notify.error(err.message));
})();
