/* my-tickets.js — Vé của tôi (pages/my-tickets.html)
   Tương tác giao diện của trang. Các hàm được gọi từ thuộc tính onclick trong HTML nên để ở phạm vi toàn cục. */

PublicNavbar.render();
SiteFooter.render();

    function openQrModal(code, title, time) {
      document.getElementById('modalTicketCode').innerText = '#' + code.replace('#', '');
      document.getElementById('modalMuseumTitle').innerText = title;
      document.getElementById('modalTimeSlot').innerText = time;
      
      const modal = document.getElementById('qrModal');
      const card = document.getElementById('qrModalCard');
      modal.classList.remove('opacity-0', 'pointer-events-none');
      card.classList.remove('scale-95');
      card.classList.add('scale-100');
    }

    function closeQrModal() {
      const modal = document.getElementById('qrModal');
      const card = document.getElementById('qrModalCard');
      modal.classList.add('opacity-0', 'pointer-events-none');
      card.classList.remove('scale-100');
      card.classList.add('scale-95');
    }

    function switchTicketTab(tabType) {
      const tabs = ['upcoming', 'used', 'expired'];
      tabs.forEach(t => {
        const btn = document.getElementById('tab-' + t);
        if(t === tabType) {
          btn.className = 'tab-btn flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-on-primary font-label-lg text-label-lg shadow-sm transition-all duration-200';
        } else {
          btn.className = 'tab-btn flex items-center gap-2 px-5 py-2.5 rounded-lg text-on-surface-variant hover:text-primary font-label-lg text-label-lg transition-all duration-200';
        }
      });
    }

    // Close modal on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeQrModal();
    });
  
