/* policies.js — Hướng dẫn & chính sách (pages/policies.html)
   Tô sáng mục đang xem trong mục lục; mở đúng mục khi vào bằng link có #. */
PublicNavbar.render();
SiteFooter.render();

(function () {
  const links = [...document.querySelectorAll("#policyNav .policy-link")];
  const setActive = (id) => links.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === "#" + id));

  const observer = new IntersectionObserver(
    (entries) => entries.filter((e) => e.isIntersecting).forEach((e) => setActive(e.target.id)),
    { rootMargin: "-30% 0px -60% 0px" }
  );
  document.querySelectorAll(".policy-section").forEach((s) => observer.observe(s));
  setActive(location.hash ? location.hash.slice(1) : "qr-guide");
})();
