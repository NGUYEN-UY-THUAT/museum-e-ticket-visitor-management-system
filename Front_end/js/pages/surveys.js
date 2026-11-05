(async function () {
  if (!initLayout("surveys", "Khảo sát hài lòng")) return;
  const $ = Helpers.$;
  const stars = n => "★".repeat(n) + "☆".repeat(5 - n);
  const list = await SurveyService.list();
  const sum = SurveyService.summary(list);
  $("#summaryGrid").innerHTML = `<div class="stat-card"><div class="stat-card__label">Số phản hồi</div><div class="stat-card__value">${sum.count}</div></div>
    <div class="stat-card"><div class="stat-card__label">Tỷ lệ hài lòng</div><div class="stat-card__value">${Math.round(sum.satisfied * 100)}%</div></div>` +
    Object.entries(SurveyService.CRITERIA).map(([k, l]) => `<div class="stat-card"><div class="stat-card__label">${l}</div><div class="stat-card__value">${sum[k].toFixed(1)} <span class="stars">★</span></div></div>`).join("");
  function render() {
    const f = $("#ratingFilter").value;
    const rows = list.filter(s => !f || String(s.overall) === f);
    $("#surveyList").innerHTML = rows.length ? rows.map(s => `<div class="survey-item">
      <div class="survey-item__head"><b>${Format.escape(s.full_name || "Ẩn danh")}</b><span class="stars">${stars(Number(s.overall))}</span></div>
      <div class="text-small text-muted">${Format.date(s.created_at)}${s.ticket_code ? " · Vé " + s.ticket_code : ""} · Hiện vật ${s.exhibits}★ · Nhân viên ${s.staff}★ · Cơ sở vật chất ${s.facilities}★</div>
      ${s.comment ? `<p>${Format.escape(s.comment)}</p>` : ""}</div>`).join("") : '<div class="empty">Chưa có phản hồi</div>';
  }
  $("#ratingFilter").addEventListener("change", render);
  render();
})();
