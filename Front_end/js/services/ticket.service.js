/* Thay cho vehicle.service.js trong mẫu: đặt vé, phát hành vé QR, soát vé */
window.TicketService = {
  types: async () => (await ApiService.get(API_CONFIG.ENDPOINTS.TICKET_TYPES)).sort((a, b) => a.id - b.id),
  saveType: (t) => (t.id ? ApiService.put(`${API_CONFIG.ENDPOINTS.TICKET_TYPES}/${t.id}`, t) : ApiService.post(API_CONFIG.ENDPOINTS.TICKET_TYPES, t)),
  list: (filter = {}) => ApiService.get(API_CONFIG.ENDPOINTS.TICKETS, filter),
  get: (id) => ApiService.get(`${API_CONFIG.ENDPOINTS.TICKETS}/${id}`),
  async findByCode(code) {
    const list = await ApiService.get(API_CONFIG.ENDPOINTS.TICKETS, { code: code.trim().toUpperCase() });
    return list[0] || null;
  },
  /** Đặt vé: tính tổng tiền, sinh mã vé dùng cho QR */
  async book({ customer_name, email, phone, ticket_type_id, quantity, visit_date, paid = true }) {
    const types = await this.types();
    const type = types.find((t) => String(t.id) === String(ticket_type_id));
    if (!type) throw new Error("Loại vé không hợp lệ");
    return ApiService.post(API_CONFIG.ENDPOINTS.TICKETS, {
      code: Helpers.uid("TK").slice(0, 10),
      customer_name,
      email,
      phone,
      ticket_type_id: Number(ticket_type_id),
      quantity: Number(quantity),
      visit_date,
      total: type.price * Number(quantity),
      status: paid ? "paid" : "pending",
    });
  },
  update: (id, data) => ApiService.put(`${API_CONFIG.ENDPOINTS.TICKETS}/${id}`, data),
  cancel(id) {
    return this.update(id, { status: "cancelled" });
  },
  markPaid(id) {
    return this.update(id, { status: "paid" });
  },
  /** Kiểm soát lượt vào: kiểm tra mã QR và ghi nhận lượt vào */
  async checkIn(code, gate = "Cổng A") {
    const staff = AuthService.user()?.username || "";
    const ticket = await this.findByCode(code);
    const log = (result) => ApiService.post(API_CONFIG.ENDPOINTS.CHECKIN, { ticket_code: code.toUpperCase(), gate, staff, checked_at: new Date().toISOString(), result });
    if (!ticket) {
      await log("not_found");
      return { ok: false, message: "Không tìm thấy vé" };
    }
    if (ticket.status === "used") {
      await log("used");
      return { ok: false, ticket, message: "Vé đã được sử dụng lúc " + Format.dateTime(ticket.used_at) };
    }
    if (ticket.status === "cancelled") {
      await log("cancelled");
      return { ok: false, ticket, message: "Vé đã bị hủy" };
    }
    if (ticket.status === "pending") {
      await log("unpaid");
      return { ok: false, ticket, message: "Vé chưa thanh toán" };
    }
    if (ticket.visit_date !== Format.isoDate()) {
      await log("wrong_date");
      return { ok: false, ticket, message: "Vé dành cho ngày " + Format.date(ticket.visit_date) };
    }
    await this.update(ticket.id, { status: "used", used_at: new Date().toISOString() });
    await log("ok");
    return { ok: true, ticket, message: `Hợp lệ - ${ticket.quantity} khách` };
  },
  /** Tra cứu vé không cần tài khoản: theo mã vé, email hoặc số điện thoại */
  async lookup(keyword) {
    const k = String(keyword || "").trim();
    if (!k) return [];
    if (/^TK/i.test(k)) {
      const t = await this.findByCode(k);
      return t ? [t] : [];
    }
    const field = k.includes("@") ? "email" : "phone";
    return ApiService.get(API_CONFIG.ENDPOINTS.TICKETS, { [field]: field === "email" ? k.toLowerCase() : k.replace(/\s/g, "") });
  },
  /** Yêu cầu đổi giờ / hủy vé (cán bộ duyệt ở trang quản trị) */
  createRequest(data) {
    return ApiService.post(API_CONFIG.ENDPOINTS.TICKET_REQUESTS, { ...data, status: "pending" });
  },
  requests: (filter = {}) => ApiService.get(API_CONFIG.ENDPOINTS.TICKET_REQUESTS, filter),
  checkins: (filter = {}) => ApiService.get(API_CONFIG.ENDPOINTS.CHECKIN, filter),
};
