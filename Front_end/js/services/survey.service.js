window.SurveyService = {
  CRITERIA: { overall: "Tổng thể", exhibits: "Hiện vật & trưng bày", staff: "Nhân viên", facilities: "Cơ sở vật chất" },
  list: (filter = {}) => ApiService.get(API_CONFIG.ENDPOINTS.SURVEYS, filter),
  submit: (s) => ApiService.post(API_CONFIG.ENDPOINTS.SURVEYS, s),
  summary(list) {
    const avg = (k) => (list.length ? list.reduce((s, x) => s + Number(x[k]), 0) / list.length : 0);
    const res = { count: list.length };
    for (const k of Object.keys(this.CRITERIA)) res[k] = avg(k);
    res.satisfied = list.length ? list.filter((x) => x.overall >= 4).length / list.length : 0;
    return res;
  },
};
