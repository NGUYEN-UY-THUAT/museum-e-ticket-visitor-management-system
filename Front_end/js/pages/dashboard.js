/* dashboard.js — Bảng điều khiển (pages/dashboard.html): số liệu hôm nay, việc cần xử lý, lượt vào, sự kiện sắp tới */
(async function () {
  const me = AdminShell.init("dashboard");
  if (!me) return;
  const $ = (id) => document.getElementById(id);
  const esc = (s) => Format.escape(s);
  const today = Format.isoDate();
  $("userName").textContent = me.full_name;
  $("todayText").textContent = new Date().toLocaleDateString("vi-VN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  try {
    const [tickets, checkins, events, groups, surveys, requests] = await Promise.all([
      TicketService.list(), TicketService.checkins(), EventService.list(), VisitorService.list(), SurveyService.list(), TicketService.requests({ status: "pending" }),
    ]);
    const todayTickets = tickets.filter((t) => t.visit_date === today && ["paid", "used"].includes(t.status));
    const visitors = todayTickets.reduce((s, t) => s + Number(t.quantity), 0);
    const inside = todayTickets.filter((t) => t.status === "used").reduce((s, t) => s + Number(t.quantity), 0);
    const revenue = tickets.filter((t) => ["paid", "used"].includes(t.status) && String(t.created_at).slice(0, 10) === today).reduce((s, t) => s + Number(t.total), 0);
    const sv = SurveyService.summary(surveys);
    const pendingGroups = groups.filter((g) => g.status === "pending");
    const unpaid = tickets.filter((t) => t.status === "pending");

    $("stats").innerHTML =
      AdminUI.stat("Khách tham quan hôm nay", "groups", Format.number(visitors), `${todayTickets.length} vé có ngày tham quan hôm nay`) +
      AdminUI.stat("Đã vào cổng", "how_to_reg", Format.number(inside), visitors ? `${Math.round((inside / visitors) * 100)}% khách đã đến` : "Chưa có khách", "adm-stat--ok") +
      AdminUI.stat("Doanh thu đặt trong ngày", "payments", Format.currency(revenue), "Vé đã thanh toán") +
      AdminUI.stat("Mức hài lòng", "sentiment_satisfied", Math.round(sv.satisfied * 100) + "%", `${sv.count} phản hồi khảo sát, ≥ 4 sao`);

    const todo = [
      [requests.length, "pending_actions", "Yêu cầu đổi giờ / hủy vé chờ duyệt", "orders.html?tab=request"],
      [pendingGroups.length, "groups", "Đoàn khách chờ duyệt lịch", "visitors.html?status=pending"],
      [unpaid.length, "hourglass_top", "Vé chờ thanh toán", "orders.html?tab=pending"],
    ];
    $("todo").innerHTML = todo.map(([n, icon, label, href]) => `<li><a class="db-todo__item${n ? " has-work" : ""}" href="${href}">
      <span class="material-symbols-outlined">${icon}</span><span class="flex-1">${label}</span><b>${n}</b><span class="material-symbols-outlined">chevron_right</span></a></li>`).join("");

    $("checkins").innerHTML = checkins.length
      ? checkins.sort((a, b) => String(b.checked_at).localeCompare(String(a.checked_at))).slice(0, 6).map((c) => `<tr>
          <td class="nowrap">${Format.dateTime(c.checked_at)}</td><td><span class="adm-code">${esc(c.ticket_code)}</span></td><td>${esc(c.gate)}</td><td>${esc(c.staff)}</td>
          <td>${AdminUI.badge(APP_CONFIG.CHECKIN_RESULT, c.result)}</td></tr>`).join("")
      : `<tr><td colspan="5" class="empty">Chưa có lượt vào nào</td></tr>`;

    const upcoming = events.filter((e) => ["upcoming", "ongoing"].includes(e.status)).sort((a, b) => String(a.start_time).localeCompare(String(b.start_time))).slice(0, 3);
    $("events").innerHTML = upcoming.length
      ? upcoming.map((e) => {
          const pct = Math.min(100, Math.round((e.registered / e.capacity) * 100));
          return `<article class="adm-panel db-event">
            <div class="flex items-center justify-between gap-2">${AdminUI.badge(APP_CONFIG.EVENT_STATUS, e.status)}<span class="hh-hint">${Format.dateTime(e.start_time)}</span></div>
            <h3>${esc(e.title)}</h3><p class="hh-hint"><span class="material-symbols-outlined">location_on</span>${esc(e.location)}</p>
            <div class="db-progress"><i style="width:${pct}%"></i></div><p class="hh-hint">${e.registered}/${e.capacity} người đăng ký</p>
            <a class="hh-btn hh-btn--soft hh-btn--sm mt-3" href="event-checkin.html?event_id=${e.id}"><span class="material-symbols-outlined">how_to_reg</span> Điểm danh</a></article>`;
        }).join("")
      : `<div class="adm-panel adm-empty-panel"><span class="material-symbols-outlined">event_busy</span>Không có sự kiện sắp tới</div>`;
  } catch (e) {
    Notify.error(e.message);
  }
})();
