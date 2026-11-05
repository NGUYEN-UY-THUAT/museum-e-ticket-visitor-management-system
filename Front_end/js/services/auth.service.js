window.AuthService = {
  async login(username, password) {
    let result;
    if (API_CONFIG.USE_MOCK) {
      const user = ApiService.db().users.find((u) => u.username === username && u.password === password);
      if (!user) throw new Error("Sai tên đăng nhập hoặc mật khẩu");
      const { password: _, ...safe } = user;
      result = { token: "mock-" + Helpers.uid(), user: safe };
    } else {
      result = await ApiService.post(API_CONFIG.ENDPOINTS.LOGIN, { username, password });
    }
    localStorage.setItem(APP_CONFIG.TOKEN_KEY, result.token);
    localStorage.setItem(APP_CONFIG.USER_KEY, JSON.stringify(result.user));
    return result.user;
  },
  logout() {
    localStorage.removeItem(APP_CONFIG.TOKEN_KEY);
    localStorage.removeItem(APP_CONFIG.USER_KEY);
    location.href = (location.pathname.includes("/pages/") ? "" : "pages/") + "login.html";
  },
  user() {
    try {
      return JSON.parse(localStorage.getItem(APP_CONFIG.USER_KEY));
    } catch {
      return null;
    }
  },
  isLoggedIn() {
    return !!localStorage.getItem(APP_CONFIG.TOKEN_KEY);
  },
  isAdmin() {
    return this.user()?.role === APP_CONFIG.ROLES.ADMIN;
  },
  /** Gọi đầu mỗi trang quản trị */
  requireAuth(adminOnly = false) {
    if (!this.isLoggedIn()) {
      location.href = "login.html";
      return false;
    }
    if (adminOnly && !this.isAdmin()) {
      location.href = "dashboard.html";
      return false;
    }
    return true;
  },
};
