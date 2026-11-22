/* time-slots.js — Khung giờ & Sức chứa (pages/time-slots.html)
   Khung giờ cố định = APP_CONFIG.TIME_SLOTS (giống trang đặt vé, đổi giờ của khách). */
(function () {
  if (!AdminShell.init("timeslots")) return;
  const $ = (id) => document.getElementById(id);
  const esc = (s) => Format.escape(s);
  let museums = [];
  let museum = null;
  const todayStart = () => new Date(new Date().setHours(0, 0, 0, 0));
  let weekStart = todayStart(); // 7 ngày tính từ hôm nay
  let cells = [];
  let selected = null; // {date, slot}

  const cellKey = (c) => `${c.date}|${c.slot}`;
  const LEVEL_TEXT = { ok: "Còn chỗ", busy: "Sắp đầy", full: "Hết chỗ" };
  const LEVEL_BADGE = { ok: "success", busy: "warning", full: "danger" };

  function renderGrid() {
    const days = [...new Set(cells.map((c) => c.date))];
    const today = Format.isoDate();
    const head = `<div class="slot-grid__corner"></div>` + days.map((d) => {
      const s = AdminUI.shortDay(d);
      return `<div class="slot-day${d === today ? " is-today" : ""}"><span>${s.dow}</span><b>${s.dm}</b></div>`;
    }).join("");
    const rows = APP_CONFIG.TIME_SLOTS.map((slot) => {
      const label = `<div class="slot-label">${esc(slot.replace(" - ", "–"))}</div>`;
      return label + days.map((date) => {
        const c = cells.find((x) => x.date === date && x.slot === slot);
        if (c.closed) return `<div class="slot-cell is-closed">Nghỉ</div>`;
        const lv = TimeSlotService.level(c.booked, c.capacity);
        const pct = c.capacity ? Math.min(100, Math.round((c.booked / c.capacity) * 100)) : 100;
        const past = date < today;
        return `<button type="button" class="slot-cell lv-${lv}${c.locked ? " is-locked" : ""}${past ? " is-past" : ""}${selected && cellKey(selected) === cellKey(c) ? " is-selected" : ""}" data-key="${cellKey(c)}"
          title="${esc(slot)} · ${c.booked}/${c.capacity} khách">
          <span class="slot-cell__num">${c.booked}<small>/${c.capacity}</small></span>
          ${c.locked ? `<span class="material-symbols-outlined slot-cell__lock">lock</span>` : ""}
          <span class="slot-bar"><i style="width:${pct}%"></i></span></button>`;
      }).join("");
    }).join("");
    $("grid").innerHTML = head + rows;
    $("grid").querySelectorAll(".slot-cell[data-key]").forEach((b) => b.addEventListener("click", () => select(b.dataset.key)));

    const open = cells.filter((c) => !c.closed);
    const booked = open.reduce((s, c) => s + c.booked, 0);
    const cap = open.reduce((s, c) => s + c.capacity, 0);
    $("summary").innerHTML = `<span class="material-symbols-outlined">info</span> Tổng lượt đặt trong tuần: <b>${Format.number(booked)} / ${Format.number(cap)}</b> (${cap ? Math.round((booked / cap) * 100) : 0}%)`;
  }

  function renderDetail() {
    const c = selected && cells.find((x) => cellKey(x) === cellKey(selected));
    if (!c) return;
    const lv = TimeSlotService.level(c.booked, c.capacity);
    const past = c.date < Format.isoDate();
    const defCap = Number(museum.slot_capacity) || APP_CONFIG.SLOT_CAPACITY;
    $("detail").innerHTML = `
      <div class="flex items-start justify-between gap-3">
        <div><p class="adm-panel__label">Chi tiết khung giờ</p><h2 class="adm-panel__title">${esc(c.slot)}</h2>
          <p class="adm-panel__sub">${["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"][new Date(c.date).getDay()]}, ${Format.date(c.date)}</p></div>
        <span class="hh-badge hh-badge--${c.locked ? "muted" : LEVEL_BADGE[lv]}">${c.locked ? "Tạm khóa" : LEVEL_TEXT[lv]}</span>
      </div>
      <div class="slot-booked mt-4">
        <p><b>${c.booked}</b> khách đã đặt</p>
        <p class="hh-hint">Còn ${Math.max(0, c.capacity - c.booked)} chỗ trong khung giờ này</p>
        <span class="slot-bar slot-bar--lg lv-${lv}"><i style="width:${c.capacity ? Math.min(100, (c.booked / c.capacity) * 100) : 100}%"></i></span>
      </div>
      <form id="slotForm" class="adm-panel__section flex flex-col gap-4" novalidate>
        <div class="hh-field">
          <label class="hh-label" for="capacity">Sức chứa tối đa (khách) <span class="req">*</span></label>
          <div class="flex items-center gap-2">
            <button class="hh-btn hh-btn--soft hh-btn--sm" type="button" data-step="-5" aria-label="Giảm 5">−5</button>
            <input class="hh-input text-center" id="capacity" name="capacity" type="number" min="${c.booked}" max="2000" step="1" value="${c.capacity}" ${past ? "disabled" : ""} />
            <button class="hh-btn hh-btn--soft hh-btn--sm" type="button" data-step="5" aria-label="Tăng 5">+5</button>
          </div>
          <span class="hh-error"></span>
          <span class="hh-hint">Mặc định của bảo tàng: ${defCap} khách / khung giờ. Không thể nhỏ hơn số đã đặt.</span>
        </div>
        <label class="adm-switch"><span class="adm-switch__text">Tạm khóa đặt vé trực tuyến<small>Khách không đặt thêm được vào khung giờ này; vé đã bán vẫn giữ nguyên.</small></span>
          <input type="checkbox" name="locked" ${c.locked ? "checked" : ""} ${past ? "disabled" : ""} /></label>
        ${past ? `<p class="hh-alert"><span class="material-symbols-outlined">history</span><span>Khung giờ đã qua, chỉ xem được.</span></p>` : `
        <div class="flex flex-col gap-2">
          <button class="hh-btn hh-btn--primary hh-btn--block" type="submit" id="saveBtn"><span class="material-symbols-outlined">save</span> Lưu khung giờ</button>
          ${c.override_id ? `<button class="hh-btn hh-btn--ghost hh-btn--block" type="button" id="resetBtn"><span class="material-symbols-outlined">restart_alt</span> Đặt lại mặc định</button>` : ""}
        </div>`}
      </form>`;
    const form = $("slotForm");
    form.querySelectorAll("[data-step]").forEach((b) => b.addEventListener("click", () => {
      if (past) return;
      form.capacity.value = Math.max(c.booked, Number(form.capacity.value || 0) + Number(b.dataset.step));
    }));
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const capacity = Number(form.capacity.value);
      const err = !Number.isInteger(capacity) || capacity < 1 ? "Sức chứa phải là số nguyên dương" : capacity < c.booked ? `Không thể nhỏ hơn số khách đã đặt (${c.booked})` : "";
      if (!Validation.showFieldErrors(form, err ? { capacity: err } : {})) return;
      Helpers.withBusy($("saveBtn"), async () => {
        try {
          await TimeSlotService.save(museum.id, c, { capacity, locked: form.locked.checked });
          Notify.success("Đã lưu khung giờ " + c.slot + " ngày " + Format.date(c.date));
          await loadWeek();
        } catch (er) {
          Notify.error(er.message);
        }
      });
    });
    $("resetBtn")?.addEventListener("click", async (e) => {
      await Helpers.withBusy(e.currentTarget, async () => {
        await TimeSlotService.reset(c);
        Notify.success("Đã đưa khung giờ về sức chứa mặc định");
        await loadWeek();
      });
    });
  }

  function select(key) {
    const [date, slot] = key.split("|");
    selected = { date, slot };
    renderGrid();
    renderDetail();
    if (window.innerWidth < 1200) $("detail").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function loadWeek() {
    const end = new Date(weekStart);
    end.setDate(end.getDate() + 6);
    $("weekLabel").textContent = `${Format.date(weekStart)} – ${Format.date(end)}`;
    cells = await TimeSlotService.week(museum, Format.isoDate(weekStart));
    renderGrid();
    if (selected && cells.some((c) => cellKey(c) === cellKey(selected))) renderDetail();
    else {
      selected = null;
      $("detail").innerHTML = `<div class="adm-empty-panel"><span class="material-symbols-outlined">touch_app</span>Chọn một khung giờ trên lịch để điều chỉnh sức chứa hoặc tạm khóa đặt vé.</div>`;
    }
  }

  const shift = (days) => {
    weekStart.setDate(weekStart.getDate() + days);
    loadWeek();
  };
  $("prevWeek").addEventListener("click", () => shift(-7));
  $("nextWeek").addEventListener("click", () => shift(7));
  $("thisWeek").addEventListener("click", () => ((weekStart = todayStart()), loadWeek()));
  $("museumSelect").addEventListener("change", (e) => {
    museum = museums.find((m) => String(m.id) === e.target.value);
    selected = null;
    loadWeek();
  });
  $("exportBtn").addEventListener("click", () => {
    const rows = cells.map((c) => [museum.name, c.date, c.slot, c.closed ? "Nghỉ" : c.booked, c.closed ? "" : c.capacity, c.closed ? "Bảo tàng nghỉ" : c.locked ? "Tạm khóa" : LEVEL_TEXT[TimeSlotService.level(c.booked, c.capacity)]]);
    AdminUI.downloadCsv(`khung-gio-${Format.isoDate(weekStart)}.csv`, [["Bảo tàng", "Ngày", "Khung giờ", "Đã đặt", "Sức chứa", "Trạng thái"], ...rows]);
  });

  MuseumService.adminList()
    .then((list) => {
      museums = list;
      $("museumSelect").innerHTML = list.map((m) => `<option value="${m.id}">${esc(m.name)}</option>`).join("");
      museum = list.find((m) => String(m.id) === Helpers.param("museum_id")) || list[0];
      $("museumSelect").value = museum.id;
      return loadWeek();
    })
    .catch((err) => Notify.error(err.message));
})();
