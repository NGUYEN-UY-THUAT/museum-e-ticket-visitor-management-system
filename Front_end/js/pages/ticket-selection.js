/* ticket-selection.js — Chọn vé & khung giờ (pages/ticket-selection.html)
   Tương tác giao diện của trang. Các hàm được gọi từ thuộc tính onclick trong HTML nên để ở phạm vi toàn cục. */

PublicNavbar.render();
SiteFooter.render();

  // Simple interactive counter logic for demo fidelity
  const ticketPrices = {
    adult: 60000,
    child: 30000,
    student: 40000,
    intl: 100000
  };

  const ticketCounts = {
    adult: 2,
    child: 1,
    student: 1,
    intl: 0
  };

  function updateTicket(type, change) {
    const newQty = ticketCounts[type] + change;
    if (newQty < 0) return;
    if (newQty > 10) return;

    ticketCounts[type] = newQty;
    document.getElementById(`qty-${type}`).innerText = newQty;

    // Recalculate Total
    let total = 0;
    let totalTickets = 0;
    for (const key in ticketCounts) {
      total += ticketCounts[key] * ticketPrices[key];
      totalTickets += ticketCounts[key];
    }

    // Format VND
    const formattedTotal = total.toLocaleString('vi-VN');
    document.getElementById('order-grand-total').innerText = formattedTotal;

    // Update banner
    const bannerTotalEl = document.getElementById('banner-total-tickets');
    if (bannerTotalEl) {
      bannerTotalEl.innerText = `${totalTickets} vé hợp lệ`;
    }

    // International ticket summary row toggle
    const intlRow = document.getElementById('intl-summary-line');
    if (intlRow) {
      if (ticketCounts.intl > 0) {
        intlRow.classList.remove('hidden');
        intlRow.classList.add('flex');
        document.getElementById('intl-count').innerText = ticketCounts.intl;
        document.getElementById('intl-cost').innerText = (ticketCounts.intl * ticketPrices.intl).toLocaleString('vi-VN') + ' đ';
      } else {
        intlRow.classList.add('hidden');
        intlRow.classList.remove('flex');
      }
    }
  }
