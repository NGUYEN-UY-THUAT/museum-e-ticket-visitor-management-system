/* checkout.js — Thanh toán (pages/checkout.html)
   Tương tác giao diện của trang. Các hàm được gọi từ thuộc tính onclick trong HTML nên để ở phạm vi toàn cục. */

PublicNavbar.render();
SiteFooter.render();

    // Countdown Timer logic
    (function initCheckoutTimer() {
      let durationSeconds = 9 * 60 + 45; // 09:45
      const timerDisplay = document.getElementById('countdown-timer');
      
      const interval = setInterval(() => {
        if (!timerDisplay) return;
        durationSeconds--;
        if (durationSeconds <= 0) {
          clearInterval(interval);
          timerDisplay.textContent = '00:00';
          Notify.info('Thời gian giữ vé đã hết. Vui lòng chọn lại suất vào cửa.');
          return;
        }
        const m = Math.floor(durationSeconds / 60);
        const s = durationSeconds % 60;
        timerDisplay.textContent = `${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`;
      }, 1000);

      // Payment Method Card Highlighting
      const paymentOptions = document.querySelectorAll('#payment-options label');
      paymentOptions.forEach(card => {
        card.addEventListener('click', () => {
          paymentOptions.forEach(c => {
            c.classList.remove('ring-2', 'ring-secondary/80');
          });
          card.classList.add('ring-2', 'ring-secondary/80');
        });
      });

      // Submit Button Flow
      const submitBtn = document.getElementById('submit-payment-btn');
      const emailInput = document.getElementById('email-address');
      const modalEmailTarget = document.getElementById('modal-email-target');
      const paymentModal = document.getElementById('payment-modal');

      if (submitBtn) {
        submitBtn.addEventListener('click', () => {
          if (emailInput && modalEmailTarget) {
            modalEmailTarget.textContent = emailInput.value || 'an.nguyen@example.com';
          }
          if (paymentModal) {
            paymentModal.classList.remove('hidden');
          }
        });
      }
    })();
  
