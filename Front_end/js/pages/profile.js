/* profile.js — Hồ sơ cá nhân (pages/profile.html)
   Tương tác giao diện của trang. Các hàm được gọi từ thuộc tính onclick trong HTML nên để ở phạm vi toàn cục. */

PublicNavbar.render();
SiteFooter.render();

  function switchTab(tabId) {
    const profileTab = document.getElementById('tab-content-profile');
    const ordersTab = document.getElementById('tab-content-orders');
    const navBtnProfile = document.getElementById('nav-btn-profile');
    const navBtnOrders = document.getElementById('nav-btn-orders');

    if (tabId === 'profile') {
      profileTab.classList.remove('hidden');
      ordersTab.classList.add('hidden');
      
      navBtnProfile.className = 'tab-nav-btn w-full flex items-center justify-between px-4 py-3 rounded-xl font-label-lg text-label-lg transition-all bg-primary-container text-on-primary';
      navBtnOrders.className = 'tab-nav-btn w-full flex items-center justify-between px-4 py-3 rounded-xl font-label-lg text-label-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-all';
    } else if (tabId === 'orders') {
      profileTab.classList.add('hidden');
      ordersTab.classList.remove('hidden');

      navBtnOrders.className = 'tab-nav-btn w-full flex items-center justify-between px-4 py-3 rounded-xl font-label-lg text-label-lg transition-all bg-primary-container text-on-primary';
      navBtnProfile.className = 'tab-nav-btn w-full flex items-center justify-between px-4 py-3 rounded-xl font-label-lg text-label-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-all';
    }
  }

  function openDrawer() {
    const drawer = document.getElementById('order-drawer');
    drawer.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    const drawer = document.getElementById('order-drawer');
    drawer.classList.add('hidden');
    document.body.style.overflow = '';
  }

  function showSavedToast() {
    const toast = document.getElementById('save-toast');
    toast.classList.remove('translate-y-24', 'opacity-0');
    toast.classList.add('translate-y-0', 'opacity-100');
    setTimeout(() => {
      toast.classList.add('translate-y-24', 'opacity-0');
      toast.classList.remove('translate-y-0', 'opacity-100');
    }, 3500);
  }

  function downloadMockTickets() {
    Notify.info('Hệ thống đang trích xuất 04 vé điện tử định dạng PDF bảo mật tiêu chuẩn ICAO có gắn chữ ký số. Tệp sẽ tự động tải về!');
  }

  function downloadMockInvoice() {
    Notify.info('Hóa đơn điện tử VAT của Tổng cục Thuế với mã tra cứu #VN-HIS-89214 đang được khởi tạo.');
  }
