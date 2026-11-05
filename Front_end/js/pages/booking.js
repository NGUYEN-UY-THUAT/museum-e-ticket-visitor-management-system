/* Trang Đặt vé & dịch vụ (pages/booking.html): đặt vé QR, sự kiện, đoàn khách, khảo sát, tra cứu vé */
(async function () {
  const $ = Helpers.$;
  let types = [];

  function showTicket(t) {
    const type = types.find((x) => x.id === t.ticket_type_id);
    Modal.open({
      title: "Vé điện tử của bạn",
      body: `<div class="text-center" style="display:flex;flex-direction:column;align-items:center;gap:6px">
        <div id="qrBox"></div><div style="font-family:monospace;font-size:1.3rem;font-weight:700;letter-spacing:.1em">${t.code}</div>
        <p><b>${Format.escape(t.customer_name)}</b> · ${type?.name || ""} × ${t.quantity}</p>
        <p>Ngày tham quan: <b>${Format.date(t.visit_date)}</b> · ${Format.badge(APP_CONFIG.TICKET_STATUS, t.status)}</p>
        <p class="text-small text-muted">Xuất trình mã QR này tại cổng soát vé. Hãy lưu lại mã vé.</p></div>`,
      footer: `<button class="btn btn--outline" data-close>Đóng</button><button class="btn btn--primary" onclick="window.print()">In / Lưu PDF</button>`,
      onOpen: () => Helpers.renderQR(document.getElementById("qrBox"), t.code, 180),
    });
  }

  // Thông tin bảo tàng
  try {
    const s = await ApiService.get(API_CONFIG.ENDPOINTS.SETTINGS);
    document.title = s.museum_name + " | Đặt vé & dịch vụ";
    $("#openInfo").textContent = `Mở cửa ${s.open_time} - ${s.close_time} hằng ngày, nghỉ ${s.closed_day}`;
  } catch {}

  // Bảng giá + form đặt vé
  types = (await TicketService.types()).filter((t) => Number(t.active));
  $("#priceGrid").innerHTML = types.map((t) => `<div class="card"><h3>${t.name}</h3><div class="price-card__price">${t.price ? Format.currency(t.price) : "Miễn phí"}</div><p class="text-small text-muted">${Format.escape(t.description)}</p></div>`).join("");
  $("#typeSelect").innerHTML = types.map((t) => `<option value="${t.id}">${t.name}</option>`).join("");
  $("#visitDate").value = $("#visitDate").min = Format.isoDate();
  const bf = $("#bookingForm");
  const calc = () => {
    const t = types.find((x) => String(x.id) === bf.ticket_type_id.value);
    $("#bookingTotal").textContent = Format.currency((t?.price || 0) * (bf.quantity.value || 0));
  };
  bf.addEventListener("input", calc);
  calc();
  bf.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = Helpers.formData(bf);
    const ok = Validation.showErrors(
      bf,
      Validation.validate(data, {
        customer_name: [[Validation.required, "Vui lòng nhập họ tên"]],
        phone: [[Validation.phone, "Số điện thoại không hợp lệ"]],
        email: [[Validation.email, "Email không hợp lệ"]],
        quantity: [[(v) => Number(v) >= 1 && Number(v) <= 20, "Số lượng từ 1 đến 20"]],
        visit_date: [[Validation.notPast, "Ngày tham quan không hợp lệ"]],
      }),
    );
    if (!ok) return;
    // Bước thanh toán online (VNPay/MoMo...) sẽ tích hợp ở backend; bản demo coi như đã thanh toán.
    try {
      const t = await TicketService.book(data);
      bf.reset();
      $("#visitDate").value = Format.isoDate();
      calc();
      showTicket(t);
    } catch (err) {
      Notify.error(err.message);
    }
  });

  // Sự kiện
  async function loadEvents() {
    const evs = await EventService.list({ status: "upcoming" });
    $("#publicEvents").innerHTML = evs.length
      ? evs
          .map(
            (e) => `<div class="card" style="display:flex;flex-direction:column;gap:6px">
      <h3>${Format.escape(e.title)}</h3><p class="text-small text-muted">${Format.dateTime(e.start_time)} · ${Format.escape(e.location)}</p>
      <p class="text-small">${Format.escape(e.description)}</p><p class="text-small">Còn <b>${e.capacity - e.registered}</b> / ${e.capacity} chỗ</p>
      <button class="btn btn--primary btn--sm" data-ev="${e.id}" ${e.registered >= e.capacity ? "disabled" : ""}>${e.registered >= e.capacity ? "Hết chỗ" : "Đăng ký tham dự"}</button></div>`,
          )
          .join("")
      : '<p class="text-muted">Hiện chưa có sự kiện.</p>';
  }
  $("#publicEvents").addEventListener("click", async (e) => {
    const b = e.target.closest("[data-ev]");
    if (!b) return;
    const ev = await EventService.get(b.dataset.ev);
    const root = Modal.open({
      title: "Đăng ký: " + Format.escape(ev.title),
      body: `<form id="regForm" novalidate><div class="form-group"><label>Họ tên</label><input class="form-control" name="full_name"></div>
        <div class="form-row"><div class="form-group"><label>Số điện thoại</label><input class="form-control" name="phone"></div><div class="form-group"><label>Email</label><input class="form-control" name="email"></div></div>
        <div class="form-group"><label>Số người tham dự</label><input class="form-control" type="number" min="1" name="attendees" value="1"></div></form>`,
      footer: `<button class="btn btn--outline" data-close>Hủy</button><button class="btn btn--primary" id="regBtn">Xác nhận</button>`,
    });
    root.querySelector("#regBtn").onclick = async () => {
      const form = root.querySelector("#regForm"),
        data = Helpers.formData(form);
      const ok = Validation.showErrors(
        form,
        Validation.validate(data, {
          full_name: [[Validation.required, "Nhập họ tên"]],
          phone: [[Validation.phone, "SĐT không hợp lệ"]],
          email: [[Validation.email, "Email không hợp lệ"]],
          attendees: [[Validation.positive, "Tối thiểu 1 người"]],
        }),
      );
      if (!ok) return;
      try {
        const reg = await EventService.register(ev.id, data);
        Modal.open({ title: "Đăng ký thành công", body: `<div class="text-center" style="display:flex;flex-direction:column;align-items:center;gap:8px"><div id="qrBox"></div><b>${reg.code}</b><p class="text-small">Xuất trình mã này khi đến tham dự sự kiện.</p></div>`, footer: `<button class="btn btn--primary" data-close>Đóng</button>`, onOpen: () => Helpers.renderQR(document.getElementById("qrBox"), reg.code) });
        loadEvents();
      } catch (err) {
        Notify.error(err.message);
      }
    };
  });
  loadEvents();

  // Đoàn khách
  const gf = $("#groupForm");
  gf.visit_date.min = Format.isoDate();
  gf.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = Helpers.formData(gf);
    const ok = Validation.showErrors(
      gf,
      Validation.validate(data, {
        group_name: [[Validation.required, "Nhập tên đoàn"]],
        leader_name: [[Validation.required, "Nhập tên trưởng đoàn"]],
        phone: [[Validation.phone, "SĐT không hợp lệ"]],
        size: [[(v) => Number(v) >= 10, "Đoàn tối thiểu 10 người"]],
        visit_date: [[Validation.notPast, "Ngày không hợp lệ"]],
      }),
    );
    if (!ok) return;
    await VisitorService.save({ ...data, size: Number(data.size), guide_required: Number(data.guide_required) });
    gf.reset();
    Notify.success("Đã gửi đăng ký. Bảo tàng sẽ liên hệ xác nhận lịch.");
  });

  // Khảo sát
  $("#ratingFields").innerHTML = Object.entries(SurveyService.CRITERIA)
    .map(([k, l]) => `<div class="form-group"><label>${l}</label><div class="rating">${[5, 4, 3, 2, 1].map((n) => `<input type="radio" id="${k}${n}" name="${k}" value="${n}"><label for="${k}${n}">★</label>`).join("")}</div></div>`)
    .join("");
  const sf = $("#surveyForm");
  sf.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = Helpers.formData(sf);
    const missing = Object.keys(SurveyService.CRITERIA).filter((k) => !data[k]);
    if (missing.length) return Notify.warning("Vui lòng chấm điểm tất cả tiêu chí");
    Object.keys(SurveyService.CRITERIA).forEach((k) => (data[k] = Number(data[k])));
    data.ticket_code = (data.ticket_code || "").toUpperCase();
    await SurveyService.submit(data);
    sf.reset();
    Notify.success("Cảm ơn bạn đã đánh giá!");
  });

  // Tra cứu vé
  $("#lookupForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const t = await TicketService.findByCode(e.target.code.value);
    t ? showTicket(t) : Notify.error("Không tìm thấy vé");
  });
})();
