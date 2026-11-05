(async function () {
  if (!initLayout("checkin", "Kiểm soát lượt vào")) return;
  const $ = Helpers.$;
  const LABEL = { ok: "Hợp lệ", used: "Đã dùng", cancelled: "Vé hủy", unpaid: "Chưa thanh toán", wrong_date: "Sai ngày", not_found: "Không tồn tại" };
  let scanner = null,
    busy = false,
    lastCode = "",
    lastAt = 0;

  async function loadLog() {
    const today = Format.isoDate();
    const logs = (await TicketService.checkins()).filter((l) => l.checked_at.slice(0, 10) === today);
    $("#todayCount").textContent = logs.filter((l) => l.result === "ok").length;
    $("#rejectCount").textContent = logs.filter((l) => l.result !== "ok").length;
    Helpers.renderTable($("#logBody"), logs.slice(0, 30), (l) => `<tr><td>${Format.dateTime(l.checked_at)}</td><td>${l.ticket_code}</td><td>${l.gate}</td><td>${l.staff}</td><td><span class="badge badge--${l.result === "ok" ? "success" : "danger"}">${LABEL[l.result] || l.result}</span></td></tr>`, 5);
  }

  async function check(code) {
    code = String(code || "").trim();
    if (!code || busy) return;
    if (code === lastCode && Date.now() - lastAt < 3000) return; // tránh quét trùng liên tục
    busy = true;
    lastCode = code;
    lastAt = Date.now();
    try {
      const r = await TicketService.checkIn(code, $("#gateSelect").value);
      $("#result").className = "checkin-result " + (r.ok ? "is-ok" : "is-fail");
      $("#result").innerHTML = `<div class="checkin-result__icon">${r.ok ? "✔" : "✖"}</div><div class="checkin-result__msg">${r.message}</div>
        <div>${code.toUpperCase()}${r.ticket ? " · " + Format.escape(r.ticket.customer_name) : ""}</div>`;
      loadLog();
    } catch (e) {
      Notify.error(e.message);
    } finally {
      busy = false;
    }
  }

  $("#manualForm").addEventListener("submit", (e) => {
    e.preventDefault();
    check(e.target.code.value);
    e.target.reset();
  });
  $("#startScan").onclick = async () => {
    if (!window.Html5Qrcode) return Notify.error("Không tải được thư viện quét QR");
    try {
      scanner = new Html5Qrcode("reader");
      await scanner.start({ facingMode: "environment" }, { fps: 10, qrbox: 220 }, (text) => check(text));
      $("#startScan").disabled = true;
      $("#stopScan").disabled = false;
    } catch (e) {
      Notify.error("Không mở được camera: " + e);
    }
  };
  $("#stopScan").onclick = async () => {
    await scanner?.stop();
    $("#startScan").disabled = false;
    $("#stopScan").disabled = true;
  };
  loadLog();
})();
