window.Helpers = {
  $: (sel, root = document) => root.querySelector(sel),
  $$: (sel, root = document) => [...root.querySelectorAll(sel)],
  formData(form) { return Object.fromEntries(new FormData(form).entries()); },
  fillForm(form, data) { for (const [k, v] of Object.entries(data || {})) { if (form.elements[k]) form.elements[k].value = v ?? ""; } },
  uid(prefix = "") { return prefix + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 6).toUpperCase(); },
  debounce(fn, ms = 300) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; },
  query(name) { return new URLSearchParams(location.search).get(name); },
  /** Vẽ QR vào phần tử (dùng thư viện qrcodejs nạp từ CDN) */
  renderQR(el, text, size = 160) {
    el.innerHTML = "";
    if (window.QRCode) new QRCode(el, { text, width: size, height: size });
    else el.textContent = text;
  },
  /** Render bảng đơn giản */
  renderTable(tbody, rows, rowFn, colspan = 6) {
    tbody.innerHTML = rows.length ? rows.map(rowFn).join("") : `<tr><td colspan="${colspan}" class="empty">Không có dữ liệu</td></tr>`;
  }
};

/* ---------- Tiện ích cho trang khách tham quan ---------- */
Object.assign(window.Helpers, {
  /** Bỏ dấu + chữ thường để tìm kiếm: "Huế" -> "hue" */
  normalizeText(text) {
    return String(text || "").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase().trim();
  },
  /** "../" nếu trang đang nằm trong pages/, ngược lại "" */
  rootPath() { return location.pathname.includes("/pages/") ? "../" : ""; },
  /** Helpers.routeUrl("BOOKING", { museum_id: 1 }) -> "pages/ticket-selection.html?museum_id=1" */
  routeUrl(key, params) {
    const path = APP_CONFIG.ROUTES[key] || APP_CONFIG.ROUTES.HOME;
    const [base, hash] = path.split("#");
    const qs = params ? "?" + new URLSearchParams(params) : "";
    return this.rootPath() + base + qs + (hash ? "#" + hash : "");
  },
  /** "HH:MM[:SS]" -> số phút trong ngày */
  timeToMinutes(t) { const [h, m] = String(t || "0:0").split(":").map(Number); return h * 60 + (m || 0); },
  /** Bảo tàng có đang mở cửa tại thời điểm now không */
  isOpenNow(m, now = new Date()) {
    if (!Array.isArray(m.open_days) || !m.open_days.includes(now.getDay())) return false;
    const mins = now.getHours() * 60 + now.getMinutes();
    return mins >= this.timeToMinutes(m.open_time) && mins < this.timeToMinutes(m.close_time);
  },
  /** Khoảng cách (km) giữa 2 tọa độ — công thức Haversine */
  distanceKm(lat1, lng1, lat2, lng2) {
    const r = d => (d * Math.PI) / 180;
    const a = Math.sin(r(lat2 - lat1) / 2) ** 2 + Math.cos(r(lat1)) * Math.cos(r(lat2)) * Math.sin(r(lng2 - lng1) / 2) ** 2;
    return 2 * 6371 * Math.asin(Math.sqrt(a));
  },
  /** Vị trí hiện tại của người dùng (Promise) — null nếu bị từ chối */
  getCurrentPosition(timeout = 8000) {
    return new Promise(resolve => {
      if (!navigator.geolocation) return resolve(null);
      navigator.geolocation.getCurrentPosition(
        p => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
        () => resolve(null),
        { timeout, maximumAge: 300000 }
      );
    });
  }
});
