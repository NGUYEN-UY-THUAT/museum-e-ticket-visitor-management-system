/* event-checkin.js — Điểm danh sự kiện (pages/event-checkin.html)
   Dữ liệu: events + event-registrations (cột checked_in 0/1, checked_in_at). Quét QR bằng thư viện html5-qrcode. */
(function () {
  if (!AdminShell.init("event-checkin")) return;
  const $ = (id) => document.getElementById(id);
  const esc = (s) => Format.escape(s);
  const PAGE_SIZE = 8;
  let events = [];
  let event = null;
  let regs = [];
  let tab = "all";
  let page = 1;
  let scanner = null;
  let lastScan = { code: "", at: 0 };

  const people = (list) => list.reduce((s, r) => s + Number(r.attendees || 1), 0);
  const timeOf = (v) => (v ? new Date(v).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", hour12: false }) : "");

  function renderCounts() {
    const inList = regs.filter((r) => r.checked_in);
    $("cntIn").innerHTML = `${people(inList)}<small> / ${people(regs)} khách</small>`;
    $("cntWait").innerHTML = `${people(regs) - people(inList)}<small> khách</small>`;
    const counts = { all: regs.length, in: inList.length, wait: regs.length - inList.length };
    document.querySelectorAll("[data-count]").forEach((el) => (el.textContent = `(${counts[el.dataset.count]})`));
  }

  function filtered() {
    const q = Helpers.normalizeText($("keyword").value);
    return regs.filter((r) => (tab === "all" || (tab === "in" ? r.checked_in : !r.checked_in)) && (!q || Helpers.normalizeText(`${r.full_name} ${r.phone} ${r.code}`).includes(q)));
  }

  function renderTable() {
    renderCounts();
    const list = filtered();
    const pg = AdminUI.paginate(list, page, PAGE_SIZE);
    page = pg.page;
    $("rows").innerHTML = pg.items.length
      ? pg.items.map((r) => `<tr>
          <td><div class="adm-person"><span class="adm-avatar${r.checked_in ? "" : " ec-avatar--wait"}">${esc(AdminShell.initials(r.full_name))}</span>
            <span class="min-w-0"><span class="adm-person__name">${esc(r.full_name)}</span><span class="adm-person__sub"><span class="adm-code">${esc(r.code)}</span></span></span></div></td>
          <td class="num">${r.attendees}</td>
          <td class="nowrap">${esc(r.phone)}</td>
          <td class="nowrap">${r.checked_in ? timeOf(r.checked_in_at) : '<span class="muted">—</span>'}</td>
          <td>${r.checked_in ? '<span class="hh-badge hh-badge--success">Đã tham dự</span>' : '<span class="hh-badge hh-badge--warning">Chưa đến</span>'}</td>
          <td class="num">${r.checked_in
            ? `<button class="hh-btn hh-btn--ghost hh-btn--sm" type="button" data-undo="${r.id}">Hoàn tác</button>`
            : `<button class="hh-btn hh-btn--primary hh-btn--sm" type="button" data-in="${r.id}"><span class="material-symbols-outlined">how_to_reg</span> Điểm danh</button>`}</td></tr>`).join("")
      : `<tr><td colspan="6" class="empty">${regs.length ? "Không có khách phù hợp" : "Sự kiện chưa có người đăng ký"}</td></tr>`;
    AdminUI.pager($("pager"), { ...pg, total: list.length, unit: "lượt đăng ký" }, (p) => ((page = p), renderTable()));
    $("rows").querySelectorAll("[data-in]").forEach((b) => b.addEventListener("click", () => checkIn(regs.find((r) => String(r.id) === b.dataset.in), "manual")));
    $("rows").querySelectorAll("[data-undo]").forEach((b) => b.addEventListener("click", () => undo(regs.find((r) => String(r.id) === b.dataset.undo))));
  }

  function showResult(type, title, r, note = "") {
    const icon = { ok: "check_circle", warn: "warning", err: "error" }[type];
    const cls = { ok: "success", warn: "info", err: "danger" }[type];
    $("result").innerHTML = `<div class="hh-alert hh-alert--${cls} ec-result">
      <span class="material-symbols-outlined">${icon}</span>
      <div class="min-w-0"><p class="ec-result__title">${esc(title)}</p>
        ${r ? `<p><b>${esc(r.full_name)}</b> · ${esc(r.code)} · ${r.attendees} người</p>` : ""}${note ? `<p>${esc(note)}</p>` : ""}</div></div>`;
  }

  async function checkIn(r, via) {
    if (!r) return;
    if (r.checked_in) return showResult("warn", "Khách đã điểm danh trước đó", r, `Lúc ${timeOf(r.checked_in_at)}`);
    try {
      await ApiService.put(`${API_CONFIG.ENDPOINTS.REGISTRATIONS}/${r.id}`, { checked_in: 1, checked_in_at: new Date().toISOString(), checked_in_by: AuthService.user()?.username || "" });
      showResult("ok", "Điểm danh thành công", r, r.attendees > 1 ? `Đi cùng ${r.attendees - 1} người` : "");
      if (via === "manual") Notify.success("Đã điểm danh " + r.full_name);
      await loadRegs();
    } catch (err) {
      Notify.error(err.message);
    }
  }

  async function undo(r) {
    if (!(await Modal.confirm(`Hủy điểm danh của ${r.full_name}?`, "Hoàn tác điểm danh"))) return;
    await ApiService.put(`${API_CONFIG.ENDPOINTS.REGISTRATIONS}/${r.id}`, { checked_in: 0, checked_in_at: null });
    Notify.info("Đã hoàn tác điểm danh");
    await loadRegs();
  }

  /** Xử lý mã từ máy quét hoặc ô nhập: chỉ nhận mã thuộc sự kiện đang chọn */
  async function handleCode(raw) {
    const code = String(raw || "").trim().toUpperCase();
    if (!code) return;
    const r = regs.find((x) => x.code.toUpperCase() === code);
    if (r) return checkIn(r, "scan");
    const all = await ApiService.get(API_CONFIG.ENDPOINTS.REGISTRATIONS);
    const other = all.find((x) => x.code.toUpperCase() === code);
    if (other) {
      const ev = events.find((e) => String(e.id) === String(other.event_id));
      return showResult("err", "Mã thuộc sự kiện khác", other, ev ? `Sự kiện: ${ev.title}` : "");
    }
    showResult("err", "Không tìm thấy mã đăng ký", null, `Mã “${code}” không có trong hệ thống`);
  }

  async function startCam() {
    if (!window.Html5Qrcode) return Notify.error("Không tải được thư viện quét QR, hãy nhập mã thủ công");
    try {
      $("reader").innerHTML = "";
      scanner = new Html5Qrcode("reader");
      await scanner.start({ facingMode: "environment" }, { fps: 10, qrbox: 220 }, (text) => {
        // tránh xử lý một mã nhiều lần liên tiếp
        if (text === lastScan.code && Date.now() - lastScan.at < 3000) return;
        lastScan = { code: text, at: Date.now() };
        handleCode(text);
      });
      $("camOn").disabled = true;
      $("camOff").disabled = false;
      $("camState").className = "hh-badge hh-badge--success";
      $("camState").textContent = "Đang quét";
    } catch (e) {
      Notify.error("Không mở được camera: " + e);
      stopCam();
    }
  }
  async function stopCam() {
    try { if (scanner) await scanner.stop(); } catch {}
    scanner = null;
    $("reader").innerHTML = `<div class="ec-reader__idle"><span class="material-symbols-outlined">qr_code_2</span><p>Bật camera rồi đưa mã QR trong email đăng ký vào khung hình</p></div>`;
    $("camOn").disabled = false;
    $("camOff").disabled = true;
    $("camState").className = "hh-badge hh-badge--muted";
    $("camState").textContent = "Camera tắt";
  }

  async function loadRegs() {
    regs = (await EventService.registrations(String(event.id))).sort((a, b) => a.full_name.localeCompare(b.full_name, "vi"));
    renderTable();
  }

  function selectEvent(id) {
    event = events.find((e) => String(e.id) === String(id));
    const st = APP_CONFIG.EVENT_STATUS[event.status]?.label || event.status;
    $("eventInfo").textContent = `${Format.dateTime(event.start_time)} · ${event.location} · ${st}`;
    $("result").innerHTML = "";
    page = 1;
    history.replaceState(null, "", "?event_id=" + event.id);
    return loadRegs();
  }

  $("eventSelect").addEventListener("change", (e) => selectEvent(e.target.value));
  $("manualForm").addEventListener("submit", (e) => {
    e.preventDefault();
    handleCode(e.target.code.value);
    e.target.code.value = "";
  });
  $("camOn").addEventListener("click", startCam);
  $("camOff").addEventListener("click", stopCam);
  $("keyword").addEventListener("input", Helpers.debounce(() => ((page = 1), renderTable()), 200));
  document.querySelectorAll("#tabs [data-tab]").forEach((b) => b.addEventListener("click", () => {
    tab = b.dataset.tab;
    page = 1;
    document.querySelectorAll("#tabs [data-tab]").forEach((x) => x.classList.toggle("is-active", x === b));
    renderTable();
  }));
  $("exportBtn").addEventListener("click", () => {
    AdminUI.downloadCsv(`diem-danh-su-kien-${event.id}.csv`, [["Sự kiện", "Mã đăng ký", "Họ tên", "Số người", "Điện thoại", "Email", "Trạng thái", "Giờ đến"],
      ...regs.map((r) => [event.title, r.code, r.full_name, r.attendees, r.phone, r.email, r.checked_in ? "Đã tham dự" : "Chưa đến", r.checked_in ? Format.dateTime(r.checked_in_at) : ""])]);
  });

  EventService.list()
    .then((list) => {
      // sự kiện đang diễn ra / sắp tới lên đầu, đã hủy thì bỏ
      const order = { ongoing: 0, upcoming: 1, finished: 2 };
      events = list.filter((e) => e.status !== "cancelled").sort((a, b) => order[a.status] - order[b.status] || String(a.start_time).localeCompare(String(b.start_time)));
      if (!events.length) {
        $("eventSelect").innerHTML = `<option>Chưa có sự kiện</option>`;
        return renderTable();
      }
      $("eventSelect").innerHTML = events.map((e) => `<option value="${e.id}">${esc(e.title)} – ${Format.date(e.start_time)}</option>`).join("");
      const want = Helpers.param("event_id");
      const first = events.find((e) => String(e.id) === want) || events[0];
      $("eventSelect").value = first.id;
      return selectEvent(first.id);
    })
    .catch((err) => Notify.error(err.message));
  window.addEventListener("beforeunload", () => scanner && scanner.stop());
})();
