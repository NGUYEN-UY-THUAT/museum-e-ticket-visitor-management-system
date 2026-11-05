/* Cấu hình kết nối API backend (MySQL phía server). */
window.API_CONFIG = {
  BASE_URL: "http://localhost:8000/api",
  TIMEOUT: 15000,
  // true: dùng dữ liệu giả lưu trong localStorage để chạy thử khi chưa có backend
  USE_MOCK: true,
  ENDPOINTS: {
    LOGIN: "/auth/login",
    ME: "/auth/me",
    TICKET_TYPES: "/ticket-types",
    TICKETS: "/tickets",
    CHECKIN: "/checkins",
    EVENTS: "/events",
    REGISTRATIONS: "/event-registrations",
    GROUPS: "/groups",
    SURVEYS: "/surveys",
    STATISTICS: "/statistics",
    SETTINGS: "/settings",
    MUSEUMS: "/museums", // GET ?keyword=&city=&type=&sort=&openNow=&lat=&lng=&page=&pageSize=
    MUSEUM_STATS: "/museums/stats", // GET -> { partnerCount }
  },
};
