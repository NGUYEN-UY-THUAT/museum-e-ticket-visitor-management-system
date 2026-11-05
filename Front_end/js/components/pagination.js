/* Thanh phân trang. Dùng: Pagination.render(el, { page, totalPages, total, onChange(page) }) */
window.Pagination = (function () {
  /** [1, 2, 3, "...", 12] */
  function pageList(page, total) {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const set = new Set([1, total, page - 1, page, page + 1]);
    if (page <= 3) [2, 3, 4].forEach((p) => set.add(p));
    if (page >= total - 2) [total - 3, total - 2, total - 1].forEach((p) => set.add(p));
    const pages = [...set].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
    return pages.flatMap((p, i) => (i && p - pages[i - 1] > 1 ? ["...", p] : [p]));
  }

  return {
    pageList,
    render(el, { page, totalPages, total, onChange }) {
      if (!el) return;
      el.hidden = total === 0;
      if (!total) return;
      const btn = (p) => (p === "..." ? '<span class="pagination__ellipsis">...</span>' : `<button class="pagination__btn${p === page ? " is-active" : ""}" type="button" data-page="${p}"${p === page ? ' aria-current="page"' : ""}>${p}</button>`);
      el.innerHTML = `
        <p class="pagination__summary">Trang <strong>${page}</strong> trên tổng số <strong>${totalPages}</strong> trang (${total} kết quả)</p>
        <nav class="pagination__nav" aria-label="Phân trang">
          <button class="pagination__btn" type="button" data-page="${page - 1}" aria-label="Trang trước" ${page <= 1 ? "disabled" : ""}><span class="icon">chevron_left</span></button>
          ${pageList(page, totalPages).map(btn).join("")}
          <button class="pagination__btn" type="button" data-page="${page + 1}" aria-label="Trang sau" ${page >= totalPages ? "disabled" : ""}><span class="icon">chevron_right</span></button>
        </nav>`;
      el.querySelectorAll("button[data-page]").forEach((b) =>
        b.addEventListener("click", () => {
          const p = Number(b.dataset.page);
          if (p !== page && p >= 1 && p <= totalPages) onChange(p);
        }),
      );
    },
  };
})();
