/* Lớp gọi API chung. Khi API_CONFIG.USE_MOCK = true, dữ liệu được lưu tạm trong localStorage
   để chạy giao diện mà chưa cần backend; tắt USE_MOCK để gọi REST API thật (backend + MySQL). */
(function () {
  const MOCK_KEY = "museum_mock_db";
  const today = new Date();
  const d = (n) => {
    const x = new Date(today);
    x.setDate(x.getDate() + n);
    return Format.isoDate(x);
  };

  function seed() {
    return {
      users: [
        { id: 1, username: "admin", password: "admin123", full_name: "Quản trị viên", role: "admin" },
        { id: 2, username: "staff", password: "staff123", full_name: "Nhân viên soát vé", role: "staff" },
      ],
      "ticket-types": [
        { id: 1, name: "Người lớn", price: 50000, description: "Từ 16 tuổi trở lên", active: 1 },
        { id: 2, name: "Học sinh - Sinh viên", price: 25000, description: "Xuất trình thẻ HS/SV", active: 1 },
        { id: 3, name: "Trẻ em", price: 0, description: "Dưới 6 tuổi", active: 1 },
        { id: 4, name: "Vé đoàn (mỗi người)", price: 35000, description: "Đoàn từ 15 người", active: 1 },
      ],
      tickets: [
        { id: 1, code: "TK7A1X9QZ2", customer_name: "Nguyễn Văn An", email: "an@gmail.com", phone: "0901234567", ticket_type_id: 1, quantity: 2, visit_date: d(0), total: 100000, status: "paid", created_at: d(-1) },
        { id: 2, code: "TK8B2Y0RW3", customer_name: "Trần Thị Bình", email: "binh@gmail.com", phone: "0912345678", ticket_type_id: 2, quantity: 1, visit_date: d(0), total: 25000, status: "used", created_at: d(-2), used_at: d(0) + "T09:15:00" },
        { id: 3, code: "TK9C3Z1SV4", customer_name: "Lê Hoàng Cường", email: "cuong@gmail.com", phone: "0987654321", ticket_type_id: 1, quantity: 3, visit_date: d(2), total: 150000, status: "pending", created_at: d(0) },
        { id: 4, code: "TK0D4A2TU5", customer_name: "Phạm Minh Dũng", email: "dung@gmail.com", phone: "0934567890", ticket_type_id: 3, quantity: 1, visit_date: d(-3), total: 0, status: "expired", created_at: d(-5) },
      ],
      checkins: [{ id: 1, ticket_code: "TK8B2Y0RW3", gate: "Cổng A", staff: "staff", checked_at: d(0) + "T09:15:00", result: "ok" }],
      events: [
        { id: 1, title: "Triển lãm Gốm cổ Việt Nam", description: "Trưng bày hơn 200 hiện vật gốm từ thế kỷ XI-XIX.", location: "Phòng trưng bày 2", start_time: d(3) + "T09:00", end_time: d(3) + "T17:00", capacity: 100, registered: 42, status: "upcoming" },
        { id: 2, title: "Tọa đàm: Di sản văn hóa số", description: "Chia sẻ về số hóa hiện vật bảo tàng.", location: "Hội trường", start_time: d(7) + "T14:00", end_time: d(7) + "T16:30", capacity: 60, registered: 15, status: "upcoming" },
        { id: 3, title: "Workshop vẽ tranh Đông Hồ", description: "Trải nghiệm in tranh dân gian.", location: "Sân trong", start_time: d(-4) + "T08:30", end_time: d(-4) + "T11:30", capacity: 30, registered: 30, status: "finished" },
      ],
      "event-registrations": [{ id: 1, event_id: 1, full_name: "Nguyễn Văn An", email: "an@gmail.com", phone: "0901234567", attendees: 2, code: "EV1K2L3M", created_at: d(-1), checked_in: 0 }],
      groups: [
        { id: 1, group_name: "Trường THPT Chu Văn An", leader_name: "Cô Hoa", phone: "0909111222", email: "hoa@cva.edu.vn", size: 40, visit_date: d(5), guide_required: 1, note: "Cần thuyết minh tiếng Việt", status: "approved" },
        { id: 2, group_name: "Đoàn du lịch Sài Gòn Tourist", leader_name: "Anh Tuấn", phone: "0909333444", email: "tuan@sgt.vn", size: 25, visit_date: d(1), guide_required: 1, note: "Khách nước ngoài, cần thuyết minh tiếng Anh", status: "pending" },
      ],
      surveys: [
        { id: 1, ticket_code: "TK8B2Y0RW3", full_name: "Trần Thị Bình", overall: 5, exhibits: 5, staff: 4, facilities: 4, comment: "Hiện vật rất đẹp, nhân viên nhiệt tình.", created_at: d(0) },
        { id: 2, ticket_code: "", full_name: "Ẩn danh", overall: 3, exhibits: 4, staff: 3, facilities: 2, comment: "Thiếu chỗ ngồi nghỉ.", created_at: d(-2) },
      ],
      settings: { museum_name: "Bảo tàng Lịch sử", address: "2 Nguyễn Bỉnh Khiêm, Q.1, TP.HCM", hotline: "028 3829 8146", open_time: "08:00", close_time: "17:00", closed_day: "Thứ Hai", daily_capacity: 1500 },
    };
  }

  const MockDB = {
    load() {
      try {
        return JSON.parse(localStorage.getItem(MOCK_KEY)) || this.reset();
      } catch {
        return this.reset();
      }
    },
    save(db) {
      try {
        localStorage.setItem(MOCK_KEY, JSON.stringify(db));
      } catch {}
    },
    reset() {
      const db = seed();
      this.save(db);
      return db;
    },
  };

  async function mockRequest(method, path, body) {
    await new Promise((r) => setTimeout(r, 120));
    const db = MockDB.load();
    const [pathname, qs] = path.split("?");
    const [, col, id] = pathname.split("/");
    const params = Object.fromEntries(new URLSearchParams(qs || ""));
    if (!(col in db)) throw new Error("Không tìm thấy API: " + path);
    let data = db[col];
    if (!Array.isArray(data)) {
      // object (settings)
      if (method === "PUT") {
        db[col] = { ...data, ...body };
        MockDB.save(db);
        return db[col];
      }
      return data;
    }
    if (method === "GET") {
      if (id) {
        const item = data.find((x) => String(x.id) === id);
        if (!item) throw new Error("Không tìm thấy dữ liệu");
        return item;
      }
      return data.filter((x) => Object.entries(params).every(([k, v]) => v === "" || String(x[k]) === v)).sort((a, b) => b.id - a.id);
    }
    if (method === "POST") {
      const item = { ...body, id: Math.max(0, ...data.map((x) => x.id)) + 1, created_at: body.created_at || new Date().toISOString() };
      data.push(item);
      MockDB.save(db);
      return item;
    }
    const idx = data.findIndex((x) => String(x.id) === id);
    if (idx < 0) throw new Error("Không tìm thấy dữ liệu");
    if (method === "PUT") {
      data[idx] = { ...data[idx], ...body };
      MockDB.save(db);
      return data[idx];
    }
    if (method === "DELETE") {
      data.splice(idx, 1);
      MockDB.save(db);
      return { success: true };
    }
  }

  async function httpRequest(method, path, body) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), API_CONFIG.TIMEOUT);
    const token = localStorage.getItem(APP_CONFIG.TOKEN_KEY);
    try {
      const res = await fetch(API_CONFIG.BASE_URL + path, {
        method,
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: "Bearer " + token } : {}) },
        body: body ? JSON.stringify(body) : undefined,
        signal: ctrl.signal,
      });
      const json = await res.json().catch(() => ({}));
      if (res.status === 401) {
        AuthService.logout();
        throw new Error("Phiên đăng nhập đã hết hạn");
      }
      if (!res.ok) throw new Error(json.message || "Lỗi máy chủ (" + res.status + ")");
      return json.data ?? json;
    } catch (e) {
      if (e.name === "AbortError") throw new Error("Hết thời gian kết nối máy chủ");
      throw e;
    } finally {
      clearTimeout(timer);
    }
  }

  const request = (m, p, b) => (API_CONFIG.USE_MOCK ? mockRequest(m, p, b) : httpRequest(m, p, b));

  window.MockDB = MockDB;
  window.ApiService = {
    get: (p, params) => request("GET", params ? p + "?" + new URLSearchParams(params) : p),
    post: (p, b) => request("POST", p, b),
    put: (p, b) => request("PUT", p, b),
    delete: (p) => request("DELETE", p),
    db: () => MockDB.load(),
  };
})();
