/* ticket-detail.js — Chi tiết vé (pages/ticket-detail.html)
   Tương tác giao diện của trang. Các hàm được gọi từ thuộc tính onclick trong HTML nên để ở phạm vi toàn cục. */

PublicNavbar.render();
SiteFooter.render();

    let currentTicketState = 'valid';

    function setTicketState(state) {
      currentTicketState = state;
      const validBtn = document.getElementById('toggle-valid-btn');
      const usedBtn = document.getElementById('toggle-used-btn');
      const usedStamp = document.getElementById('used-stamp');
      const qrMatrix = document.getElementById('qr-matrix-wrapper');
      const scanLaser = document.getElementById('scan-laser');
      const qrZone = document.getElementById('qr-zone');
      const serial = document.getElementById('ticket-serial');

      if (state === 'used') {
        // Toggle Active Tab Visual
        validBtn.classList.remove('bg-surface-container-lowest', 'text-primary', 'shadow-sm');
        validBtn.classList.add('text-on-surface-variant');
        usedBtn.classList.add('bg-surface-container-lowest', 'text-primary', 'shadow-sm');
        usedBtn.classList.remove('text-on-surface-variant');

        // Show Stamped Watermark
        usedStamp.classList.remove('hidden');

        // Mute & Dim QR Matrix
        qrMatrix.classList.add('opacity-30', 'grayscale');
        if (scanLaser) scanLaser.classList.add('hidden');
        qrZone.classList.add('bg-surface-dim/40');

        // Update Serial Text Annotation
        serial.innerHTML = 'VN-HIS-89214-SEC <span class="text-xs text-error font-sans font-normal ml-1">[ĐÃ QUA CỔNG]</span>';
      } else {
        // Toggle Active Tab Visual
        usedBtn.classList.remove('bg-surface-container-lowest', 'text-primary', 'shadow-sm');
        usedBtn.classList.add('text-on-surface-variant');
        validBtn.classList.add('bg-surface-container-lowest', 'text-primary', 'shadow-sm');
        validBtn.classList.remove('text-on-surface-variant');

        // Hide Stamp
        usedStamp.classList.add('hidden');

        // Restore Crisp QR
        qrMatrix.classList.remove('opacity-30', 'grayscale');
        if (scanLaser) scanLaser.classList.remove('hidden');
        qrZone.classList.remove('bg-surface-dim/40');

        // Restore Normal Serial Text
        serial.innerHTML = 'VN-HIS-89214-SEC';
      }
    }

    // Laser scanning bar periodic animation
    setInterval(() => {
      const laser = document.getElementById('scan-laser');
      if (laser && currentTicketState === 'valid') {
        const currentTop = laser.style.top;
        laser.style.top = currentTop === '85%' ? '15%' : '85%';
      }
    }, 1800);

    function openReviewModal() {
      document.getElementById('review-modal').classList.remove('hidden');
    }

    function closeReviewModal() {
      document.getElementById('review-modal').classList.add('hidden');
    }

    function selectStar(count) {
      Notify.info('Bạn đã chọn ' + count + ' sao. Cảm ơn sự đồng hành của bạn!');
    }

    function submitReview() {
      Notify.info('Cảm ơn bạn! Đánh giá đã được ghi nhận vào hệ thống Bảo Tàng Di Sản.');
      closeReviewModal();
    }
  
