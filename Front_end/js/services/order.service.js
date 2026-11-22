/* Đơn hàng (mỗi vé điện tử là một đơn) + yêu cầu đổi giờ / hủy vé của khách.
   Bảng MySQL: tickets, ticket_requests(id, ticket_id, type, status, ..., processed_by, processed_at, reject_reason). */
window.OrderService = (function () {
  const EP = () => API_CONFIG.ENDPOINTS;

  return {
    /** Toàn bộ đơn, kèm tên loại vé và các yêu cầu của từng vé */
    async list() {
      const [tickets, types, requests] = await Promise.all([
        ApiService.get(EP().TICKETS),
        ApiService.get(EP().TICKET_TYPES),
        ApiService.get(EP().TICKET_REQUESTS),
      ]);
      const typeName = Object.fromEntries(types.map((t) => [t.id, t.name]));
      return tickets.map((t) => {
        const reqs = requests.filter((r) => String(r.ticket_id) === String(t.id)).sort((a, b) => b.id - a.id);
        return { ...t, type_name: typeName[t.ticket_type_id] || "Vé tham quan", requests: reqs, pending_request: reqs.find((r) => r.status === "pending") || null };
      });
    },

    markPaid: (ticket) => ApiService.put(`${EP().TICKETS}/${ticket.id}`, { status: "paid" }),

    /** Duyệt yêu cầu: đổi giờ -> cập nhật ngày/khung giờ; hủy -> vé "cancelled" + ghi số tiền hoàn */
    async approve(req) {
      const staff = AuthService.user()?.username || "";
      if (req.type === "change") {
        await ApiService.put(`${EP().TICKETS}/${req.ticket_id}`, { visit_date: req.new_visit_date, time_slot: req.new_time_slot });
      } else {
        await ApiService.put(`${EP().TICKETS}/${req.ticket_id}`, { status: "cancelled", refunded_amount: req.refund_amount || 0 });
      }
      return ApiService.put(`${EP().TICKET_REQUESTS}/${req.id}`, { status: "approved", processed_by: staff, processed_at: new Date().toISOString() });
    },

    reject(req, reason) {
      const staff = AuthService.user()?.username || "";
      return ApiService.put(`${EP().TICKET_REQUESTS}/${req.id}`, { status: "rejected", reject_reason: reason, processed_by: staff, processed_at: new Date().toISOString() });
    },
  };
})();
