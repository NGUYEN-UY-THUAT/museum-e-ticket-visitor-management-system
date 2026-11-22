/* group-booking.js — Đặt vé đoàn (pages/group-booking.html)
   Tương tác giao diện của trang. Các hàm được gọi từ thuộc tính onclick trong HTML nên để ở phạm vi toàn cục. */

PublicNavbar.render();
SiteFooter.render();

  function updateDiscountHint(count) {
    const num = parseInt(count) || 0;
    const badge = document.getElementById('discount-badge');
    const note = document.getElementById('discount-note');

    if (!badge || !note) return;

    if (num < 20) {
      badge.textContent = "Chưa đủ 20 khách";
      badge.className = "px-3 py-1 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm font-semibold";
      note.textContent = "Chính sách đoàn bắt đầu áp dụng từ 20 thành viên trở lên (Mức tối thiểu 15%).";
    } else if (num < 50) {
      badge.textContent = "Chiết khấu 15%";
      badge.className = "px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-semibold";
      note.textContent = "Đoàn từ 20 đến 49 khách: Hưởng mức chiết khấu 15% kèm 01 HDV chuyên trách.";
    } else if (num <= 100) {
      badge.textContent = "Chiết khấu 20%";
      badge.className = "px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-semibold";
      note.textContent = "Đoàn từ 50 đến 100 khách: Hưởng mức chiết khấu 20% và tặng kèm kỷ yếu di sản.";
    } else {
      badge.textContent = "Chiết khấu kịch trần 25%";
      badge.className = "px-3 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm font-bold";
      note.textContent = "Đoàn quy mô lớn trên 100 khách: Hưởng mức chiết khấu tối đa 25%, hỗ trợ 02 HDV song song và làn đón tiếp VIP.";
    }
  }
