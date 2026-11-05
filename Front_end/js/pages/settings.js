(async function () {
  if (!initLayout("settings", "Cài đặt", true)) return;
  const form = document.getElementById("settingsForm");
  Helpers.fillForm(form, await ApiService.get(API_CONFIG.ENDPOINTS.SETTINGS));
  document.getElementById("modeText").textContent = API_CONFIG.USE_MOCK ? "Dữ liệu mẫu (trình duyệt)" : "API backend";
  document.getElementById("baseUrl").textContent = API_CONFIG.BASE_URL;
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    await ApiService.put(API_CONFIG.ENDPOINTS.SETTINGS, Helpers.formData(form));
    Notify.success("Đã lưu cài đặt");
  });
  document.getElementById("resetBtn").onclick = async () => {
    if (await Modal.confirm("Xóa toàn bộ dữ liệu đã nhập và khôi phục dữ liệu mẫu?")) {
      MockDB.reset();
      Notify.success("Đã khôi phục");
      setTimeout(() => location.reload(), 600);
    }
  };
  if (!API_CONFIG.USE_MOCK) document.getElementById("resetBtn").remove();
})();
