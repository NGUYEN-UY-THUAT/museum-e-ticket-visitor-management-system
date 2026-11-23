/* settings.js — Cài đặt hệ thống (pages/settings.html), chỉ quản trị viên. Bảng MySQL: settings (1 dòng cấu hình) */
(function () {
  if (!AdminShell.init("settings")) return;
  const $ = (id) => document.getElementById(id);
  const form = $("settingsForm");
  let saved = {};
  let dirty = false;

  $("slots").innerHTML = APP_CONFIG.TIME_SLOTS.map((s) => `<span class="st-slot">${Format.escape(s)}</span>`).join("");
  $("modeText").textContent = API_CONFIG.USE_MOCK ? "Dữ liệu mẫu (lưu trên trình duyệt)" : "Kết nối API backend";
  $("baseUrl").textContent = API_CONFIG.BASE_URL;
  if (!API_CONFIG.USE_MOCK) $("resetBox").remove();

  function fill(s) {
    for (const el of form.elements) if (el.name) el.value = s[el.name] ?? "";
    if (!form.elements.slot_capacity.value) form.elements.slot_capacity.value = APP_CONFIG.SLOT_CAPACITY;
    dirty = false;
  }
  form.addEventListener("input", () => (dirty = true));
  $("undoBtn").addEventListener("click", () => { fill(saved); Validation.showFieldErrors(form, {}); });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const d = AdminUI.formValues(form);
    const errors = {};
    if (d.museum_name.length < 3) errors.museum_name = "Vui lòng nhập tên hiển thị";
    if (!/^[0-9 .+()-]{8,20}$/.test(d.hotline)) errors.hotline = "Hotline không hợp lệ";
    if (d.email && !Validation.email(d.email)) errors.email = "Email không hợp lệ";
    if (!d.open_time) errors.open_time = "Chọn giờ mở cửa";
    if (!d.close_time) errors.close_time = "Chọn giờ đóng cửa";
    else if (d.open_time && d.close_time <= d.open_time) errors.close_time = "Giờ đóng cửa phải sau giờ mở cửa";
    if (!(Number(d.slot_capacity) >= 1)) errors.slot_capacity = "Sức chứa phải lớn hơn 0";
    if (!Validation.showFieldErrors(form, errors)) return;
    await Helpers.withBusy(e.submitter, async () => {
      saved = await ApiService.put(API_CONFIG.ENDPOINTS.SETTINGS, { ...d, slot_capacity: Number(d.slot_capacity) });
      dirty = false;
      Notify.success("Đã lưu cài đặt");
    });
  });

  $("resetBtn")?.addEventListener("click", async () => {
    if (!(await Modal.confirm("Xóa toàn bộ dữ liệu đã nhập trên trình duyệt này và khôi phục dữ liệu mẫu?", "Khôi phục dữ liệu mẫu"))) return;
    MockDB.reset();
    Notify.success("Đã khôi phục dữ liệu mẫu");
    setTimeout(() => location.reload(), 700);
  });
  window.addEventListener("beforeunload", (e) => { if (dirty) { e.preventDefault(); e.returnValue = ""; } });

  ApiService.get(API_CONFIG.ENDPOINTS.SETTINGS).then((s) => { saved = s || {}; fill(saved); }).catch((e) => Notify.error(e.message));
})();
