/* Tài khoản khách tham quan: đăng ký, đăng nhập, quên mật khẩu.
   Tách riêng với AuthService (tài khoản cán bộ) và lưu phiên ở khóa localStorage khác.
   Bảng MySQL dự kiến: customers(id, full_name, email, phone, password_hash, created_at). */
window.CustomerService = (function () {
  const E = () => API_CONFIG.ENDPOINTS;
  const OTP_KEY = "museum_reset_otp"; // chỉ dùng khi chạy mock

  const strip = (c) => {
    const { password: _, ...safe } = c;
    return safe;
  };
  const saveSession = (token, customer) => {
    localStorage.setItem(APP_CONFIG.CUSTOMER_TOKEN_KEY, token);
    localStorage.setItem(APP_CONFIG.CUSTOMER_KEY, JSON.stringify(customer));
    return customer;
  };
  async function findByAccount(account) {
    const a = String(account).trim();
    const field = a.includes("@") ? "email" : "phone";
    const list = await ApiService.get(E().CUSTOMERS, { [field]: field === "email" ? a.toLowerCase() : a.replace(/\s/g, "") });
    return list[0] || null;
  }

  return {
    current() {
      try {
        return JSON.parse(localStorage.getItem(APP_CONFIG.CUSTOMER_KEY));
      } catch {
        return null;
      }
    },
    isLoggedIn() {
      return !!localStorage.getItem(APP_CONFIG.CUSTOMER_TOKEN_KEY);
    },

    /** Đăng ký: {full_name, email, phone, password} */
    async register(data) {
      const email = data.email.trim().toLowerCase();
      const phone = data.phone.replace(/\s/g, "");
      if (!API_CONFIG.USE_MOCK) {
        const r = await ApiService.post(E().CUSTOMER_REGISTER, { ...data, email, phone });
        return saveSession(r.token, r.customer);
      }
      if (await findByAccount(email)) throw new Error("Email này đã được đăng ký");
      if (await findByAccount(phone)) throw new Error("Số điện thoại này đã được đăng ký");
      const c = await ApiService.post(E().CUSTOMERS, { full_name: data.full_name.trim(), email, phone, password: data.password });
      return saveSession("mock-c-" + Helpers.uid(), strip(c));
    },

    /** Đăng nhập bằng email hoặc số điện thoại */
    async login(account, password) {
      if (!API_CONFIG.USE_MOCK) {
        const r = await ApiService.post(E().CUSTOMER_LOGIN, { account, password });
        return saveSession(r.token, r.customer);
      }
      const c = await findByAccount(account);
      if (!c || c.password !== password) throw new Error("Sai email / số điện thoại hoặc mật khẩu");
      return saveSession("mock-c-" + Helpers.uid(), strip(c));
    },

    logout(redirectKey = "HOME") {
      localStorage.removeItem(APP_CONFIG.CUSTOMER_TOKEN_KEY);
      localStorage.removeItem(APP_CONFIG.CUSTOMER_KEY);
      location.href = Helpers.routeUrl(redirectKey);
    },

    /** Bước 1 quên mật khẩu: gửi mã OTP 6 số về email. Mock trả lại mã để hiển thị thử. */
    async requestReset(email) {
      email = email.trim().toLowerCase();
      if (!API_CONFIG.USE_MOCK) return ApiService.post(E().CUSTOMER_FORGOT, { email });
      if (!(await findByAccount(email))) throw new Error("Không tìm thấy tài khoản với email này");
      const otp = String(Math.floor(100000 + Math.random() * 900000));
      sessionStorage.setItem(OTP_KEY, JSON.stringify({ email, otp, exp: Date.now() + 10 * 60 * 1000 }));
      return { demo_otp: otp };
    },

    /** Bước 2: xác nhận OTP và đặt mật khẩu mới */
    async resetPassword(email, otp, password) {
      email = email.trim().toLowerCase();
      if (!API_CONFIG.USE_MOCK) return ApiService.post(E().CUSTOMER_RESET, { email, otp, password });
      const saved = JSON.parse(sessionStorage.getItem(OTP_KEY) || "null");
      if (!saved || saved.email !== email || saved.otp !== otp.trim()) throw new Error("Mã xác nhận không đúng");
      if (Date.now() > saved.exp) throw new Error("Mã xác nhận đã hết hạn, vui lòng gửi lại");
      const c = await findByAccount(email);
      await ApiService.put(E().CUSTOMERS + "/" + c.id, { password });
      sessionStorage.removeItem(OTP_KEY);
      return { success: true };
    },

    /** Trang yêu cầu đăng nhập: chuyển sang trang đăng nhập, quay lại sau khi xong */
    requireLogin() {
      if (this.isLoggedIn()) return true;
      location.href = Helpers.routeUrl("ACCOUNT_LOGIN", { next: location.pathname.split("/").pop() + location.search });
      return false;
    },
  };
})();
