/* Trang danh sách bảo tàng (pages/museums.html): tìm kiếm, lọc, sắp xếp, phân trang */
(function () {
  const $ = Helpers.$;
  const el = {
    search: $("#searchInput"), clear: $("#clearSearchBtn"), sort: $("#sortSelect"), openNow: $("#openNowToggle"),
    cities: $("#cityFilterGroup"), types: $("#typeFilterGroup"), grid: $("#museumGrid"), empty: $("#emptyState"),
    counter: $("#resultCounter"), scope: $("#resultScope"), pagination: $("#pagination"), reset: $("#resetFilterBtn")
  };

  /** Trạng thái bộ lọc hiện tại — đồng bộ lên URL (?q=&city=&type=&sort=&open=&page=) để chia sẻ link */
  const state = { keyword: "", city: "all", type: "all", sort: "popular", openNow: false, page: 1, position: null };
  let requestId = 0;

  /* ---------- Vẽ chip bộ lọc ---------- */
  function renderChips(container, items, attr, square) {
    container.innerHTML = items.map(i =>
      `<button class="chip${square ? " chip--square" : ""}" type="button" data-${attr}="${i.code}">${Format.escape(i.label)}</button>`
    ).join("");
  }
  function syncChips() {
    el.cities.querySelectorAll(".chip").forEach(b => b.classList.toggle("is-active", b.dataset.city === state.city));
    el.types.querySelectorAll(".chip").forEach(b => b.classList.toggle("is-active", b.dataset.type === state.type));
  }
  function syncControls() {
    el.search.value = state.keyword;
    el.clear.hidden = !state.keyword;
    el.sort.value = state.sort;
    el.openNow.checked = state.openNow;
    syncChips();
  }

  /* ---------- URL <-> state ---------- */
  function readUrl() {
    const p = new URLSearchParams(location.search);
    const valid = (list, v) => list.some(x => x.code === v);
    state.keyword = p.get("q") || "";
    state.city = valid(APP_CONFIG.CITIES, p.get("city")) ? p.get("city") : "all";
    state.type = valid(APP_CONFIG.MUSEUM_TYPES, p.get("type")) ? p.get("type") : "all";
    state.sort = ["popular", "rating", "price-asc", "distance"].includes(p.get("sort")) ? p.get("sort") : "popular";
    state.openNow = p.get("open") === "1";
    state.page = Math.max(1, Number(p.get("page")) || 1);
  }
  function writeUrl() {
    const p = new URLSearchParams();
    if (state.keyword) p.set("q", state.keyword);
    if (state.city !== "all") p.set("city", state.city);
    if (state.type !== "all") p.set("type", state.type);
    if (state.sort !== "popular") p.set("sort", state.sort);
    if (state.openNow) p.set("open", "1");
    if (state.page > 1) p.set("page", state.page);
    const qs = p.toString();
    history.replaceState(null, "", location.pathname + (qs ? "?" + qs : "") + location.hash);
  }

  /* ---------- Tải & hiển thị danh sách ---------- */
  function updateHeader(total) {
    const filtered = state.keyword || state.city !== "all" || state.type !== "all" || state.openNow;
    el.counter.textContent = total === 0 ? "Không có kết quả nào"
      : filtered ? `Tìm thấy ${total} bảo tàng phù hợp` : `Hiển thị ${total} bảo tàng tiêu biểu`;
    const city = APP_CONFIG.CITIES.find(c => c.code === state.city);
    el.scope.textContent = state.city === "all" ? "Toàn quốc" : city.label;
  }

  async function load({ scroll = false } = {}) {
    const id = ++requestId; // bỏ qua kết quả cũ nếu người dùng gõ nhanh
    el.grid.hidden = false;
    el.empty.hidden = true;
    el.grid.innerHTML = MuseumCard.skeleton(3);
    writeUrl();

    try {
      const res = await MuseumService.list({ ...state, pageSize: APP_CONFIG.HOME_PAGE_SIZE });
      if (id !== requestId) return;
      // Trang hiện tại vượt quá tổng số trang (do đổi bộ lọc) -> quay về trang cuối
      if (res.total && state.page > res.totalPages) { state.page = res.totalPages; return load(); }

      updateHeader(res.total);
      el.grid.hidden = res.total === 0;
      el.empty.hidden = res.total !== 0;
      MuseumCard.renderList(el.grid, res.items);
      Pagination.render(el.pagination, {
        page: res.page, totalPages: res.totalPages, total: res.total,
        onChange: p => { state.page = p; load({ scroll: true }); }
      });
      if (scroll) $("#museum-list").scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (err) {
      if (id !== requestId) return;
      el.grid.innerHTML = "";
      el.counter.textContent = "Không tải được danh sách bảo tàng";
      Notify.error(err.message);
    }
  }

  /** Mọi thay đổi bộ lọc đều quay về trang 1 */
  function applyFilter(patch) {
    Object.assign(state, patch, { page: 1 });
    syncControls();
    load();
  }

  /* ---------- Xem chi tiết (modal) ---------- */
  async function showDetail(id) {
    try {
      const m = await MuseumService.get(id);
      const open = Helpers.isOpenNow(m);
      Modal.open({
        title: Format.escape(m.name),
        body: `
          ${m.image_url ? `<div class="museum-detail__image" style="background-image:url('${encodeURI(m.image_url)}')"></div>` : ""}
          <p class="museum-detail__desc">${Format.escape(m.description)}</p>
          <ul class="museum-detail__info">
            <li><span class="icon icon--18">location_on</span>${Format.escape(m.address)}</li>
            <li><span class="icon icon--18">schedule</span>${Format.escape(Format.openingHours(m))} · <b>${open ? "Đang mở cửa" : "Đã đóng cửa"}</b></li>
            <li><span class="icon icon--18 icon--filled">star</span>${Format.rating(m.rating)} (${Format.reviewCount(m.review_count)} đánh giá)</li>
            <li><span class="icon icon--18">confirmation_number</span>Vé vào cửa từ <b>${Format.currency(m.min_price)}</b></li>
          </ul>`,
        footer: `<button class="btn btn--outline" data-close>Đóng</button>
                 <a class="btn btn--primary" href="${Helpers.routeUrl("BOOKING", { museum_id: m.id })}">Đặt vé ngay</a>`
      });
    } catch (err) { Notify.error(err.message); }
  }

  /* ---------- Gắn sự kiện ---------- */
  function bindEvents() {
    const onSearch = Helpers.debounce(v => applyFilter({ keyword: v }), 300);
    el.search.addEventListener("input", e => { el.clear.hidden = !e.target.value; onSearch(e.target.value.trim()); });
    el.clear.addEventListener("click", () => { applyFilter({ keyword: "" }); el.search.focus(); });

    el.sort.addEventListener("change", async e => {
      const sort = e.target.value;
      if (sort === "distance" && !state.position) {
        Notify.info("Đang lấy vị trí của bạn...");
        state.position = await Helpers.getCurrentPosition();
        if (!state.position) Notify.warning("Không lấy được vị trí, danh sách giữ thứ tự mặc định.");
      }
      applyFilter({ sort });
    });
    el.openNow.addEventListener("change", e => applyFilter({ openNow: e.target.checked }));

    el.cities.addEventListener("click", e => { const b = e.target.closest("[data-city]"); if (b) applyFilter({ city: b.dataset.city }); });
    el.types.addEventListener("click", e => { const b = e.target.closest("[data-type]"); if (b) applyFilter({ type: b.dataset.type }); });
    el.reset.addEventListener("click", () => applyFilter({ keyword: "", city: "all", type: "all", openNow: false }));

    el.grid.addEventListener("click", e => { const b = e.target.closest("[data-detail]"); if (b) showDetail(b.dataset.detail); });
    $("#toggleMapBtn").addEventListener("click", () => Notify.info("Bản đồ số đang được phát triển."));
  }

  /* ---------- Khởi tạo ---------- */
  async function init() {
    PublicNavbar.render();
    SiteFooter.render();
    renderChips(el.cities, APP_CONFIG.CITIES, "city", false);
    renderChips(el.types, APP_CONFIG.MUSEUM_TYPES, "type", true);
    readUrl();
    syncControls();
    bindEvents();
    load();
    try {
      const s = await MuseumService.stats();
      $("#statPartnerCount").textContent = Format.number(s.partner_count);
    } catch { /* giữ số mặc định */ }
  }

  init();
})();
