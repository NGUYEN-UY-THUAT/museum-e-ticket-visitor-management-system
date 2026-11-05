window.EventService = {
  list: (filter = {}) => ApiService.get(API_CONFIG.ENDPOINTS.EVENTS, filter),
  get: (id) => ApiService.get(`${API_CONFIG.ENDPOINTS.EVENTS}/${id}`),
  save: (e) => (e.id ? ApiService.put(`${API_CONFIG.ENDPOINTS.EVENTS}/${e.id}`, e) : ApiService.post(API_CONFIG.ENDPOINTS.EVENTS, { ...e, registered: 0 })),
  remove: (id) => ApiService.delete(`${API_CONFIG.ENDPOINTS.EVENTS}/${id}`),
  registrations: (event_id) => ApiService.get(API_CONFIG.ENDPOINTS.REGISTRATIONS, { event_id }),
  /** Khách đăng ký tham dự sự kiện, kiểm tra còn chỗ */
  async register(event_id, { full_name, email, phone, attendees = 1 }) {
    const ev = await this.get(event_id);
    const n = Number(attendees);
    if (ev.status !== "upcoming") throw new Error("Sự kiện không còn nhận đăng ký");
    if (ev.registered + n > ev.capacity) throw new Error(`Chỉ còn ${ev.capacity - ev.registered} chỗ`);
    const reg = await ApiService.post(API_CONFIG.ENDPOINTS.REGISTRATIONS, { event_id: Number(event_id), full_name, email, phone, attendees: n, code: Helpers.uid("EV").slice(0, 8), checked_in: 0 });
    await ApiService.put(`${API_CONFIG.ENDPOINTS.EVENTS}/${event_id}`, { registered: ev.registered + n });
    return reg;
  },
};
