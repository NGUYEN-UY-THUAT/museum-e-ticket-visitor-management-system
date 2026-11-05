/* Chân trang của trang khách tham quan. Dùng: <footer id="siteFooter"></footer> + SiteFooter.render() */
window.SiteFooter = (function () {
  const url = (k) => Helpers.routeUrl(k);
  const COLUMNS = [
    {
      title: "Khám phá & Trải nghiệm",
      links: [
        ["Hệ thống các bảo tàng thành viên", "MUSEUMS"],
        ["Triển lãm chuyên đề & Sự kiện", "EVENTS"],
        ["Đặt vé cá nhân & Gia đình", "BOOKING"],
        ["Chính sách vé đoàn & Giáo dục", "GROUP_BOOKING"],
        ["Khảo sát trải nghiệm tham quan", "SURVEY"],
      ],
    },
    {
      title: "Dịch vụ vé & Khách hàng",
      links: [
        ["Tra cứu & Quản lý vé điện tử", "MY_TICKETS"],
        ["Hướng dẫn sử dụng mã QR soát vé", null],
        ["Chính sách đổi trả & Hoàn tiền vé", null],
        ["Quy định tham quan bảo tàng", null],
        ["Cổng đăng nhập cán bộ", "LOGIN"],
      ],
    },
  ];
  const CONTACT = {
    address: "01 Tràng Tiền, Quận Hoàn Kiếm, TP. Hà Nội",
    hours: "Giờ đón khách: 08:00 - 17:00 (Thứ 3 - Chủ Nhật)",
    hotline: "Hotline hỗ trợ: 1900 8899 (08:00 - 18:00 hàng ngày)",
    email: "hotro@baotangdisan.gov.vn",
  };

  const column = (c) => `
    <div class="site-footer__col">
      <h3 class="site-footer__title">${Format.escape(c.title)}</h3>
      <ul class="site-footer__links">${c.links.map(([label, key]) => `<li><a href="${key ? url(key) : "#"}">${Format.escape(label)}</a></li>`).join("")}</ul>
    </div>`;

  return {
    render(containerId = "siteFooter") {
      const el = document.getElementById(containerId);
      if (!el) return;
      el.innerHTML = `
        <div class="site-footer">
          <div class="container site-footer__inner">
            <div class="site-footer__grid">
              <div class="site-footer__col site-footer__col--brand">
                <div class="site-footer__brand">
                  <span class="site-footer__logo"><span class="icon icon--22">museum</span></span>
                  <span class="site-footer__brand-name">${Format.escape(APP_CONFIG.SITE_NAME)}</span>
                </div>
                <p class="site-footer__text">Hệ thống phân phối vé điện tử và kết nối khách tham quan các bảo tàng, di tích văn hóa quốc gia. Nền tảng phục vụ sứ mệnh tôn vinh, bảo tồn và lan tỏa giá trị di sản Việt Nam.</p>
                <div class="site-footer__contacts">
                  <div class="site-footer__contact"><span class="icon icon--18">location_on</span><span>${CONTACT.address}</span></div>
                  <div class="site-footer__contact"><span class="icon icon--18">schedule</span><span>${CONTACT.hours}</span></div>
                  <div class="site-footer__contact"><span class="icon icon--18">call</span><span>${CONTACT.hotline}</span></div>
                </div>
              </div>
              ${COLUMNS.map(column).join("")}
              <div class="site-footer__col">
                <h3 class="site-footer__title">Bảo tồn số di sản</h3>
                <p class="site-footer__text">Hợp tác cùng Cục Di sản Văn hóa Việt Nam trong chương trình hiện đại hóa dịch vụ công và số hóa không gian trưng bày.</p>
                <div class="site-footer__badges">
                  <span class="site-footer__badge"><span class="icon icon--24">verified</span></span>
                  <span class="site-footer__badge"><span class="icon icon--24">qr_code_scanner</span></span>
                  <span class="site-footer__badge"><span class="icon icon--24">nature_people</span></span>
                </div>
                <p class="site-footer__email">Email hỗ trợ: <a href="mailto:${CONTACT.email}">${CONTACT.email}</a></p>
              </div>
            </div>
            <div class="site-footer__bottom">
              <p>© ${new Date().getFullYear()} Cổng Vé &amp; Quản trị Bảo tàng Di sản Quốc gia. Tất cả quyền được bảo lưu.</p>
              <div class="site-footer__legal"><a href="#">Chính sách bảo mật</a><a href="#">Điều khoản dịch vụ</a><a href="#">Quy chế hoạt động</a></div>
            </div>
          </div>
        </div>`;
    },
  };
})();
