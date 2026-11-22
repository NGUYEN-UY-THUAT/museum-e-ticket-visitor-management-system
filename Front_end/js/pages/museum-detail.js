/* museum-detail.js — Chi tiết bảo tàng (pages/museum-detail.html)
   Tương tác giao diện của trang. Các hàm được gọi từ thuộc tính onclick trong HTML nên để ở phạm vi toàn cục. */

PublicNavbar.render();
SiteFooter.render();

  // Tab switching logic for museum detail screen
  function switchMuseumTab(tabKey, activeBtn) {
    const panes = document.querySelectorAll('.museum-tab-pane');
    panes.forEach(pane => pane.classList.add('hidden'));

    const targetPane = document.getElementById('tab-' + tabKey);
    if (targetPane) {
      targetPane.classList.remove('hidden');
    }

    const buttons = document.querySelectorAll('.museum-tab-btn');
    buttons.forEach(btn => {
      btn.classList.remove('bg-primary', 'text-on-primary', 'shadow-sm');
      btn.classList.add('bg-surface-container-low', 'text-on-surface-variant');
    });

    if (activeBtn) {
      activeBtn.classList.remove('bg-surface-container-low', 'text-on-surface-variant');
      activeBtn.classList.add('bg-primary', 'text-on-primary', 'shadow-sm');
    }
  }

  // Quick ticket calculator
  let counts = { adult: 1, student: 0 };
  const prices = { adult: 40000, student: 20000 };

  function adjustCount(type, delta) {
    counts[type] = Math.max(0, counts[type] + delta);
    if (type === 'adult' && counts.adult === 0 && counts.student === 0) {
      counts.adult = 1; // ensure minimum 1 ticket
    }
    const elem = document.getElementById(type + '-count');
    if (elem) elem.innerText = counts[type];

    const total = (counts.adult * prices.adult) + (counts.student * prices.student);
    const totalElem = document.getElementById('total-price');
    if (totalElem) {
      totalElem.innerText = total.toLocaleString('vi-VN') + ' đ';
    }
  }

  // Initialize view: ensure all panes visible on load except hidden by tab clicks, or start with first tab
  document.addEventListener('DOMContentLoaded', function() {
    // Show tab-intro by default, hide others
    const panes = document.querySelectorAll('.museum-tab-pane');
    panes.forEach((p, idx) => {
      if (idx !== 0) p.classList.add('hidden');
    });
  });
