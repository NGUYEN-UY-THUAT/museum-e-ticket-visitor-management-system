/* surveys.js — Kết quả khảo sát (pages/surveys.html). Bảng MySQL: surveys(ticket_code, full_name, overall, exhibits, staff, facilities, comment, created_at) */
(function () {
  const user = AdminShell.init("surveys");
  if (!user) return;
  const $ = (id) => document.getElementById(id);
  const esc = (s) => Format.escape(s);
  const C = SurveyService.CRITERIA;
  const PAGE = 6;
  let surveys = [];
  let page = 1;

  if (user.role !== "admin") $("builderLink").remove();
  const stars = (n) => "★".repeat(n) + `<i>${"★".repeat(5 - n)}</i>`;
  const one = (n) => (Math.round(n * 10) / 10).toLocaleString("vi-VN", { minimumFractionDigits: 1 });

  function filtered() {
    const r = $("rating").value;
    return surveys.filter((s) => (!r || (r === "low" ? s.overall <= 2 : r === "high" ? s.overall >= 4 : String(s.overall) === r)) && (!$("onlyComment").checked || String(s.comment || "").trim()));
  }

  function render() {
    const sum = SurveyService.summary(surveys);
    const week = surveys.filter((s) => String(s.created_at).slice(0, 10) >= Format.isoDate(new Date(Date.now() - 6 * 864e5)));
    const low = surveys.filter((s) => s.overall <= 2).length;
    $("stats").innerHTML =
      AdminUI.stat("Lượt phản hồi", "forum", Format.number(sum.count), `${week.length} lượt trong 7 ngày`) +
      AdminUI.stat("Điểm trung bình", "star", sum.count ? `${one(sum.overall)}<small>/ 5</small>` : "—", "Đánh giá chung") +
      AdminUI.stat("Khách hài lòng", "sentiment_satisfied", sum.count ? Math.round(sum.satisfied * 100) + "%" : "—", "Chấm 4–5 sao", "adm-stat--ok") +
      AdminUI.stat("Cần xử lý", "sentiment_dissatisfied", Format.number(low), "Đánh giá 1–2 sao", low ? "adm-stat--warn" : "");
    $("criteria").innerHTML = Object.entries(C).map(([k, label]) => `<div><div class="sv-crit__top"><span>${esc(label)}</span><b>${sum.count ? one(sum[k]) : "—"}</b></div><div class="sv-bar"><div style="width:${(sum[k] / 5) * 100}%"></div></div></div>`).join("");
    $("dist").innerHTML = [5, 4, 3, 2, 1].map((n) => {
      const c = surveys.filter((s) => Number(s.overall) === n).length;
      return `<div class="sv-dist__row"><span>${n} ★</span><div class="sv-bar"><div style="width:${surveys.length ? (c / surveys.length) * 100 : 0}%"></div></div><span>${c}</span></div>`;
    }).join("");

    const list = filtered();
    const pg = AdminUI.paginate(list, page, PAGE);
    page = pg.page;
    $("list").innerHTML = pg.items.map((s) => `<li class="sv-item${s.overall <= 2 ? " sv-item--low" : ""}">
        <div class="sv-item__head"><span class="sv-item__name">${esc(s.full_name || "Ẩn danh")}</span><span class="sv-stars" aria-label="${s.overall} sao">${stars(Number(s.overall))}</span>
          ${s.ticket_code ? `<span class="adm-code">${esc(s.ticket_code)}</span>` : ""}<span class="muted text-[13px]">${Format.date(s.created_at)}</span></div>
        ${s.comment ? `<p class="sv-item__comment">${esc(s.comment)}</p>` : `<p class="muted text-[13px]">Không có góp ý</p>`}
        <div class="sv-item__scores">${Object.entries(C).filter(([k]) => k !== "overall").map(([k, l]) => `<span class="sv-chip">${esc(l)}: <b>${s[k]}</b></span>`).join("")}</div></li>`).join("") || `<li class="empty">Không có phản hồi phù hợp</li>`;
    AdminUI.pager($("pager"), { ...pg, total: list.length, unit: "phản hồi" }, (p) => ((page = p), render()));
  }

  $("rating").addEventListener("change", () => ((page = 1), render()));
  $("onlyComment").addEventListener("change", () => ((page = 1), render()));
  $("exportBtn").addEventListener("click", () => AdminUI.downloadCsv(`khao-sat-${Format.isoDate()}.csv`, [["Ngày", "Khách", "Mã vé", ...Object.values(C), "Góp ý"],
    ...filtered().map((s) => [Format.date(s.created_at), s.full_name, s.ticket_code, ...Object.keys(C).map((k) => s[k]), s.comment])]));

  SurveyService.list().then((l) => {
    surveys = l.sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
    render();
  }).catch((e) => Notify.error(e.message));
})();
