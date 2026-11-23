/* checkin.js — Soát vé tại cổng (pages/checkin.html). Bảng MySQL: checkins(ticket_code, gate, staff, checked_at, result) */
(function () {
  if (!AdminShell.init("checkin")) return;
  const $ = (id) => document.getElementById(id);
  const esc = (s) => Format.escape(s);
  const R = APP_CONFIG.CHECKIN_RESULT;
  const PAGE = 10;
  let logs = [];
  let page = 1;
  let scanner = null;
  let lastScan = { code: "", at: 0 };
  const GATE_KEY = "museum_gate";

  $("gate").innerHTML = APP_CONFIG.GATES.map((g) => `<option>${esc(g)}</option>`).join("");
  try { const g = localStorage.getItem(GATE_KEY); if (g && APP_CONFIG.GATES.includes(g)) $("gate").value = g; } catch {}
  $("gate").addEventListener("change", () => { try { localStorage.setItem(GATE_KEY, $("gate").value); } catch {} });
  $("resultFilter").innerHTML += Object.entries(R).map(([k, v]) => `<option value="${k}">${esc(v.label)}</option>`).join("");

  const today = () => logs.filter((l) => String(l.checked_at).slice(0, 10) === Format.isoDate());
  const time = (t) => new Date(t).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  function render() {
    const list = today();
    const ok = list.filter((l) => l.result === "ok");
    $("stats").innerHTML =
      AdminUI.stat("Lượt hợp lệ hôm nay", "how_to_reg", Format.number(ok.length), "", "adm-stat--ok") +
      AdminUI.stat("Lượt bị từ chối", "block", Format.number(list.length - ok.length), "Vé đã dùng, đã hủy, sai ngày…", list.length - ok.length ? "adm-stat--warn" : "") +
      AdminUI.stat("Tại cổng của bạn", "door_front", Format.number(ok.filter((l) => l.gate === $("gate").value).length), esc($("gate").value));
    const f = $("resultFilter").value;
    const rows = list.filter((l) => !f || l.result === f).sort((a, b) => String(b.checked_at).localeCompare(String(a.checked_at)));
    const pg = AdminUI.paginate(rows, page, PAGE);
    $("rows").innerHTML = pg.items.map((l) => `<tr><td>${time(l.checked_at)}</td><td><span class="adm-code">${esc(l.ticket_code)}</span></td><td>${esc(l.gate)}</td><td class="muted">${esc(l.staff || "—")}</td><td>${AdminUI.badge(R, l.result)}</td></tr>`).join("") || `<tr><td colspan="5" class="empty">Chưa có lượt soát vé nào hôm nay</td></tr>`;
    AdminUI.pager($("pager"), { ...pg, total: rows.length, unit: "lượt" }, (p) => ((page = p), render()));
  }

  function showResult(res) {
    const t = res.ticket;
    const kind = res.ok ? "ok" : t && t.status === "used" ? "warn" : "err";
    const icon = { ok: "verified", warn: "history", err: "gpp_bad" }[kind];
    $("result").className = "ci-result ci-result--" + kind;
    $("result").innerHTML = `<span class="material-symbols-outlined">${icon}</span>
      <div class="min-w-0"><p class="ci-result__title">${res.ok ? "Mời khách vào" : "Không cho vào"} · ${esc(res.message)}</p>
      ${t ? `<p><b>${esc(t.code)}</b> · ${esc(t.customer_name)} · ${t.quantity} khách · ${Format.date(t.visit_date)}${t.time_slot ? " · " + esc(t.time_slot) : ""}</p>` : ""}</div>`;
  }

  async function handle(code) {
    code = String(code || "").trim().toUpperCase();
    if (!code) return Notify.error("Vui lòng nhập mã vé");
    try {
      showResult(await TicketService.checkIn(code, $("gate").value));
      await load();
    } catch (e) { Notify.error(e.message); }
  }

  $("manualForm").addEventListener("submit", (e) => {
    e.preventDefault();
    handle($("code").value);
    $("code").value = "";
    $("code").focus();
  });

  function idle() { $("reader").innerHTML = `<div class="ec-reader__idle"><span class="material-symbols-outlined">qr_code_2</span><p>Bật camera rồi đưa mã QR trên vé điện tử vào khung hình</p></div>`; }
  async function stopCam() {
    try { if (scanner) await scanner.stop(); } catch {}
    scanner = null;
    idle();
    $("camOn").disabled = false;
    $("camOff").disabled = true;
    $("camState").className = "hh-badge hh-badge--muted";
    $("camState").textContent = "Camera tắt";
  }
  async function startCam() {
    if (!window.Html5Qrcode) return Notify.error("Không tải được thư viện quét QR, hãy nhập mã thủ công");
    try {
      $("reader").innerHTML = "";
      scanner = new Html5Qrcode("reader");
      await scanner.start({ facingMode: "environment" }, { fps: 10, qrbox: 220 }, (text) => {
        if (text === lastScan.code && Date.now() - lastScan.at < 3000) return;
        lastScan = { code: text, at: Date.now() };
        handle(text);
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
  $("camOn").addEventListener("click", startCam);
  $("camOff").addEventListener("click", stopCam);
  $("resultFilter").addEventListener("change", () => ((page = 1), render()));
  $("gate").addEventListener("change", render);
  window.addEventListener("beforeunload", () => scanner && scanner.stop());

  async function load() {
    logs = await TicketService.checkins();
    render();
  }
  load().catch((e) => Notify.error(e.message));
})();
