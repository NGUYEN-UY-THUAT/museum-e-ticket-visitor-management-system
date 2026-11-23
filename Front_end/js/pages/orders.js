/* orders.js — Đơn hàng & Hoàn tiền (pages/orders.html)
   Dữ liệu: OrderService.list() = vé (mỗi vé là một đơn) + yêu cầu đổi giờ / hủy vé của khách (ticket_requests). */
(function () {
  if (!AdminShell.init("orders")) return;
  const $ = (id) => document.getElementById(id);
  const esc = (s) => Format.escape(s);
  const PAGE_SIZE = 8;
  const REQ_LABEL = { change: "Yêu cầu đổi giờ", cancel: "Yêu cầu hủy vé" };
  let orders = [];
  let tab = "all";
  let page = 1;
  let selectedId = Helpers.param("id");

  const isToday = (v) => String(v || "").slice(0, 10) === Format.isoDate();
  const statusBadge = (o) =>
    AdminUI.badge(APP_CONFIG.TICKET_STATUS, o.status) + (o.pending_request ? `<span class="hh-badge hh-badge--warning mt-1">${REQ_LABEL[o.pending_request.type]}</span>` : "");

  function renderStats() {
    const revenueToday = orders.filter((o) => ["paid", "used"].includes(o.status) && isToday(o.created_at)).reduce((s, o) => s + Number(o.total), 0);
    const pending = orders.filter((o) => o.status === "pending");
    const reqs = orders.filter((o) => o.pending_request);
    const refunded = orders.flatMap((o) => o.requests).filter((r) => r.type === "cancel" && r.status === "approved");
    const stat = (label, icon, value, note, cls = "") => `
      <div class="adm-stat ${cls}"><div class="adm-stat__top"><span>${label}</span><span class="adm-stat__icon"><span class="material-symbols-outlined">${icon}</span></span></div>
      <div class="adm-stat__value">${value}</div><div class="adm-stat__note">${note}</div></div>`;
    $("stats").innerHTML =
      stat("Doanh thu hôm nay", "payments", Format.currency(revenueToday), `${orders.filter((o) => isToday(o.created_at)).length} đơn đặt trong ngày`, "adm-stat--ok") +
      stat("Chờ thanh toán", "hourglass_top", `${pending.length}<small>đơn</small>`, `Tạm giữ ${Format.currency(pending.reduce((s, o) => s + Number(o.total), 0))}`) +
      stat("Yêu cầu chờ duyệt", "pending_actions", `${reqs.length}<small>yêu cầu</small>`, "Đổi giờ hoặc hủy vé hoàn tiền", reqs.length ? "adm-stat--warn" : "") +
      stat("Đã hoàn tiền", "currency_exchange", Format.currency(refunded.reduce((s, r) => s + Number(r.refund_amount || 0), 0)), `${refunded.length} yêu cầu đã duyệt`);
  }

  function filtered() {
    const q = Helpers.normalizeText($("keyword").value);
    const type = $("typeFilter").value;
    return orders.filter((o) => {
      if (tab === "paid" && !["paid", "used"].includes(o.status)) return false;
      if (tab === "pending" && o.status !== "pending") return false;
      if (tab === "request" && !o.pending_request) return false;
      if (type && String(o.ticket_type_id) !== type) return false;
      return !q || Helpers.normalizeText(`${o.code} ${o.customer_name} ${o.phone} ${o.email}`).includes(q);
    });
  }

  function renderTable() {
    const counts = { all: orders.length, paid: orders.filter((o) => ["paid", "used"].includes(o.status)).length, pending: orders.filter((o) => o.status === "pending").length, request: orders.filter((o) => o.pending_request).length };
    document.querySelectorAll("[data-count]").forEach((el) => (el.textContent = `(${counts[el.dataset.count]})`));
    const list = filtered();
    const pg = AdminUI.paginate(list, page, PAGE_SIZE);
    page = pg.page;
    $("rows").innerHTML = pg.items.length
      ? pg.items
          .map(
            (o) => `<tr data-id="${o.id}" class="${String(o.id) === String(selectedId) ? "is-selected" : ""}">
        <td><span class="adm-code">${esc(o.code)}</span><div class="muted mt-1">${Format.dateTime(o.created_at)}</div></td>
        <td><span class="adm-person__name">${esc(o.customer_name)}</span><span class="adm-person__sub">${esc(o.phone)}</span></td>
        <td><span class="nowrap">${esc(o.type_name)} × ${o.quantity}</span><div class="muted nowrap">${Format.date(o.visit_date)}${o.time_slot ? " · " + esc(o.time_slot) : ""}</div></td>
        <td class="num strong">${Format.currency(o.total)}</td>
        <td><div class="flex flex-col items-start gap-1">${statusBadge(o)}</div></td></tr>`
          )
          .join("")
      : `<tr><td colspan="5" class="empty">Không có đơn phù hợp</td></tr>`;
    AdminUI.pager($("pager"), { ...pg, total: list.length, unit: "đơn" }, (p) => ((page = p), renderTable()));
    $("rows").querySelectorAll("tr[data-id]").forEach((tr) => tr.addEventListener("click", () => select(tr.dataset.id)));
  }

  function requestCard(r, o) {
    const pending = r.status === "pending";
    const statusMap = APP_CONFIG.REQUEST_STATUS;
    const body =
      r.type === "change"
        ? `<dl class="adm-dl"><dt>Ngày hiện tại</dt><dd>${Format.date(o.visit_date)}${o.time_slot ? ", " + esc(o.time_slot) : ""}</dd>
           <dt>Đổi sang</dt><dd>${Format.date(r.new_visit_date)}, ${esc(r.new_time_slot)}</dd><dt>Phí đổi</dt><dd>Miễn phí</dd></dl>
           ${r.note ? `<p class="hh-hint mt-2">“${esc(r.note)}”</p>` : ""}`
        : `<div class="flex items-end justify-between gap-3"><div><p class="hh-hint">Số tiền hoàn</p><p class="adm-stat__value">${Format.currency(r.refund_amount)}</p></div>
             <span class="hh-badge hh-badge--info">${Math.round((r.refund_rate || 0) * 100)}% giá vé</span></div>
           <dl class="adm-dl mt-3"><dt>Lý do</dt><dd>${esc(r.reason || "—")}</dd>
           <dt>Hình thức</dt><dd>${r.refund_method === "bank" ? "Chuyển khoản" : "Hoàn về phương thức thanh toán"}</dd>
           ${r.refund_method === "bank" ? `<dt>Ngân hàng</dt><dd>${esc(r.bank_name)}</dd><dt>Số tài khoản</dt><dd>${esc(r.bank_account)}</dd><dt>Chủ tài khoản</dt><dd>${esc(r.bank_holder)}</dd>` : ""}</dl>`;
    const actions = pending
      ? `<div class="flex flex-col gap-2 mt-4">
           <button class="hh-btn hh-btn--primary hh-btn--block" type="button" data-approve="${r.id}"><span class="material-symbols-outlined">task_alt</span> ${r.type === "change" ? "Chấp nhận đổi giờ" : `Duyệt hoàn ${Format.currency(r.refund_amount)}`}</button>
           <button class="hh-btn hh-btn--ghost hh-btn--block" type="button" data-reject="${r.id}"><span class="material-symbols-outlined">block</span> Từ chối</button>
         </div>`
      : `<p class="hh-hint mt-3">${r.status === "approved" ? "Đã duyệt" : "Đã từ chối"} bởi ${esc(r.processed_by || "cán bộ")} lúc ${Format.dateTime(r.processed_at)}${r.reject_reason ? ` · Lý do: ${esc(r.reject_reason)}` : ""}</p>`;
    return `<div class="adm-panel__section">
      <div class="flex items-center justify-between gap-2 mb-3"><p class="adm-panel__label" style="margin:0">${REQ_LABEL[r.type]} · YC-${r.id}</p>${AdminUI.badge(statusMap, r.status)}</div>
      <p class="hh-hint mb-3">Gửi lúc ${Format.dateTime(r.created_at)}</p>${body}${actions}</div>`;
  }

  function renderDetail(o) {
    const timeline = [
      [o.created_at, "Khách đặt vé"],
      ...o.requests.map((r) => [r.created_at, `Khách gửi ${REQ_LABEL[r.type].toLowerCase()}`]),
      ...o.requests.filter((r) => r.processed_at).map((r) => [r.processed_at, `${r.status === "approved" ? "Duyệt" : "Từ chối"} ${REQ_LABEL[r.type].toLowerCase()}`]),
      ...(o.used_at ? [[o.used_at, "Khách vào cổng"]] : []),
    ].sort((a, b) => String(a[0]).localeCompare(String(b[0])));
    $("detail").innerHTML = `
      <div class="flex items-start justify-between gap-3">
        <div><p class="adm-panel__label">Chi tiết đơn</p><h2 class="adm-panel__title">${esc(o.code)}</h2></div>${AdminUI.badge(APP_CONFIG.TICKET_STATUS, o.status)}
      </div>
      <div class="adm-panel__section" style="border:0;padding-top:0">
        <dl class="adm-dl">
          <dt>Khách hàng</dt><dd>${esc(o.customer_name)}</dd><dt>Điện thoại</dt><dd>${esc(o.phone)}</dd><dt>Email</dt><dd>${esc(o.email)}</dd>
          <dt>Loại vé</dt><dd>${esc(o.type_name)} × ${o.quantity}</dd><dt>Ngày tham quan</dt><dd>${Format.date(o.visit_date)}${o.time_slot ? `<br>${esc(o.time_slot)}` : ""}</dd>
          <dt>Tổng tiền</dt><dd>${Format.currency(o.total)}</dd>
        </dl>
        ${o.status === "pending" ? `<button class="hh-btn hh-btn--soft hh-btn--block mt-4" type="button" id="markPaid"><span class="material-symbols-outlined">price_check</span> Xác nhận đã thanh toán</button>` : ""}
      </div>
      ${o.requests.map((r) => requestCard(r, o)).join("")}
      <div class="adm-panel__section"><p class="adm-panel__label">Lịch sử</p>
        <ul class="flex flex-col gap-2">${timeline.map(([t, s]) => `<li class="flex gap-2 text-[13px] leading-[18px]"><span class="material-symbols-outlined text-secondary" style="font-size:16px">radio_button_checked</span><span><b>${Format.dateTime(t)}</b> · ${esc(s)}</span></li>`).join("")}</ul>
      </div>`;
    $("markPaid")?.addEventListener("click", (e) => act(e.currentTarget, () => OrderService.markPaid(o), "Đã xác nhận thanh toán"));
    $("detail").querySelectorAll("[data-approve]").forEach((b) =>
      b.addEventListener("click", async () => {
        const r = o.requests.find((x) => String(x.id) === b.dataset.approve);
        const msg = r.type === "change" ? `Đổi vé ${o.code} sang ${Format.date(r.new_visit_date)}, ${r.new_time_slot}?` : `Hủy vé ${o.code} và hoàn ${Format.currency(r.refund_amount)} cho khách?`;
        if (await Modal.confirm(msg, "Duyệt yêu cầu")) act(b, () => OrderService.approve(r), "Đã duyệt yêu cầu, hệ thống sẽ gửi email báo khách");
      })
    );
    $("detail").querySelectorAll("[data-reject]").forEach((b) => b.addEventListener("click", () => rejectDialog(o.requests.find((x) => String(x.id) === b.dataset.reject))));
  }

  function rejectDialog(r) {
    const root = Modal.open({
      title: "Từ chối yêu cầu YC-" + r.id,
      body: `<form id="rejectForm" class="hh-field" novalidate><label class="hh-label" for="reason">Lý do từ chối <span class="req">*</span></label>
        <textarea class="hh-input" id="reason" name="reason" placeholder="Ví dụ: đã quá thời hạn đổi vé theo quy định"></textarea><span class="hh-error"></span></form>`,
      footer: `<button class="hh-btn hh-btn--ghost" data-close type="button">Hủy</button><button class="hh-btn hh-btn--danger" id="rejectOk" type="button">Từ chối yêu cầu</button>`,
    });
    root.querySelector("#rejectOk").addEventListener("click", async () => {
      const form = root.querySelector("#rejectForm");
      const reason = form.reason.value.trim();
      if (!Validation.showFieldErrors(form, reason.length < 5 ? { reason: "Vui lòng nhập lý do (ít nhất 5 ký tự)" } : {})) return;
      Modal.close();
      await act(null, () => OrderService.reject(r, reason), "Đã từ chối yêu cầu");
    });
  }

  async function act(btn, fn, okMsg) {
    const run = async () => {
      try {
        await fn();
        Notify.success(okMsg);
        await load();
      } catch (err) {
        Notify.error(err.message);
      }
    };
    return btn ? Helpers.withBusy(btn, run) : run();
  }

  function select(id) {
    selectedId = id;
    history.replaceState(null, "", "?id=" + id);
    const o = orders.find((x) => String(x.id) === String(id));
    if (o) renderDetail(o);
    renderTable();
    if (window.innerWidth < 1200) $("detail").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function load() {
    orders = (await OrderService.list()).sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
    renderStats();
    renderTable();
    const o = orders.find((x) => String(x.id) === String(selectedId));
    if (o) renderDetail(o);
  }

  // Sự kiện
  document.querySelectorAll("#tabs [data-tab]").forEach((b) =>
    b.addEventListener("click", () => {
      tab = b.dataset.tab;
      page = 1;
      document.querySelectorAll("#tabs [data-tab]").forEach((x) => x.classList.toggle("is-active", x === b));
      renderTable();
    })
  );
  $("keyword").addEventListener("input", Helpers.debounce(() => ((page = 1), renderTable()), 200));
  $("typeFilter").addEventListener("change", () => ((page = 1), renderTable()));
  $("exportBtn").addEventListener("click", () => {
    const rows = filtered().map((o) => [o.code, Format.dateTime(o.created_at), o.customer_name, o.phone, o.email, o.type_name, o.quantity, o.visit_date, o.time_slot || "", o.total, APP_CONFIG.TICKET_STATUS[o.status]?.label || o.status, o.pending_request ? REQ_LABEL[o.pending_request.type] : ""]);
    AdminUI.downloadCsv(`don-hang-${Format.isoDate()}.csv`, [["Mã vé", "Ngày đặt", "Khách hàng", "Điện thoại", "Email", "Loại vé", "Số lượng", "Ngày tham quan", "Khung giờ", "Tổng tiền", "Trạng thái", "Yêu cầu chờ duyệt"], ...rows]);
  });

  TicketService.types().then((types) => {
    $("typeFilter").insertAdjacentHTML("beforeend", types.map((t) => `<option value="${t.id}">${esc(t.name)}</option>`).join(""));
  });
  if (Helpers.param("tab")) document.querySelector(`#tabs [data-tab="${Helpers.param("tab")}"]`)?.click();
  load().catch((err) => Notify.error(err.message));
})();
