window.StatisticsService = {
  /** Tổng hợp số liệu. Backend thật nên có API /statistics trả về cùng cấu trúc */
  async overview(from, to) {
    if (!API_CONFIG.USE_MOCK) return ApiService.get(API_CONFIG.ENDPOINTS.STATISTICS, { from, to });
    const [tickets, types, events, groups, surveys] = await Promise.all([TicketService.list(), TicketService.types(), EventService.list(), VisitorService.list(), SurveyService.list()]);
    const inRange = (t) => (!from || t.visit_date >= from) && (!to || t.visit_date <= to);
    const valid = tickets.filter((t) => inRange(t) && ["paid", "used"].includes(t.status));
    const byDay = {};
    valid.forEach((t) => {
      byDay[t.visit_date] = (byDay[t.visit_date] || 0) + Number(t.quantity);
    });
    const byType = types.map((tp) => ({ name: tp.name, visitors: valid.filter((t) => t.ticket_type_id === tp.id).reduce((s, t) => s + Number(t.quantity), 0), revenue: valid.filter((t) => t.ticket_type_id === tp.id).reduce((s, t) => s + Number(t.total), 0) }));
    return {
      revenue: valid.reduce((s, t) => s + Number(t.total), 0),
      tickets: valid.length,
      visitors: valid.reduce((s, t) => s + Number(t.quantity), 0),
      checkedIn: valid.filter((t) => t.status === "used").reduce((s, t) => s + Number(t.quantity), 0),
      events: events.length,
      eventRegistrations: events.reduce((s, e) => s + Number(e.registered), 0),
      groups: groups.length,
      groupVisitors: groups.filter((g) => g.status !== "rejected").reduce((s, g) => s + Number(g.size), 0),
      survey: SurveyService.summary(surveys),
      byDay: Object.entries(byDay)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, visitors]) => ({ date, visitors })),
      byType,
    };
  },
};
