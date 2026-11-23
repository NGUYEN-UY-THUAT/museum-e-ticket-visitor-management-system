/* tickets.js — Vé điện tử (pages/tickets.html): danh sách vé, mã QR, thu tiền, hủy vé, bán vé tại quầy */
(function () {
  if (!AdminShell.init("tickets")) return;
  const $ = (id) => document.getElementById(id);
  const esc = (s) => Format.escape(s);
  const S = APP_CONFIG.TICKET_STATUS;
  const PAGE_SIZE = 10;
  let tickets = [];
  let types = [];
  let page = 1;
  const typeName = (id) => types.find((t) => t.id === Number(id))?.name || "—";

  $("statusFilter").insertAdjacentHTML("beforeend", Object.entries(S).map(([k, v]) => `<option value="${k}">${v.label}</option>`).join(""));
  if (!AuthService.isAdmin()) $("typesLink").remove();

  function renderStats() {
    const today = Format.isoDate();
    const todayList = tickets.filter((t) => t.visit_date === today);
    const sold = tickets.filter((t) => ["paid", "used"].includes(t.status));
    $("stats").innerHTML =
      AdminUI.stat("Vé tham quan hôm nay", "today", todayList.length, `${todayList.filter((t) => t.status === "used").length} vé đã vào cổng`) +
      AdminUI.stat("Vé đã bán", "confirmation_number", sold.length, `${Format.number(sold.reduce((s, t) => s + Number(t.quantity), 0))} lượt khách`, "adm-stat--ok") +
      AdminUI.stat("Chờ thanh toán", "hourglass_top", tickets.filter((t) => t.status === "pending").length, "Thu tiền tại quầy hoặc chờ khách thanh toán") +
      AdminUI.stat("Đã hủy / hết hạn", "event_busy", tickets.filter((t) => ["cancelled", "expired"].includes(t.status)).length, "");
  }

  function filtered() {
    const q = Helpers.normalizeText($("keyword").value), st = $("statusFilter").value, dt = $("dateFilter").value;
    return tickets.filter((t) => (!st || t.status === st) && (!dt || t.visit_date === dt) && (!q || Helpers.normalizeText(`${t.code} ${t.customer_name} ${t.phone} ${t.email}`).includes(q)));
  }

  function render() {
    renderStats();
    const list = filtered();
    const pg = AdminUI.paginate(list, page, PAGE_SIZE);
    page = pg.page;
    $("rows").innerHTML = pg.items.length
      ? pg.items.map((t) => `<tr>
          <td><span class="adm-code">${esc(t.code)}</span></td>
          <td><span class="adm-person__name">${esc(t.customer_name)}</span><span class="adm-person__sub">${esc(t.phone)}</span></td>
          <td class="nowrap">${esc(typeName(t.ticket_type_id))} × ${t.quantity}</td>
          <td class="nowrap">${Format.date(t.visit_date)}${t.time_slot ? `<div class="muted">${esc(t.time_slot)}</div>` : ""}</td>
          <td class="num strong">${Format.currency(t.total)}</td>
          <td>${AdminUI.badge(S, t.status)}</td>
          <td class="num"><div class="tk-actions">
            <button class="hh-btn hh-btn--soft hh-btn--sm" type="button" data-qr="${t.id}" title="Xem / in mã QR"><span class="material-symbols-outlined">qr_code_2</span></button>
            ${t.status === "pending" ? `<button class="hh-btn hh-btn--primary hh-btn--sm" type="button" data-pay="${t.id}">Thu tiền</button>` : ""}
            ${["paid", "pending"].includes(t.status) ? `<button class="hh-btn hh-btn--ghost hh-btn--sm" type="button" data-cancel="${t.id}">Hủy</button>` : ""}
          </div></td></tr>`).join("")
      : `<tr><td colspan="7" class="empty">Không có vé phù hợp</td></tr>`;
    AdminUI.pager($("pager"), { ...pg, total: list.length, unit: "vé" }, (p) => ((page = p), render()));
  }

  function showTicket(t) {
    Modal.open({
      title: "Vé điện tử " + t.code,
      body: `<div class="tk-ticket"><div class="hh-qr"><div id="qrBox"></div></div>
        <p class="tk-ticket__code">${esc(t.code)}</p>
        <dl class="adm-dl mt-4"><dt>Khách hàng</dt><dd>${esc(t.customer_name)}</dd><dt>Loại vé</dt><dd>${esc(typeName(t.ticket_type_id))} × ${t.quantity}</dd>
          <dt>Ngày tham quan</dt><dd>${Format.date(t.visit_date)}${t.time_slot ? ", " + esc(t.time_slot) : ""}</dd><dt>Thành tiền</dt><dd>${Format.currency(t.total)}</dd><dt>Trạng thái</dt><dd>${AdminUI.badge(S, t.status)}</dd></dl></div>`,
      footer: `<button class="hh-btn hh-btn--ghost" data-close type="button">Đóng</button><button class="hh-btn hh-btn--primary" type="button" onclick="window.print()"><span class="material-symbols-outlined">print</span> In vé</button>`,
      onOpen: () => {
        const box = document.getElementById("qrBox");
        if (window.QRCode) new QRCode(box, { text: t.code, width: 160, height: 160 });
        else box.innerHTML = `<div class="hh-qr__fallback">${esc(t.code)}</div>`;
      },
    });
  }

  function openSell() {
    const opts = types.filter((t) => Number(t.active)).map((t) => `<option value="${t.id}">${esc(t.name)} – ${Format.currency(t.price)}</option>`).join("");
    const root = Modal.open({
      title: "Bán vé tại quầy",
      body: `<form class="adm-form" id="sellForm" novalidate>
        <div class="hh-field span-2"><label class="hh-label" for="s_name">Họ tên khách <span class="req">*</span></label><input class="hh-input" id="s_name" name="customer_name" /><span class="hh-error"></span></div>
        <div class="hh-field"><label class="hh-label" for="s_phone">Số điện thoại <span class="req">*</span></label><input class="hh-input" id="s_phone" name="phone" type="tel" /><span class="hh-error"></span></div>
        <div class="hh-field"><label class="hh-label" for="s_email">Email (nhận vé)</label><input class="hh-input" id="s_email" name="email" type="email" /><span class="hh-error"></span></div>
        <div class="hh-field"><label class="hh-label" for="s_type">Loại vé</label><select class="hh-input" id="s_type" name="ticket_type_id">${opts}</select></div>
        <div class="hh-field"><label class="hh-label" for="s_qty">Số lượng <span class="req">*</span></label><input class="hh-input" id="s_qty" name="quantity" type="number" min="1" max="50" value="1" /><span class="hh-error"></span></div>
        <div class="hh-field"><label class="hh-label" for="s_date">Ngày tham quan</label><input class="hh-input" id="s_date" name="visit_date" type="date" value="${Format.isoDate()}" min="${Format.isoDate()}" /><span class="hh-error"></span></div>
        <div class="hh-field"><label class="hh-label" for="s_slot">Khung giờ</label><select class="hh-input" id="s_slot" name="time_slot">${APP_CONFIG.TIME_SLOTS.map((s) => `<option>${s}</option>`).join("")}</select></div>
        <p class="span-2 tk-total">Thành tiền: <b id="totalText"></b></p>
      </form>`,
      footer: `<button class="hh-btn hh-btn--ghost" data-close type="button">Hủy</button><button class="hh-btn hh-btn--primary" id="sellOk" type="button"><span class="material-symbols-outlined">qr_code_2</span> Thu tiền & phát hành vé</button>`,
    });
    const form = root.querySelector("#sellForm");
    const calc = () => {
      const t = types.find((x) => String(x.id) === form.ticket_type_id.value);
      root.querySelector("#totalText").textContent = Format.currency((t?.price || 0) * (Number(form.quantity.value) || 0));
    };
    form.addEventListener("input", calc);
    calc();
    root.querySelector("#sellOk").addEventListener("click", async (e) => {
      const d = AdminUI.formValues(form);
      const errors = Validation.validate(d, {
        customer_name: [[Validation.required, "Vui lòng nhập họ tên"]],
        phone: [[Validation.phone, "Số điện thoại không hợp lệ"]],
        email: [[(v) => !v || Validation.email(v), "Email không hợp lệ"]],
        quantity: [[(v) => Number.isInteger(Number(v)) && Number(v) >= 1 && Number(v) <= 50, "Từ 1 đến 50 vé"]],
        visit_date: [[Validation.notPast, "Không bán vé cho ngày đã qua"]],
      });
      if (!Validation.showFieldErrors(form, errors)) return;
      await Helpers.withBusy(e.currentTarget, async () => {
        try {
          const t = await TicketService.book(d);
          if (d.time_slot) await TicketService.update(t.id, { time_slot: d.time_slot, sold_by: AuthService.user()?.username, channel: "counter" });
          Notify.success("Đã phát hành vé " + t.code);
          await load();
          showTicket({ ...t, time_slot: d.time_slot });
        } catch (err) {
          Notify.error(err.message);
        }
      });
    });
  }

  $("rows").addEventListener("click", async (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    const t = tickets.find((x) => String(x.id) === (b.dataset.qr || b.dataset.pay || b.dataset.cancel));
    if (b.dataset.qr) showTicket(t);
    if (b.dataset.pay) {
      await TicketService.markPaid(t.id);
      Notify.success("Đã thu tiền vé " + t.code);
      load();
    }
    if (b.dataset.cancel && (await Modal.confirm(`Hủy vé ${t.code}? Nếu khách đã thanh toán, hãy xử lý hoàn tiền ở trang Đơn hàng & Hoàn tiền.`, "Hủy vé"))) {
      await TicketService.cancel(t.id);
      Notify.info("Đã hủy vé " + t.code);
      load();
    }
  });
  $("keyword").addEventListener("input", Helpers.debounce(() => ((page = 1), render()), 200));
  $("statusFilter").addEventListener("change", () => ((page = 1), render()));
  $("dateFilter").addEventListener("change", () => ((page = 1), render()));
  $("todayBtn").addEventListener("click", () => (($("dateFilter").value = Format.isoDate()), (page = 1), render()));
  $("sellBtn").addEventListener("click", openSell);

  async function load() {
    [tickets, types] = await Promise.all([TicketService.list(), TicketService.types()]);
    tickets.sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
    render();
  }
  load().then(() => Helpers.param("new") && openSell()).catch((err) => Notify.error(err.message));
})();
