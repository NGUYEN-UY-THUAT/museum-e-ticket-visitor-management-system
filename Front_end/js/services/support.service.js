/* Hỗ trợ khách hàng: gửi tin nhắn từ trang Liên hệ.
   Bảng MySQL dự kiến: contact_messages(id, full_name, email, phone, topic, ticket_code, message, status, created_at). */
window.SupportService = {
  sendMessage(data) {
    return ApiService.post(API_CONFIG.ENDPOINTS.CONTACT_MESSAGES, { ...data, status: "new" });
  },
  messages: (filter = {}) => ApiService.get(API_CONFIG.ENDPOINTS.CONTACT_MESSAGES, filter),
};
