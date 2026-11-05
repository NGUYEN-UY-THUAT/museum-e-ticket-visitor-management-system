/* Thẻ bảo tàng ở trang chủ. Dùng: MuseumCard.renderList(gridEl, museums) */
window.MuseumCard = (function () {
  const esc = (s) => Format.escape(s);

  function cityLabel(code) {
    const c = APP_CONFIG.CITIES.find((x) => x.code === code);
    return c ? c.short || c.label : "";
  }

  function media(m) {
    const open = Helpers.isOpenNow(m);
    const image = m.image_url ? `<div class="museum-card__image" role="img" aria-label="${esc(m.name)}" style="background-image:url('${encodeURI(m.image_url)}')"></div>` : `<div class="museum-card__image museum-card__image--placeholder" aria-hidden="true"><span class="icon icon--44">${esc(m.badge_icon || "museum")}</span></div>`;
    return `
      <div class="museum-card__media">
        ${image}
        <div class="museum-card__overlay"></div>
        <div class="museum-card__badges">
          <span class="media-badge media-badge--heritage"><span class="icon icon--14">${esc(m.badge_icon || "stars")}</span>${esc(m.badge_label)}</span>
          <span class="media-badge media-badge--status${open ? "" : " media-badge--closed"}"><span class="media-badge__dot"></span>${open ? "Đang mở cửa" : "Đã đóng cửa"}</span>
        </div>
        <div class="museum-card__meta">
          <div class="museum-card__rating">
            <span class="icon icon--16 icon--filled">star</span>
            <strong>${Format.rating(m.rating)}</strong>
            <small>(${Format.reviewCount(m.review_count)} đánh giá)</small>
          </div>
          <span class="museum-card__city">${esc(cityLabel(m.city_code))}</span>
        </div>
      </div>`;
  }

  function template(m) {
    return `
      <article class="museum-card" data-id="${esc(m.id)}">
        ${media(m)}
        <div class="museum-card__body">
          <div>
            <h3 class="museum-card__title line-clamp-1">${esc(m.name)}</h3>
            <p class="museum-card__desc line-clamp-2">${esc(m.description)}</p>
          </div>
          <div class="museum-card__info">
            <div class="museum-card__info-row"><span class="icon icon--18">location_on</span><span class="truncate">${esc(m.address)}</span></div>
            <div class="museum-card__info-row"><span class="icon icon--18">schedule</span><span>${esc(Format.openingHours(m))}</span></div>
          </div>
          <div class="museum-card__footer">
            <div>
              <p class="museum-card__price-label">Vé vào cửa</p>
              <p class="museum-card__price">Từ ${Format.currency(m.min_price)}</p>
            </div>
            <div class="museum-card__actions">
              <button class="btn btn--soft btn--sm" type="button" data-detail="${esc(m.id)}">Xem chi tiết</button>
              <a class="btn btn--primary btn--sm" href="${Helpers.routeUrl("BOOKING", { museum_id: m.id })}">
                <span>Đặt vé nhanh</span><span class="icon icon--16">arrow_forward</span>
              </a>
            </div>
          </div>
        </div>
      </article>`;
  }

  return {
    template,
    skeleton: (n = 3) => Array.from({ length: n }, () => '<div class="museum-card museum-card--skeleton" aria-hidden="true"></div>').join(""),
    renderList(container, list) {
      container.innerHTML = list.map(template).join("");
    },
  };
})();
