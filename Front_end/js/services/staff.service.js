/* Tài khoản cán bộ (bảng users: id, username, password_hash, full_name, email, phone, role, status, last_login).
   Chỉ quản trị viên được gọi các hàm sửa. Không bao giờ trả mật khẩu ra giao diện. */
window.StaffService = (function () {
  const E = () => API_CONFIG.ENDPOINTS.USERS;
  const strip = ({ password: _, ...u }) => ({ status: "active", ...u });

  return {
    async list() {
      return (await ApiService.get(E())).map(strip);
    },
    /** Thêm mới (có password) hoặc cập nhật (không đổi mật khẩu) */
    async save(u) {
      if (u.id) return strip(await ApiService.put(`${E()}/${u.id}`, u));
      const all = await ApiService.get(E());
      if (all.some((x) => x.username.toLowerCase() === u.username.toLowerCase())) throw new Error("Tên đăng nhập đã tồn tại");
      return strip(await ApiService.post(E(), { ...u, status: "active", last_login: null }));
    },
    setStatus: (id, status) => ApiService.put(`${E()}/${id}`, { status }).then(strip),
    /** Đặt lại mật khẩu tạm; backend thật gửi mật khẩu mới qua email cán bộ */
    async resetPassword(id) {
      const temp = "Bt" + Math.random().toString(36).slice(2, 8);
      if (API_CONFIG.USE_MOCK) await ApiService.put(`${E()}/${id}`, { password: temp });
      else await ApiService.put(`${E()}/${id}/reset-password`, {});
      return API_CONFIG.USE_MOCK ? temp : null;
    },
  };
})();
