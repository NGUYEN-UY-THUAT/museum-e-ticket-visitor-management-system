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

/* ---------- Nội dung bộ câu hỏi (trang quản trị survey-builder.html) ----------
   Mỗi câu "rating" gắn với một cột điểm của bảng surveys (overall, exhibits, staff, facilities),
   câu "text" gắn với cột comment — nên loại câu hỏi cố định, chỉ sửa nội dung hiển thị. */
Object.assign(window.SurveyService, {
  DEFAULT_CONFIG: {
    title: "Khảo sát trải nghiệm tham quan",
    intro: "Cảm ơn quý khách đã ghé thăm bảo tàng. Xin dành 1 phút chia sẻ cảm nhận để chúng tôi phục vụ tốt hơn.",
    send_email: true, // gửi email mời khảo sát sau khi khách được soát vé
    send_after_hours: 2,
    link_valid_hours: 48,
    questions: [
      { key: "overall", type: "rating", title: "Quý khách đánh giá chung chuyến tham quan thế nào?", hint: "", required: true, enabled: true },
      { key: "exhibits", type: "rating", title: "Hiện vật và cách trưng bày có hấp dẫn không?", hint: "Bao gồm bảng chú thích, ánh sáng, bố cục phòng trưng bày.", required: true, enabled: true },
      { key: "staff", type: "rating", title: "Thái độ phục vụ của nhân viên bảo tàng?", hint: "Nhân viên soát vé, thuyết minh, bảo vệ.", required: true, enabled: true },
      { key: "facilities", type: "rating", title: "Cơ sở vật chất (lối đi, nhà vệ sinh, chỗ nghỉ) có thuận tiện không?", hint: "", required: false, enabled: true },
      { key: "comment", type: "text", title: "Quý khách có góp ý gì thêm cho bảo tàng?", hint: "Không bắt buộc.", placeholder: "Nhập góp ý của quý khách...", required: false, enabled: true },
    ],
    star_labels: ["Rất không hài lòng", "Chưa hài lòng", "Bình thường", "Hài lòng", "Rất hài lòng"],
  },
  async getConfig() {
    const c = await ApiService.get(API_CONFIG.ENDPOINTS.SURVEY_CONFIG);
    return c && c.questions ? c : structuredClone(this.DEFAULT_CONFIG);
  },
  saveConfig: (c) => ApiService.put(API_CONFIG.ENDPOINTS.SURVEY_CONFIG, { ...c, updated_at: new Date().toISOString() }),
});
