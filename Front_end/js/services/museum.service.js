/* Bảo tàng: danh sách có lọc / sắp xếp / phân trang cho trang chủ khách tham quan.
   USE_MOCK = true  -> lọc trên MUSEUM_MOCK_DATA (js/services/mock/museum.mock.js), mô phỏng đúng API cần có.
   USE_MOCK = false -> GET /api/museums?keyword=&city=&type=&sort=&openNow=&lat=&lng=&page=&pageSize=
                       backend trả { items, total, page, pageSize, totalPages }. */
window.MuseumService = (function () {
  const delay = (ms) => new Promise((r) => setTimeout(r, ms));

  function filter(list, { keyword, city = "all", type = "all", openNow = false }) {
    const q = Helpers.normalizeText(keyword);
    const now = new Date();
    return list.filter((m) => (city === "all" || m.city_code === city) && (type === "all" || m.category_code === type) && (!openNow || Helpers.isOpenNow(m, now)) && (!q || Helpers.normalizeText(`${m.name} ${m.description} ${m.address}`).includes(q)));
  }

  function sort(list, { sort = "popular", position }) {
    const items = [...list];
    const dist = (m) => Helpers.distanceKm(position.lat, position.lng, m.latitude, m.longitude);
    switch (sort) {
      case "rating":
        return items.sort((a, b) => b.rating - a.rating || b.review_count - a.review_count);
      case "price-asc":
        return items.sort((a, b) => a.min_price - b.min_price);
      case "distance":
        return position ? items.sort((a, b) => dist(a) - dist(b)) : items;
      default:
        return items.sort((a, b) => b.review_count - a.review_count); // popular
    }
  }

  return {
    /**
     * @param {{keyword?:string, city?:string, type?:string, sort?:string, openNow?:boolean,
     *          position?:{lat:number,lng:number}, page?:number, pageSize?:number}} query
     */
    async list(query = {}) {
      const page = Math.max(1, Number(query.page) || 1);
      const pageSize = Number(query.pageSize) || APP_CONFIG.HOME_PAGE_SIZE;

      if (!API_CONFIG.USE_MOCK) {
        const params = {
          keyword: query.keyword || "",
          city: query.city === "all" ? "" : query.city || "",
          type: query.type === "all" ? "" : query.type || "",
          sort: query.sort || "popular",
          openNow: query.openNow ? 1 : "",
          page,
          pageSize,
        };
        if (query.position) Object.assign(params, { lat: query.position.lat, lng: query.position.lng });
        return ApiService.get(API_CONFIG.ENDPOINTS.MUSEUMS, params);
      }

      await delay(200);
      const all = sort(filter(MUSEUM_MOCK_DATA, query), query);
      const totalPages = Math.max(1, Math.ceil(all.length / pageSize));
      return { items: all.slice((page - 1) * pageSize, page * pageSize), total: all.length, page, pageSize, totalPages };
    },

    async get(id) {
      if (!API_CONFIG.USE_MOCK) return ApiService.get(API_CONFIG.ENDPOINTS.MUSEUMS + "/" + id);
      const m = MUSEUM_MOCK_DATA.find((x) => String(x.id) === String(id));
      if (!m) throw new Error("Không tìm thấy bảo tàng");
      return m;
    },

    async stats() {
      if (!API_CONFIG.USE_MOCK) return ApiService.get(API_CONFIG.ENDPOINTS.MUSEUM_STATS);
      return MUSEUM_MOCK_STATS;
    },
  };
})();
