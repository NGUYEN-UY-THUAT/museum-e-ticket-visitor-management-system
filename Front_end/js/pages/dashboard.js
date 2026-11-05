(async function () {
  if (!initLayout("dashboard", "Bảng điều khiển")) return;
  const today = Format.isoDate();
  document.getElementById("userName").textContent = AuthService.user().full_name;
  document.getElementById("todayText").textContent = new Date().toLocaleDateString("vi-VN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  try {
    const [tickets, checkins, events, groups, surveys] = await Promise.all([TicketService.list(), TicketService.checkins(), EventService.list({ status: "upcoming" }), VisitorService.list(), SurveyService.list()]);
    const todayTickets = tickets.filter((t) => t.visit_date === today && ["paid", "used"].includes(t.status));
    const visitors = todayTickets.reduce((s, t) => s + Number(t.quantity), 0);
    const inside = todayTickets.filter((t) => t.status === "used").reduce((s, t) => s + Number(t.quantity), 0);
    const sv = SurveyService.summary(surveys);
    const stats = [
      ["Khách đặt vé hôm nay", Format.number(visitors)],
      ["Đã vào cổng", Format.number(inside)],
      ["Doanh thu hôm nay", Format.currency(todayTickets.reduce((s, t) => s + Number(t.total), 0))],
      ["Hài lòng (≥4★)", Math.round(sv.satisfied * 100) + "%"],
    ];
    document.getElementById("statGrid").innerHTML = stats.map(([l, v]) => `<div class="stat-card"><div class="stat-card__label">${l}</div><div class="stat-card__value">${v}</div></div>`).join("");

    Helpers.renderTable(document.getElementById("recentCheckins"), checkins.slice(0, 6), (c) => `<tr><td>${Format.dateTime(c.checked_at)}</td><td>${c.ticket_code}</td><td>${c.gate}</td><td>${c.result === "ok" ? '<span class="badge badge--success">Hợp lệ</span>' : '<span class="badge badge--danger">Từ chối</span>'}</td></tr>`, 4);

    document.getElementById("upcomingEvents").innerHTML = events.length
      ? events
          .slice(0, 4)
          .map(
            (e) => `
      <div class="mini-event"><div><b>${Format.escape(e.title)}</b><div class="text-small text-muted">${Format.dateTime(e.start_time)} · ${Format.escape(e.location)}</div></div>
      <span class="badge badge--info">${e.registered}/${e.capacity}</span></div>`,
          )
          .join("")
      : '<div class="empty">Không có sự kiện</div>';

    Helpers.renderTable(
      document.getElementById("pendingGroups"),
      groups.filter((g) => g.status === "pending"),
      (g) => `<tr><td>${Format.escape(g.group_name)}</td><td>${g.size}</td><td>${Format.date(g.visit_date)}</td><td>${Format.escape(g.leader_name)}</td></tr>`,
      4,
    );
  } catch (e) {
    Notify.error(e.message);
  }
})();
