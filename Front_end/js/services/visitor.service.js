/* Quản lý đoàn khách */
window.VisitorService = {
  list: (filter = {}) => ApiService.get(API_CONFIG.ENDPOINTS.GROUPS, filter),
  get: (id) => ApiService.get(`${API_CONFIG.ENDPOINTS.GROUPS}/${id}`),
  save: (g) => (g.id ? ApiService.put(`${API_CONFIG.ENDPOINTS.GROUPS}/${g.id}`, g) : ApiService.post(API_CONFIG.ENDPOINTS.GROUPS, { ...g, status: "pending" })),
  setStatus: (id, status) => ApiService.put(`${API_CONFIG.ENDPOINTS.GROUPS}/${id}`, { status }),
  remove: (id) => ApiService.delete(`${API_CONFIG.ENDPOINTS.GROUPS}/${id}`),
};
