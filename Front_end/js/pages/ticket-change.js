/* ticket-change.js — Đổi ngày/khung giờ, hủy vé & hoàn tiền (pages/ticket-change.html)
   Quy định (khớp trang policies.html#refund):
   - Đổi ngày / khung giờ: miễn phí, phải trước giờ mở cửa ngày tham quan ít nhất 24 giờ.
   - Hủy vé: trước 48 giờ hoàn 100%; từ 24 đến 48 giờ hoàn 50%; dưới 24 giờ không hủy được. */
PublicNavbar.render();
SiteFooter.render();

(function () {
  const $ = (id) => document.getElementById(id);
  const esc = Format.escape;
  const OPEN_HOUR = 8; // giờ mở cửa, dùng để tính thời gian còn lại
  let ticket = null;
  let tab = "change";

  if (!API_CONFIG.USE_MOCK) $("demoVerify").remove();

  const hoursLeft = (t) => (new Date(t.visit_date + "T" + String(OPEN_HOUR).padStart(2, "0") + ":00") - new Date()) / 36e5;
  const refundRate = (h) => (h >= 48 ? 1 : h >= 24 ? 0.5 : 0);
  const matchContact = (t, c) => {
    c = c.trim().toLowerCase();
    return c.includes("@") ? String(t.email).toLowerCase() === c : String(t.phone).replace(/\s/g, "") === c.replace(/\s/g, "");
  };

  /* ---------- Bước 1: xác minh ---------- */
  const verifyForm = $("verifyForm");
  verifyForm.code.value = Helpers.param("code");

  verifyForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = { code: verifyForm.code.value.trim().toUpperCase(), contact: verifyForm.contact.value.trim() };
    const errors = Validation.validate(data, {
      code: [[Validation.required, "Vui lòng nhập mã vé"]],
      contact: [[Validation.required, "Vui lòng nhập email hoặc số điện thoại"]],
    });
    if (!Validation.showFieldErrors(verifyForm, errors)) return;
    Helpers.withBusy($("verifyBtn"), async () => {
      const t = await TicketService.findByCode(data.code);
      if (!t) return Validation.showFieldErrors(verifyForm, { code: "Không tìm thấy vé với mã này" });
      if (!matchContact(t, data.contact)) return Validation.showFieldErrors(verifyForm, { contact: "Email / số điện thoại không khớp với vé" });
      ticket = t;
      await showTicket();
    });
  });

  $("otherTicketBtn").addEventListener("click", () => {
    $("workArea").classList.add("hidden");
    $("verifyCard").classList.remove("hidden");
    verifyForm.reset();
  });

  /* ---------- Bước 2: thông tin vé + biểu mẫu ---------- */
  async function showTicket() {
    const types = await TicketService.types();
    const type = types.find((x) => String(x.id) === String(ticket.ticket_type_id));
    const h = hoursLeft(ticket);
    $("tkType").textContent = (type ? type.name : "Vé tham quan") + " × " + ticket.quantity;
    $("tkCode").textContent = ticket.code;
    $("tkDate").textContent = Format.date(ticket.visit_date);
    $("tkQty").textContent = ticket.quantity + " khách";
    $("tkTotal").textContent = Format.currency(ticket.total);
    $("tkLeft").textContent = h > 0 ? (h >= 48 ? Math.floor(h / 24) + " ngày" : Math.floor(h) + " giờ") : "Đã qua";
    $("verifyCard").classList.add("hidden");
    $("workArea").classList.remove("hidden");
    $("successBox").classList.add("hidden");
    $("new_date").min = Format.isoDate(new Date(Date.now() + 864e5));
    await renderRequests();
    switchTab(tab);
  }

  async function renderRequests() {
    const list = await TicketService.requests({ ticket_code: ticket.code });
    $("requestList").innerHTML = list.length
      ? list
          .map((r) => {
            const st = APP_CONFIG.REQUEST_STATUS[r.status] || { label: r.status, badge: "muted" };
            const detail = r.type === "change" ? `→ ${Format.date(r.new_visit_date)}, ${esc(r.new_time_slot)}` : `Hoàn ${Format.currency(r.refund_amount)}`;
            return `<li class="p-3 rounded-lg bg-surface-container-lowest">
              <div class="flex items-center justify-between gap-2"><span class="font-label-lg text-label-lg text-primary">YC-${r.id} · ${APP_CONFIG.REQUEST_TYPES[r.type]}</span><span class="hh-badge hh-badge--${st.badge}">${st.label}</span></div>
              <p class="font-body-sm text-body-sm text-on-surface-variant mt-1">${detail} · gửi ${Format.dateTime(r.created_at)}</p></li>`;
          })
          .join("")
      : `<li class="font-body-sm text-body-sm text-on-surface-variant">Chưa có yêu cầu nào.</li>`;
    return list;
  }

  /** Kiểm tra vé còn đổi/hủy được không và hiện thông báo phù hợp */
  function blockReason(kind) {
    if (ticket.status === "used") return "Vé đã được sử dụng nên không thể đổi hoặc hủy.";
    if (ticket.status === "cancelled") return "Vé đã bị hủy trước đó.";
    if (ticket.status === "expired") return "Vé đã hết hạn.";
    if (ticket.status === "pending") return "Vé chưa thanh toán. Bạn có thể đặt lại vé mới với ngày mong muốn.";
    const h = hoursLeft(ticket);
    if (kind === "change" && h < 24) return "Chỉ được đổi ngày / khung giờ trước giờ mở cửa ít nhất 24 giờ.";
    if (kind === "cancel" && h < 24) return "Vé chỉ được hủy trước giờ mở cửa ít nhất 24 giờ.";
    return "";
  }

  function switchTab(name) {
    tab = name;
    document.querySelectorAll("[data-tab]").forEach((b) => b.classList.toggle("is-active", b.dataset.tab === name));
    const reason = blockReason(name);
    const alert = $("ruleAlert");
    alert.classList.toggle("hidden", !reason);
    alert.className = "hh-alert mt-6" + (reason ? " hh-alert--danger" : " hidden");
    $("ruleText").textContent = reason;
    $("changeForm").classList.toggle("hidden", name !== "change" || !!reason);
    $("cancelForm").classList.toggle("hidden", name !== "cancel" || !!reason);
    $("successBox").classList.add("hidden");
    if (name === "cancel") updateRefund();
  }
  document.querySelectorAll("[data-tab]").forEach((b) => b.addEventListener("click", () => switchTab(b.dataset.tab)));

  /* ---------- Đổi ngày / khung giờ ---------- */
  const changeForm = $("changeForm");
  $("slotList").innerHTML = APP_CONFIG.TIME_SLOTS.map(
    (s) => `<button class="slot-btn px-3 py-3 rounded-xl border border-outline-variant/50 bg-surface-container-low font-label-lg text-label-lg text-on-surface hover:border-primary transition-colors" type="button" data-slot="${s}">${s}</button>`
  ).join("");
  document.querySelectorAll("[data-slot]").forEach((b) =>
    b.addEventListener("click", () => {
      document.querySelectorAll("[data-slot]").forEach((x) => x.classList.remove("is-selected"));
      b.classList.add("is-selected");
      changeForm.new_slot.value = b.dataset.slot;
    })
  );

  changeForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = { new_date: changeForm.new_date.value, new_slot: changeForm.new_slot.value };
    const errors = Validation.validate(data, {
      new_date: [
        [Validation.required, "Vui lòng chọn ngày mới"],
        [(v) => v > Format.isoDate(), "Ngày mới phải từ ngày mai trở đi"],
        [(v) => v !== ticket.visit_date, "Ngày mới trùng với ngày hiện tại của vé"],
      ],
      new_slot: [[Validation.required, "Vui lòng chọn khung giờ"]],
    });
    if (!Validation.showFieldErrors(changeForm, errors)) return;
    Helpers.withBusy($("changeBtn"), () =>
      submit({ type: "change", new_visit_date: data.new_date, new_time_slot: data.new_slot, note: changeForm.note.value.trim(), fee: 0 })
    );
  });

  /* ---------- Hủy vé ---------- */
  const cancelForm = $("cancelForm");
  function updateRefund() {
    const rate = refundRate(hoursLeft(ticket));
    $("refundRate").textContent = `Hoàn ${rate * 100}% giá trị vé (${Format.currency(ticket.total)})`;
    $("refundAmount").textContent = Format.currency(ticket.total * rate);
  }
  cancelForm.querySelectorAll("[name=refund_method]").forEach((r) =>
    r.addEventListener("change", () => $("bankFields").classList.toggle("hidden", cancelForm.refund_method.value !== "bank"))
  );

  cancelForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const bank = cancelForm.refund_method.value === "bank";
    const data = {
      reason: cancelForm.reason.value,
      confirm: cancelForm.confirm.checked,
      bank_name: cancelForm.bank_name.value.trim(),
      bank_account: cancelForm.bank_account.value.trim(),
      bank_holder: cancelForm.bank_holder.value.trim(),
    };
    const rules = {
      reason: [[Validation.required, "Vui lòng chọn lý do hủy"]],
      confirm: [[(v) => v === true, "Vui lòng xác nhận trước khi gửi"]],
    };
    if (bank) {
      rules.bank_name = [[Validation.required, "Nhập tên ngân hàng"]];
      rules.bank_account = [[(v) => /^\d{6,20}$/.test(v), "Số tài khoản không hợp lệ"]];
      rules.bank_holder = [[Validation.required, "Nhập tên chủ tài khoản"]];
    }
    if (!Validation.showFieldErrors(cancelForm, Validation.validate(data, rules))) return;
    const rate = refundRate(hoursLeft(ticket));
    Helpers.withBusy($("cancelBtn"), () =>
      submit({
        type: "cancel",
        reason: data.reason,
        refund_method: cancelForm.refund_method.value,
        bank_info: bank ? `${data.bank_name} - ${data.bank_account} - ${data.bank_holder.toUpperCase()}` : "",
        refund_rate: rate,
        refund_amount: ticket.total * rate,
      })
    );
  });

  /* ---------- Gửi yêu cầu ---------- */
  async function submit(payload) {
    const pending = (await TicketService.requests({ ticket_code: ticket.code, status: "pending" })).length;
    if (pending) return Notify.warning("Vé này đang có yêu cầu chờ xử lý, vui lòng đợi kết quả trước khi gửi yêu cầu mới");
    try {
      const r = await TicketService.createRequest({ ticket_id: ticket.id, ticket_code: ticket.code, customer_name: ticket.customer_name, ...payload });
      $("reqCode").textContent = "YC-" + r.id;
      $("changeForm").classList.add("hidden");
      $("cancelForm").classList.add("hidden");
      $("successBox").classList.remove("hidden");
      await renderRequests();
    } catch (err) {
      Notify.error(err.message);
    }
  }
  $("newRequestBtn").addEventListener("click", () => {
    changeForm.reset();
    cancelForm.reset();
    $("bankFields").classList.add("hidden");
    switchTab(tab);
  });
})();
