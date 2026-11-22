/* event-detail.js — Chi tiết sự kiện (pages/event-detail.html)
   Tương tác giao diện của trang. Các hàm được gọi từ thuộc tính onclick trong HTML nên để ở phạm vi toàn cục. */

PublicNavbar.render();
SiteFooter.render();

    let currentCount = 1;
    const pricePerTicket = 150000;
    const maxTickets = 3;

    const countDisplay = document.getElementById('ticketCountDisplay');
    const summaryCount = document.getElementById('summaryCount');
    const totalPriceDisplay = document.getElementById('totalPriceDisplay');
    const btnDecrement = document.getElementById('btnDecrement');
    const btnIncrement = document.getElementById('btnIncrement');

    function updatePrice() {
      countDisplay.textContent = currentCount;
      summaryCount.textContent = currentCount;
      const total = currentCount * pricePerTicket;
      totalPriceDisplay.textContent = total.toLocaleString('vi-VN') + 'đ';
    }

    if (btnDecrement && btnIncrement) {
      btnDecrement.addEventListener('click', () => {
        if (currentCount > 1) {
          currentCount--;
          updatePrice();
        }
      });

      btnIncrement.addEventListener('click', () => {
        if (currentCount < maxTickets) {
          currentCount++;
          updatePrice();
        } else {
          Notify.info('Chỉ còn tối đa 3 chỗ cho khung giờ này!');
        }
      });
    }

    function submitBooking() {
      const nameInput = document.getElementById('fullName');
      const emailInput = document.getElementById('emailAddress');
      
      const bookingCard = document.getElementById('bookingCard');
      const successCard = document.getElementById('successCard');
      const ticketOwner = document.getElementById('ticketOwner');
      const ticketCountBadge = document.getElementById('ticketCountBadge');
      const successEmailDisplay = document.getElementById('successEmailDisplay');

      if (nameInput && ticketOwner) {
        ticketOwner.textContent = nameInput.value || 'Khách tham quan';
      }
      if (emailInput && successEmailDisplay) {
        successEmailDisplay.textContent = emailInput.value || 'visitor@disan.vn';
      }
      if (ticketCountBadge) {
        ticketCountBadge.textContent = currentCount + ' Vé tiêu chuẩn';
      }

      bookingCard.classList.add('hidden');
      successCard.classList.remove('hidden');
      successCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    function resetToForm() {
      const bookingCard = document.getElementById('bookingCard');
      const successCard = document.getElementById('successCard');
      const soldOutCard = document.getElementById('soldOutCard');

      successCard.classList.add('hidden');
      soldOutCard.classList.add('hidden');
      bookingCard.classList.remove('hidden');
    }

    function toggleSoldOutState(isSoldOut) {
      const bookingCard = document.getElementById('bookingCard');
      const soldOutCard = document.getElementById('soldOutCard');
      const successCard = document.getElementById('successCard');

      successCard.classList.add('hidden');
      if (isSoldOut) {
        bookingCard.classList.add('hidden');
        soldOutCard.classList.remove('hidden');
      } else {
        soldOutCard.classList.add('hidden');
        bookingCard.classList.remove('hidden');
      }
    }

    const shareBtn = document.getElementById('btnShare');
    if (shareBtn) {
      shareBtn.addEventListener('click', () => {
        if (navigator.share) {
          navigator.share({
            title: 'Workshop Làm gốm & Họa tiết Trống đồng Đông Sơn',
            url: window.location.href
          }).catch(() => {});
        } else {
          navigator.clipboard.writeText(window.location.href);
          Notify.info('Đã sao chép liên kết sự kiện vào bộ nhớ tạm!');
        }
      });
    }
  
