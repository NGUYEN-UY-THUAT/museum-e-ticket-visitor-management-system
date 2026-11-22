/* payment-result.js — Kết quả thanh toán (pages/payment-result.html)
   Tương tác giao diện của trang. Các hàm được gọi từ thuộc tính onclick trong HTML nên để ở phạm vi toàn cục. */

PublicNavbar.render();
SiteFooter.render();

    function switchState(state) {
      const successBlock = document.getElementById('state-success');
      const failedBlock = document.getElementById('state-failed');
      const btnSuccess = document.getElementById('btn-show-success');
      const btnFailed = document.getElementById('btn-show-failed');

      if (state === 'success') {
        successBlock.classList.remove('hidden');
        failedBlock.classList.add('hidden');
        
        btnSuccess.className = "px-3.5 py-1.5 rounded-lg font-label-md text-label-md transition-all duration-200 bg-surface-container-lowest text-primary shadow-sm font-semibold flex items-center gap-1.5";
        btnFailed.className = "px-3.5 py-1.5 rounded-lg font-label-md text-label-md transition-all duration-200 text-on-surface-variant hover:text-primary flex items-center gap-1.5";
      } else {
        successBlock.classList.add('hidden');
        failedBlock.classList.remove('hidden');

        btnFailed.className = "px-3.5 py-1.5 rounded-lg font-label-md text-label-md transition-all duration-200 bg-surface-container-lowest text-error shadow-sm font-semibold flex items-center gap-1.5";
        btnSuccess.className = "px-3.5 py-1.5 rounded-lg font-label-md text-label-md transition-all duration-200 text-on-surface-variant hover:text-primary flex items-center gap-1.5";
      }
    }

    function showToast(msg) {
      const toast = document.getElementById('action-toast');
      const toastMsg = document.getElementById('toast-message');
      toastMsg.textContent = msg;
      toast.classList.remove('translate-y-20', 'opacity-0');
      toast.classList.add('translate-y-0', 'opacity-100');

      setTimeout(() => {
        toast.classList.add('translate-y-20', 'opacity-0');
        toast.classList.remove('translate-y-0', 'opacity-100');
      }, 3000);
    }

    function handleDownloadPDF() {
      showToast("Đang kết xuất và tải tệp vé 'Ve-Tham-Quan-VN-89214.pdf'...");
    }

    function handleViewTicket() {
      showToast("Đang chuyển tiếp đến trang 'Vé của tôi' để lưu trữ thẻ vé...");
    }

    function handleRetryPayment() {
      showToast("Khởi tạo lại cổng thanh toán VNPAY-QR...");
    }

    function handleOtherMethod() {
      showToast("Chuyển về màn hình chọn thẻ ATM nội địa / Visa / Mastercard...");
    }

    // Default view is Success Focus
    document.addEventListener("DOMContentLoaded", () => {
      document.getElementById('state-failed').classList.add('hidden');
    });
  
