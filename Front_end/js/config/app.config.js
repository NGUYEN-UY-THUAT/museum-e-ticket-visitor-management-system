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
    expired: { label: "Hết hạn", badge: "muted" }
  },
  EVENT_STATUS: {
    upcoming: { label: "Sắp diễn ra", badge: "info" },
    ongoing: { label: "Đang diễn ra", badge: "success" },
    finished: { label: "Đã kết thúc", badge: "muted" },
    cancelled: { label: "Đã hủy", badge: "danger" }
  },
  GROUP_STATUS: {
    pending: { label: "Chờ duyệt", badge: "warning" },
    approved: { label: "Đã duyệt", badge: "success" },
    visited: { label: "Đã tham quan", badge: "info" },
    rejected: { label: "Từ chối", badge: "danger" }
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
    { key: "settings", label: "Cài đặt", icon: "⚙️", href: "settings.html" }
  ]
};

/* ==========================================================================
   Cấu hình cho trang khách tham quan (index.html và các trang khách trong pages/)
   ========================================================================== */
Object.assign(window.APP_CONFIG, {
  CUSTOMER_TOKEN_KEY: "museum_customer_token", // phiên đăng nhập của khách (tách với cán bộ)
  CUSTOMER_KEY: "museum_customer",
  /** Trạng thái yêu cầu đổi / hủy / hoàn vé — khớp cột ticket_requests.status */
  REQUEST_STATUS: {
    pending: { label: "Đang chờ xử lý", badge: "warning" },
    approved: { label: "Đã chấp nhận", badge: "success" },
    rejected: { label: "Từ chối", badge: "danger" },
  },
  REQUEST_TYPES: { change: "Đổi ngày / khung giờ", cancel: "Hủy vé & hoàn tiền" },
  /** Khung giờ vào cổng (dùng cho đổi giờ) */
  TIME_SLOTS: ["08:00 - 10:00", "10:00 - 12:00", "13:30 - 15:30", "15:30 - 17:00"],
  /** Client ID OAuth của Google (Google Cloud Console → Credentials). Để trống thì nút Google chạy giả lập. */
  GOOGLE_CLIENT_ID: "",
  SITE_NAME: "BẢO TÀNG DI SẢN",
  SITE_TAGLINE: "Cổng Vé Quốc Gia",
  HOME_PAGE_SIZE: 6, // số thẻ bảo tàng mỗi trang ở trang chủ

  /** Đường dẫn tính từ thư mục frontend/ (Helpers.routeUrl tự thêm "../" khi đang ở pages/) */
  ROUTES: {
    HOME: "index.html",                        // Trang chủ khách tham quan
    MUSEUMS: "pages/museums.html",             // Danh sách bảo tàng (tìm kiếm, lọc)
    MUSEUM_DETAIL: "pages/museum-detail.html", // Chi tiết bảo tàng
    BOOKING: "pages/ticket-selection.html",    // Bước 1: chọn ngày, khung giờ, loại vé
    CHECKOUT: "pages/checkout.html",           // Bước 2: thông tin người đặt + thanh toán
    PAYMENT_RESULT: "pages/payment-result.html", // Bước 3: kết quả thanh toán
    MY_TICKETS: "pages/my-tickets.html",       // Vé điện tử của tôi
    TICKET_DETAIL: "pages/ticket-detail.html", // Chi tiết 1 vé + mã QR
    EVENTS: "pages/event-list.html",           // Danh sách sự kiện
    EVENT_DETAIL: "pages/event-detail.html",   // Chi tiết + đăng ký sự kiện
    GROUP_BOOKING: "pages/group-booking.html", // Đặt vé đoàn
    SURVEY: "pages/survey.html",               // Khảo sát mức độ hài lòng
    PROFILE: "pages/profile.html",             // Hồ sơ cá nhân & lịch sử đơn
    TICKET_LOOKUP: "pages/ticket-lookup.html", // Tra cứu vé không cần tài khoản
    TICKET_CHANGE: "pages/ticket-change.html", // Đổi giờ / hủy vé / hoàn tiền
    ACCOUNT_LOGIN: "pages/account-login.html", // Đăng nhập khách
    ACCOUNT_REGISTER: "pages/account-register.html", // Đăng ký tài khoản khách
    FORGOT_PASSWORD: "pages/forgot-password.html", // Quên mật khẩu
    POLICIES: "pages/policies.html",           // Hướng dẫn & chính sách (các mục theo #)
    POLICY_QR: "pages/policies.html#qr-guide",
    POLICY_RULES: "pages/policies.html#rules",
    POLICY_REFUND: "pages/policies.html#refund",
    POLICY_TERMS: "pages/policies.html#terms",
    POLICY_PRIVACY: "pages/policies.html#privacy",
    CONTACT: "pages/contact.html",             // Liên hệ & câu hỏi thường gặp
    NOT_FOUND: "404.html",
    SERVICES: "pages/booking.html",            // Trang dịch vụ gộp cũ (đặt vé QR, tra cứu...) – còn dùng logic mock
    LOGIN: "pages/login.html",
    DASHBOARD: "pages/dashboard.html",
    CHECKIN: "pages/checkin.html"
  },


  /** Menu trên thanh điều hướng trang khách (key khớp <body data-page>) */
  PUBLIC_NAV: [
    { key: "home", label: "Trang chủ", route: "HOME" },
    { key: "museums", label: "Bảo tàng", route: "MUSEUMS" },
    { key: "events", label: "Sự kiện", route: "EVENTS" },
    { key: "group", label: "Đoàn khách", route: "GROUP_BOOKING" },
    { key: "lookup", label: "Tra cứu vé", route: "TICKET_LOOKUP" }
  ],

  /** Khu vực — code khớp cột museums.city_code (MySQL) */
  CITIES: [
    { code: "all", label: "Tất cả" },
    { code: "hanoi", label: "Hà Nội" },
    { code: "hcm", label: "TP. Hồ Chí Minh", short: "TP. HCM" },
    { code: "hue", label: "Thừa Thiên Huế" },
    { code: "danang", label: "Đà Nẵng" },
    { code: "ninhbinh", label: "Ninh Bình" }
  ],

  /** Thể loại — code khớp cột museums.category_code */
  MUSEUM_TYPES: [
    { code: "all", label: "Tất cả thể loại" },
    { code: "history", label: "Lịch sử" },
    { code: "art", label: "Mỹ thuật & Điêu khắc" },
    { code: "ethnology", label: "Dân tộc học" },
    { code: "science", label: "Khoa học & Tự nhiên" },
    { code: "war", label: "Chiến tích" }
  ]
});
