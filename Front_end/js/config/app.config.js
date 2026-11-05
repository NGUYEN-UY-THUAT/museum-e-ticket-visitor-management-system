window.APP_CONFIG = {
  APP_NAME: "Bảo tàng Số",
  TOKEN_KEY: "museum_token",
  USER_KEY: "museum_user",
  PAGE_SIZE: 10,
  ROLES: { ADMIN: "admin", STAFF: "staff" },
  TICKET_STATUS: {
    paid: { label: "Đã thanh toán", badge: "success" },
    pending: { label: "Chờ thanh toán", badge: "warning" },
    used: { label: "Đã vào cổng", badge: "info" },
    cancelled: { label: "Đã hủy", badge: "danger" },
    expired: { label: "Hết hạn", badge: "muted" },
  },
  EVENT_STATUS: {
    upcoming: { label: "Sắp diễn ra", badge: "info" },
    ongoing: { label: "Đang diễn ra", badge: "success" },
    finished: { label: "Đã kết thúc", badge: "muted" },
    cancelled: { label: "Đã hủy", badge: "danger" },
  },
  GROUP_STATUS: {
    pending: { label: "Chờ duyệt", badge: "warning" },
    approved: { label: "Đã duyệt", badge: "success" },
    visited: { label: "Đã tham quan", badge: "info" },
    rejected: { label: "Từ chối", badge: "danger" },
  },
  MENU: [
    { section: "Tổng quan" },
    { key: "dashboard", label: "Bảng điều khiển", icon: "🏛️", href: "dashboard.html" },
    { key: "statistics", label: "Thống kê", icon: "📊", href: "statistics.html" },
    { section: "Vận hành" },
    { key: "tickets", label: "Vé điện tử", icon: "🎟️", href: "tickets.html" },
    { key: "checkin", label: "Kiểm soát lượt vào", icon: "📷", href: "checkin.html" },
    { key: "events", label: "Sự kiện", icon: "📅", href: "events.html" },
    { key: "visitors", label: "Đoàn khách", icon: "👥", href: "visitors.html" },
    { key: "surveys", label: "Khảo sát hài lòng", icon: "⭐", href: "surveys.html" },
    { section: "Hệ thống" },
    { key: "settings", label: "Cài đặt", icon: "⚙️", href: "settings.html" },
  ],
};

/* ==========================================================================
   Cấu hình cho trang khách tham quan (index.html, pages/booking.html)
   ========================================================================== */
Object.assign(window.APP_CONFIG, {
  SITE_NAME: "BẢO TÀNG DI SẢN",
  SITE_TAGLINE: "Cổng Vé Quốc Gia",
  HOME_PAGE_SIZE: 6, // số thẻ bảo tàng mỗi trang ở trang chủ

  /** Đường dẫn tính từ thư mục frontend/ (Helpers.routeUrl tự thêm "../" khi đang ở pages/) */
  ROUTES: {
    HOME: "index.html",
    MUSEUMS: "index.html#museum-list",
    BOOKING: "pages/booking.html#booking",
    EVENTS: "pages/booking.html#events",
    GROUP_BOOKING: "pages/booking.html#group",
    SURVEY: "pages/booking.html#survey",
    MY_TICKETS: "pages/booking.html#lookup",
    LOGIN: "pages/login.html",
    DASHBOARD: "pages/dashboard.html",
  },

  /** Menu trên thanh điều hướng trang khách (key khớp <body data-page>) */
  PUBLIC_NAV: [
    { key: "home", label: "Trang chủ", route: "HOME" },
    { key: "museums", label: "Bảo tàng", route: "MUSEUMS" },
    { key: "events", label: "Sự kiện", route: "EVENTS" },
    { key: "group", label: "Đoàn khách", route: "GROUP_BOOKING" },
    { key: "lookup", label: "Tra cứu vé", route: "MY_TICKETS" },
  ],

  /** Khu vực — code khớp cột museums.city_code (MySQL) */
  CITIES: [
    { code: "all", label: "Tất cả" },
    { code: "hanoi", label: "Hà Nội" },
    { code: "hcm", label: "TP. Hồ Chí Minh", short: "TP. HCM" },
    { code: "hue", label: "Thừa Thiên Huế" },
    { code: "danang", label: "Đà Nẵng" },
    { code: "ninhbinh", label: "Ninh Bình" },
  ],

  /** Thể loại — code khớp cột museums.category_code */
  MUSEUM_TYPES: [
    { code: "all", label: "Tất cả thể loại" },
    { code: "history", label: "Lịch sử" },
    { code: "art", label: "Mỹ thuật & Điêu khắc" },
    { code: "ethnology", label: "Dân tộc học" },
    { code: "science", label: "Khoa học & Tự nhiên" },
    { code: "war", label: "Chiến tích" },
  ],
});
