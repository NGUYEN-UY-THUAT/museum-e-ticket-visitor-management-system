/* event-list.js — Sự kiện & Triển lãm (pages/event-list.html)
   Tương tác giao diện của trang. Các hàm được gọi từ thuộc tính onclick trong HTML nên để ở phạm vi toàn cục. */

PublicNavbar.render();
SiteFooter.render();

  // Dynamic switch between Grid View and Calendar View
  const gridBtn = document.getElementById('viewGridBtn');
  const calBtn = document.getElementById('viewCalendarBtn');
  const eventsGrid = document.getElementById('eventsGrid');
  const eventsCalendar = document.getElementById('eventsCalendar');

  if (gridBtn && calBtn && eventsGrid && eventsCalendar) {
    gridBtn.addEventListener('click', () => {
      eventsGrid.classList.remove('hidden');
      eventsCalendar.classList.add('hidden');
      eventsCalendar.classList.remove('flex');
      
      gridBtn.classList.add('bg-surface-container-lowest', 'shadow-sm', 'text-primary');
      gridBtn.classList.remove('text-on-surface-variant');

      calBtn.classList.remove('bg-surface-container-lowest', 'shadow-sm', 'text-primary');
      calBtn.classList.add('text-on-surface-variant');
    });

    calBtn.addEventListener('click', () => {
      eventsGrid.classList.add('hidden');
      eventsCalendar.classList.remove('hidden');
      eventsCalendar.classList.add('flex');

      calBtn.classList.add('bg-surface-container-lowest', 'shadow-sm', 'text-primary');
      calBtn.classList.remove('text-on-surface-variant');

      gridBtn.classList.remove('bg-surface-container-lowest', 'shadow-sm', 'text-primary');
      gridBtn.classList.add('text-on-surface-variant');
    });
  }

  // Month tab active state switching
  const monthContainer = document.getElementById('monthFilterContainer');
  if (monthContainer) {
    const buttons = monthContainer.querySelectorAll('button');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        buttons.forEach(b => {
          b.className = 'px-4 py-2 rounded-xl font-label-lg text-label-lg bg-surface-container hover:bg-surface-container-high text-on-surface whitespace-nowrap transition-all';
        });
        btn.className = 'px-4 py-2 rounded-xl font-label-lg text-label-lg bg-primary text-on-primary whitespace-nowrap shadow-sm transition-all';
      });
    });
  }
