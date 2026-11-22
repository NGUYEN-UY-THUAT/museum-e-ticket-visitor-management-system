/* 404.js — Trang lỗi không tìm thấy (404.html)
   Máy chủ có thể trả trang này ở bất kỳ đường dẫn nào, nên các link được tính lại
   từ APP_CONFIG.ROUTES (thuộc tính data-route) cho đúng vị trí hiện tại. */
PublicNavbar.render();
SiteFooter.render();

document.querySelectorAll("[data-route]").forEach((a) => (a.href = Helpers.routeUrl(a.dataset.route)));
