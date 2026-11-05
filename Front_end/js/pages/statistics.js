(async function () {
  if (!initLayout("statistics", "Thống kê", true)) return;
  const $ = Helpers.$;
  const d = new Date();
  d.setDate(d.getDate() - 30);
  $("#fromDate").value = Format.isoDate(d);
  const e = new Date();
  e.setDate(e.getDate() + 30);
  $("#toDate").value = Format.isoDate(e);
  let charts = [],
    data = null;

  async function load() {
    data = await StatisticsService.overview($("#fromDate").value, $("#toDate").value);
    const cards = [
      ["Doanh thu", Format.currency(data.revenue)],
      ["Lượt khách (vé)", Format.number(data.visitors)],
      ["Đã vào cổng", Format.number(data.checkedIn)],
      ["Khách theo đoàn", Format.number(data.groupVisitors)],
      ["Đăng ký sự kiện", Format.number(data.eventRegistrations)],
      ["Điểm hài lòng", data.survey.overall.toFixed(1) + " / 5"],
    ];
    $("#statGrid").innerHTML = cards.map(([l, v]) => `<div class="stat-card"><div class="stat-card__label">${l}</div><div class="stat-card__value">${v}</div></div>`).join("");
    Helpers.renderTable($("#typeBody"), data.byType, (t) => `<tr><td>${t.name}</td><td>${Format.number(t.visitors)}</td><td>${Format.currency(t.revenue)}</td></tr>`, 3);
    charts.forEach((c) => c.destroy());
    charts = [];
    if (!window.Chart) return;
    charts.push(new Chart($("#dayChart"), { type: "bar", data: { labels: data.byDay.map((x) => Format.date(x.date)), datasets: [{ label: "Lượt khách", data: data.byDay.map((x) => x.visitors), backgroundColor: "#8b5e34", borderRadius: 4 }] }, options: { plugins: { legend: { display: false } } } }));
    charts.push(new Chart($("#typeChart"), { type: "doughnut", data: { labels: data.byType.map((x) => x.name), datasets: [{ data: data.byType.map((x) => x.revenue), backgroundColor: ["#8b5e34", "#2f6f73", "#d9a441", "#a3445d"] }] } }));
  }
  $("#applyBtn").onclick = load;
  $("#exportBtn").onclick = () => {
    if (!data) return;
    const rows = [["Loại vé", "Lượt khách", "Doanh thu"], ...data.byType.map((t) => [t.name, t.visitors, t.revenue]), [], ["Ngày", "Lượt khách"], ...data.byDay.map((x) => [x.date, x.visitors])];
    const csv = "﻿" + rows.map((r) => r.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = `thong-ke_${$("#fromDate").value}_${$("#toDate").value}.csv`;
    a.click();
  };
  load();
})();
