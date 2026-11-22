/* Khung giờ & sức chứa theo ngày cho từng bảo tàng.
   Khung giờ cố định lấy từ APP_CONFIG.TIME_SLOTS (trùng với trang đặt vé / đổi giờ của khách).
   Bảng MySQL dự kiến time_slot_overrides(id, museum_id, date, slot, capacity, locked) — chỉ lưu ô bị chỉnh;
   ô không chỉnh dùng sức chứa mặc định của bảo tàng (museums.slot_capacity). */
window.TimeSlotService = (function () {
  const E = () => API_CONFIG.ENDPOINTS.TIME_SLOTS;

  /** Mock: số vé đã đặt mẫu, cố định theo (bảo tàng, ngày, khung giờ) để lần nào mở cũng giống nhau */
  function sampleBooked(museumId, date, slot, cap) {
    let h = 0;
    for (const c of `${museumId}|${date}|${slot}`) h = (h * 31 + c.charCodeAt(0)) >>> 0;
    const weekend = [0, 6].includes(new Date(date).getDay());
    const ratio = ((h % 100) / 100) * 0.75 + (weekend ? 0.3 : 0.1);
    return Math.min(cap, Math.round(cap * ratio));
  }

  return {
    /** Trạng thái theo tỷ lệ lấp đầy */
    level(booked, cap) {
      if (cap <= 0 || booked >= cap) return "full";
      return booked / cap >= 0.75 ? "busy" : "ok";
    },

    /** Lấy 7 ngày bắt đầu từ `from` (Format.isoDate). Trả về [{date, slot, capacity, booked, locked, closed, override_id}] */
    async week(museum, from) {
      const days = [...Array(7)].map((_, i) => {
        const x = new Date(from);
        x.setDate(x.getDate() + i);
        return Format.isoDate(x);
      });
      if (!API_CONFIG.USE_MOCK) return ApiService.get(E(), { museum_id: museum.id, from: days[0], to: days[6] });

      const [overrides, tickets] = await Promise.all([ApiService.get(E(), { museum_id: String(museum.id) }), ApiService.get(API_CONFIG.ENDPOINTS.TICKETS)]);
      const defCap = Number(museum.slot_capacity) || APP_CONFIG.SLOT_CAPACITY;
      const cells = [];
      for (const date of days) {
        const closed = Array.isArray(museum.open_days) && !museum.open_days.includes(new Date(date).getDay());
        for (const slot of APP_CONFIG.TIME_SLOTS) {
          const o = overrides.find((x) => x.date === date && x.slot === slot);
          const capacity = o ? Number(o.capacity) : defCap;
          // vé thật trong dữ liệu mẫu (đúng ngày + khung giờ) cộng thêm số đặt mẫu
          const real = tickets.filter((t) => t.visit_date === date && t.time_slot === slot && ["paid", "used"].includes(t.status)).reduce((s, t) => s + Number(t.quantity), 0);
          const booked = closed ? 0 : Math.min(capacity, sampleBooked(museum.id, date, slot, defCap) + real);
          cells.push({ date, slot, capacity, booked, locked: !!o?.locked, closed, override_id: o?.id || null });
        }
      }
      return cells;
    },

    /** Lưu điều chỉnh một ô (sức chứa không được nhỏ hơn số đã đặt) */
    save(museumId, cell, { capacity, locked }) {
      if (capacity < cell.booked) throw new Error(`Sức chứa không được nhỏ hơn số khách đã đặt (${cell.booked})`);
      const body = { museum_id: museumId, date: cell.date, slot: cell.slot, capacity, locked: locked ? 1 : 0 };
      return cell.override_id ? ApiService.put(`${E()}/${cell.override_id}`, body) : ApiService.post(E(), body);
    },

    /** Bỏ điều chỉnh, quay về sức chứa mặc định */
    reset(cell) {
      return cell.override_id ? ApiService.delete(`${E()}/${cell.override_id}`) : Promise.resolve();
    },
  };
})();
