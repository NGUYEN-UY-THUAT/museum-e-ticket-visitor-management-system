/* statistics.js — Thống kê (pages/statistics.html), chỉ quản trị viên. Biểu đồ dùng Chart.js (CDN). */
(function () {
  if (!AdminShell.init("statistics")) return;
  const $ = (id) => document.getElementById(id);
  const esc = (s) => Format.escape(s);
  const css = (v) => `rgb(${getComputedStyle(document.body).getPropertyValue(v).trim().replace(/ /g, ",")})`;
  let charts = [];
  let data = null;

  const setRange = (days) => {
    const from = new Date();
    from.setDate(from.getDate() - days);
    const to = new Date();
    to.setDate(to.getDate() + days);
    $("fromDate").value = Format.isoDate(from);
    $("toDate").value = Format.isoDate(to);
  };

  async function load() {
    if ($("toDate").value < $("fromDate").value) return Notify.error("Ngày kết thúc phải sau ngày bắt đầu");
    data = await StatisticsService.overview($("fromDate").value, $("toDate").value);
    $("stats").innerHTML =
      AdminUI.stat("Doanh thu", "payments", Format.currency(data.revenue), `${data.tickets} vé đã thanh toán`, "adm-stat--ok") +
      AdminUI.stat("Lượt khách", "groups", Format.number(data.visitors), `${Format.number(data.checkedIn)} khách đã vào cổng`) +
      AdminUI.stat("Khách theo đoàn", "diversity_3", Format.number(data.groupVisitors), `${data.groups} đoàn đăng ký`) +
      AdminUI.stat("Đăng ký sự kiện", "event_available", Format.number(data.eventRegistrations), `${data.events} sự kiện`) +
      AdminUI.stat("Điểm hài lòng", "star", data.survey.overall.toFixed(1) + "<small>/ 5</small>", `${data.survey.count} phản hồi`);
    const totalRev = data.byType.reduce((s, t) => s + t.revenue, 0);
    $("typeRows").innerHTML = data.byType.map((t) => `<tr><td class="strong">${esc(t.name)}</td><td class="num">${Format.number(t.visitors)}</td><td class="num">${Format.currency(t.revenue)}</td><td class="num">${totalRev ? Math.round((t.revenue / totalRev) * 100) : 0}%</td></tr>`).join("");

    charts.forEach((c) => c.destroy());
    charts = [];
    if (!window.Chart) {
      document.querySelectorAll(".st-chart").forEach((el) => (el.innerHTML = '<p class="hh-hint">Không tải được thư viện biểu đồ (Chart.js).</p>'));
      return;
    }
    Chart.defaults.font.family = "'Be Vietnam Pro', system-ui, sans-serif";
    charts.push(new Chart($("dayChart"), {
      type: "bar",
      data: { labels: data.byDay.map((x) => Format.date(x.date)), datasets: [{ label: "Lượt khách", data: data.byDay.map((x) => x.visitors), backgroundColor: css("--hh-primary"), borderRadius: 6, maxBarThickness: 36 }] },
      options: { maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { precision: 0 } }, x: { grid: { display: false } } } },
    }));
    charts.push(new Chart($("typeChart"), {
      type: "doughnut",
      data: { labels: data.byType.map((x) => x.name), datasets: [{ data: data.byType.map((x) => x.revenue), backgroundColor: [css("--hh-primary"), css("--hh-secondary"), css("--hh-secondary-fixed-dim"), css("--hh-on-primary-container"), css("--hh-tertiary-container")], borderWidth: 2 }] },
      options: { maintainAspectRatio: false, cutout: "62%", plugins: { legend: { position: "bottom" } } },
    }));
  }

  document.querySelectorAll("[data-range]").forEach((b) => b.addEventListener("click", () => (setRange(Number(b.dataset.range)), load())));
  $("applyBtn").addEventListener("click", load);
  $("exportBtn").addEventListener("click", () => {
    if (!data) return;
    AdminUI.downloadCsv(`thong-ke_${$("fromDate").value}_${$("toDate").value}.csv`, [
      ["Từ ngày", $("fromDate").value, "Đến ngày", $("toDate").value], ["Doanh thu", data.revenue], ["Lượt khách", data.visitors], [],
      ["Loại vé", "Lượt khách", "Doanh thu"], ...data.byType.map((t) => [t.name, t.visitors, t.revenue]), [],
      ["Ngày", "Lượt khách"], ...data.byDay.map((x) => [x.date, x.visitors]),
    ]);
  });
  setRange(30);
  load().catch((e) => Notify.error(e.message));
})();
