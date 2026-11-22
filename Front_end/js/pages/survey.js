/* survey.js — Khảo sát hài lòng (pages/survey.html)
   Tương tác giao diện của trang. Các hàm được gọi từ thuộc tính onclick trong HTML nên để ở phạm vi toàn cục. */

PublicNavbar.render();
SiteFooter.render();

    // Rating State Tracking
    const ratingLabels = {
      1: "Rất chưa hài lòng",
      2: "Chưa hài lòng",
      3: "Bình thường / Tạm ổn",
      4: "Hài lòng",
      5: "Tuyệt vời & Ấn tượng"
    };

    const criteriaGroups = document.querySelectorAll('.criterion-group');
    const progressFill = document.getElementById('progress-fill');
    const progressPercent = document.getElementById('progress-percent');
    const charCounter = document.getElementById('char-counter');
    const feedbackText = document.getElementById('feedback-text');

    // Handle Star Clicks
    criteriaGroups.forEach((group) => {
      const stars = group.querySelectorAll('.star-btn');
      const label = group.querySelector('.rating-label');

      stars.forEach((btn) => {
        btn.addEventListener('click', () => {
          const rating = parseInt(btn.getAttribute('data-val'), 10);
          group.setAttribute('data-rating', rating);

          // Update star visuals
          stars.forEach((s) => {
            const sVal = parseInt(s.getAttribute('data-val'), 10);
            const icon = s.querySelector('.material-symbols-outlined');
            if (sVal <= rating) {
              s.classList.remove('text-surface-container-highest');
              s.classList.add('text-secondary');
              icon.style.fontVariationSettings = "'FILL' 1";
            } else {
              s.classList.add('text-surface-container-highest');
              s.classList.remove('text-secondary');
              icon.style.fontVariationSettings = "'FILL' 0";
            }
          });

          // Update text description
          if (label) {
            label.textContent = ratingLabels[rating];
            label.className = "rating-label font-label-md text-label-md font-bold text-secondary";
          }

          calculateProgress();
        });
      });
    });

    // Character Counter for Textarea
    if (feedbackText && charCounter) {
      feedbackText.addEventListener('input', (e) => {
        const length = e.target.value.length;
        charCounter.textContent = length;
        calculateProgress();
      });
    }

    // Dynamic Progress Meter Calculation
    function calculateProgress() {
      let ratedCount = 0;
      criteriaGroups.forEach((group) => {
        if (parseInt(group.getAttribute('data-rating') || '0', 10) > 0) {
          ratedCount++;
        }
      });

      // 5 criteria = 10% each (50% max) + 50% base for step 1
      const criteriaScore = Math.round((ratedCount / criteriaGroups.length) * 40);
      const textBonus = feedbackText.value.trim().length > 10 ? 10 : 0;
      const totalPct = Math.min(100, 50 + criteriaScore + textBonus);

      if (progressFill && progressPercent) {
        progressFill.style.width = totalPct + '%';
        if (totalPct === 100) {
          progressPercent.textContent = "Hoàn thành 100%";
        } else {
          progressPercent.textContent = "Bước 1/2 (" + totalPct + "%)";
        }
      }
    }

    // Identity Mode Toggle
    function setIdentityMode(mode) {
      const namedBtn = document.getElementById('btn-opt-named');
      const anonBtn = document.getElementById('btn-opt-anon');

      if (mode === 'named') {
        namedBtn.className = "px-3 py-1.5 rounded-lg font-label-md text-label-md transition-all font-semibold bg-surface-container-lowest text-primary shadow-sm";
        anonBtn.className = "px-3 py-1.5 rounded-lg font-label-md text-label-md transition-all font-semibold text-on-surface-variant hover:text-on-surface";
      } else {
        anonBtn.className = "px-3 py-1.5 rounded-lg font-label-md text-label-md transition-all font-semibold bg-surface-container-lowest text-primary shadow-sm";
        namedBtn.className = "px-3 py-1.5 rounded-lg font-label-md text-label-md transition-all font-semibold text-on-surface-variant hover:text-on-surface";
      }
    }

    // Modal Display Functions
    function openThankYouModal() {
      const modal = document.getElementById('thank-you-modal');
      const card = document.getElementById('thank-you-card');
      modal.classList.remove('opacity-0', 'pointer-events-none');
      card.classList.remove('scale-95');
      card.classList.add('scale-100');
    }

    function closeThankYouModal() {
      const modal = document.getElementById('thank-you-modal');
      const card = document.getElementById('thank-you-card');
      modal.classList.add('opacity-0', 'pointer-events-none');
      card.classList.remove('scale-100');
      card.classList.add('scale-95');
    }

    // Copy Voucher Code
    function copyVoucherCode() {
      const code = document.getElementById('voucher-code').textContent.trim();
      navigator.clipboard.writeText(code).then(() => {
        const btnText = document.getElementById('copy-btn-text');
        btnText.textContent = "Đã chép!";
        setTimeout(() => {
          btnText.textContent = "Sao chép mã";
        }, 2000);
      });
    }
  
