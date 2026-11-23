/* ticket-lookup.js — Tra cứu vé không cần tài khoản (pages/ticket-lookup.html)
   Tìm theo mã vé (TK...), email hoặc số điện thoại; hiện mã QR và các thao tác tiếp theo. */
PublicNavbar.render();
SiteFooter.render();

(function () {
  const $ = (id) => document.getElementById(id);
  const form = $("lookupForm");
  const esc = Format.escape;
  let types = [];


  /** Che bớt thông tin cá nhân khi tra cứu không đăng nhập */
  const maskName = (n) => String(n || "").split(" ").map((w, i, a) => (i === a.length - 1 ? w : w[0] + ".")).join(" ");
  const maskPhone = (p) => (p ? String(p).slice(0, 3) + "****" + String(p).slice(-3) : "");
  const canChange = (t) => t.status === "paid" && t.visit_date >= Format.isoDate();

  function ticketCard(t) {
    const type = types.find((x) => String(x.id) === String(t.ticket_type_id));
    const st = APP_CONFIG.TICKET_STATUS[t.status] || { label: t.status, badge: "muted" };
    const code = encodeURIComponent(t.code);
    return `
      <article class="hh-card flex flex-col sm:flex-row gap-6">
        <div class="flex flex-col items-center gap-2 shrink-0">
          <div class="hh-qr${t.status === "used" || t.status === "cancelled" ? " opacity-40 grayscale" : ""}" data-qr="${esc(t.code)}"></div>
          <span class="font-label-md text-label-md text-primary tracking-widest">${esc(t.code)}</span>
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p class="font-label-sm text-label-sm text-secondary uppercase tracking-wider font-semibold">Vé tham quan</p>
              <h3 class="font-headline-sm text-headline-sm text-primary">${esc(type ? type.name : "Vé điện tử")} × ${t.quantity}</h3>
            </div>
            <span class="hh-badge hh-badge--${st.badge}">${st.label}</span>
          </div>
          <dl class="grid grid-cols-2 gap-x-6 gap-y-3 mt-4 font-body-sm text-body-sm">
            <div><dt class="text-on-surface-variant">Ngày tham quan</dt><dd class="font-semibold text-on-surface">${Format.date(t.visit_date)}</dd></div>
            <div><dt class="text-on-surface-variant">Tổng tiền</dt><dd class="font-semibold text-on-surface">${Format.currency(t.total)}</dd></div>
            <div><dt class="text-on-surface-variant">Người đặt</dt><dd class="font-semibold text-on-surface">${esc(maskName(t.customer_name))}</dd></div>
            <div><dt class="text-on-surface-variant">Điện thoại</dt><dd class="font-semibold text-on-surface">${esc(maskPhone(t.phone))}</dd></div>
          </dl>
          <div class="flex flex-wrap gap-2 mt-5">
            <a class="hh-btn hh-btn--primary hh-btn--sm" href="ticket-detail.html?code=${code}"><span class="material-symbols-outlined">visibility</span> Xem vé chi tiết</a>
            ${canChange(t) ? `<a class="hh-btn hh-btn--soft hh-btn--sm" href="ticket-change.html?code=${code}"><span class="material-symbols-outlined">edit_calendar</span> Đổi giờ / Hủy vé</a>` : ""}
            ${t.status === "used" ? `<a class="hh-btn hh-btn--soft hh-btn--sm" href="survey.html?code=${code}"><span class="material-symbols-outlined">rate_review</span> Đánh giá chuyến đi</a>` : ""}
            ${t.status === "pending" ? `<a class="hh-btn hh-btn--gold hh-btn--sm" href="checkout.html?code=${code}"><span class="material-symbols-outlined">credit_card</span> Thanh toán ngay</a>` : ""}
          </div>
        </div>
      </article>`;
  }

  function drawQrs() {
    document.querySelectorAll("[data-qr]").forEach((box) => {
      if (window.QRCode) new QRCode(box, { text: box.dataset.qr, width: 128, height: 128, correctLevel: QRCode.CorrectLevel.M });
      else box.innerHTML = `<span class="hh-qr__fallback">${esc(box.dataset.qr)}</span>`;
    });
  }

  async function search(keyword) {
    const results = $("results");
    const list = await TicketService.lookup(keyword);
    $("resultCount").textContent = list.length ? list.length + " vé" : "";
    if (!list.length) {
      results.innerHTML = `
        <div class="hh-card hh-empty">
          <span class="material-symbols-outlined">search_off</span>
          <p class="font-title-md text-title-md text-primary mt-2">Không tìm thấy vé với “${esc(keyword)}”</p>
          <p class="font-body-sm text-body-sm mt-1">Kiểm tra lại mã vé, email hoặc số điện thoại, hoặc liên hệ hỗ trợ.</p>
        </div>`;
      return;
    }
    results.innerHTML = list.map(ticketCard).join("");
    drawQrs();
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const keyword = form.keyword.value.trim();
    const ok = Validation.showFieldErrors(form, keyword ? {} : { keyword: "Vui lòng nhập mã vé, email hoặc số điện thoại" });
    if (!ok) return;
    history.replaceState(null, "", "?q=" + encodeURIComponent(keyword));
    Helpers.withBusy($("lookupBtn"), () => search(keyword).catch((err) => Notify.error(err.message)));
  });

  // Mở sẵn kết quả khi có ?q= hoặc ?code= trên URL
  TicketService.types().then((t) => {
    types = t;
    const q = Helpers.param("q") || Helpers.param("code");
    if (q) {
      form.keyword.value = q;
      form.requestSubmit();
    }
  });
})();
