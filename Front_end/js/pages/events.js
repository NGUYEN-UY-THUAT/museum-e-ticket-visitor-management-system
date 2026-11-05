(async function () {
  if (!initLayout("events", "Sự kiện")) return;
  const S = APP_CONFIG.EVENT_STATUS,
    $ = Helpers.$,
    $$ = Helpers.$$;
  let events = [],
    tab = "";
  $("#eventTabs").innerHTML = [["", "Tất cả"], ...Object.entries(S).map(([k, v]) => [k, v.label])].map(([k, l]) => `<button class="btn btn--outline btn--sm ${k === tab ? "is-active" : ""}" data-tab="${k}">${l}</button>`).join("");

  async function load() {
    events = await EventService.list();
    render();
  }
  function render() {
    $$("#eventTabs button").forEach((b) => b.classList.toggle("is-active", b.dataset.tab === tab));
    const list = events.filter((e) => !tab || e.status === tab);
    $("#eventGrid").innerHTML = list.length
      ? list
          .map((e) => {
            const pct = Math.min(100, Math.round((e.registered / e.capacity) * 100));
            return `<article class="card event-card">
        <div class="event-card__top">${Format.badge(S, e.status)}<span class="text-small text-muted">${Format.dateTime(e.start_time)}</span></div>
        <h3>${Format.escape(e.title)}</h3><p class="text-muted text-small">${Format.escape(e.description)}</p>
        <p class="text-small">📍 ${Format.escape(e.location)}</p>
        <div class="progress"><div style="width:${pct}%"></div></div><p class="text-small">${e.registered}/${e.capacity} người đăng ký</p>
        <div class="toolbar"><button class="btn btn--outline btn--sm" data-reg="${e.id}">Danh sách</button><button class="btn btn--outline btn--sm" data-edit="${e.id}">Sửa</button><button class="btn btn--outline btn--sm" data-del="${e.id}">Xóa</button></div></article>`;
          })
          .join("")
      : '<div class="empty card">Chưa có sự kiện</div>';
  }

  function openForm(ev = {}) {
    const root = Modal.open({
      title: ev.id ? "Sửa sự kiện" : "Tạo sự kiện",
      body: `<form id="evForm" novalidate>
        <div class="form-group"><label>Tên sự kiện</label><input class="form-control" name="title"></div>
        <div class="form-group"><label>Mô tả</label><textarea class="form-control" rows="3" name="description"></textarea></div>
        <div class="form-row"><div class="form-group"><label>Địa điểm</label><input class="form-control" name="location"></div><div class="form-group"><label>Sức chứa</label><input class="form-control" type="number" name="capacity"></div></div>
        <div class="form-row"><div class="form-group"><label>Bắt đầu</label><input class="form-control" type="datetime-local" name="start_time"></div><div class="form-group"><label>Kết thúc</label><input class="form-control" type="datetime-local" name="end_time"></div></div>
        <div class="form-group"><label>Trạng thái</label><select class="form-control" name="status">${Object.entries(S)
          .map(([k, v]) => `<option value="${k}">${v.label}</option>`)
          .join("")}</select></div></form>`,
      footer: `<button class="btn btn--outline" data-close>Hủy</button><button class="btn btn--primary" id="saveEv">Lưu</button>`,
    });
    const form = root.querySelector("#evForm");
    Helpers.fillForm(form, { status: "upcoming", ...ev });
    root.querySelector("#saveEv").onclick = async () => {
      const data = Helpers.formData(form);
      const ok = Validation.showErrors(
        form,
        Validation.validate(data, {
          title: [[Validation.required, "Nhập tên sự kiện"]],
          location: [[Validation.required, "Nhập địa điểm"]],
          capacity: [[Validation.positive, "Sức chứa phải > 0"]],
          start_time: [[Validation.required, "Chọn thời gian"]],
          end_time: [[(v) => v > data.start_time, "Kết thúc phải sau bắt đầu"]],
        }),
      );
      if (!ok) return;
      await EventService.save({ ...data, id: ev.id, capacity: Number(data.capacity) });
      Notify.success("Đã lưu sự kiện");
      Modal.close();
      load();
    };
  }

  async function showRegs(ev) {
    const regs = await EventService.registrations(ev.id);
    Modal.open({
      title: "Đăng ký: " + Format.escape(ev.title),
      body: regs.length ? `<div class="table-wrap"><table class="table"><thead><tr><th>Mã</th><th>Họ tên</th><th>SĐT</th><th>Số người</th></tr></thead><tbody>${regs.map((r) => `<tr><td>${r.code}</td><td>${Format.escape(r.full_name)}</td><td>${r.phone}</td><td>${r.attendees}</td></tr>`).join("")}</tbody></table></div>` : '<div class="empty">Chưa có người đăng ký</div>',
      footer: `<button class="btn btn--outline" data-close>Đóng</button>`,
    });
  }

  $("#eventTabs").addEventListener("click", (e) => {
    const b = e.target.closest("[data-tab]");
    if (b) {
      tab = b.dataset.tab;
      render();
    }
  });
  $("#eventGrid").addEventListener("click", async (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    const ev = events.find((x) => String(x.id) === (b.dataset.reg || b.dataset.edit || b.dataset.del));
    if (b.dataset.reg) showRegs(ev);
    if (b.dataset.edit) openForm(ev);
    if (b.dataset.del && (await Modal.confirm(`Xóa sự kiện "${Format.escape(ev.title)}"?`))) {
      await EventService.remove(ev.id);
      Notify.info("Đã xóa");
      load();
    }
  });
  $("#newEventBtn").onclick = () => openForm();
  load();
})();
