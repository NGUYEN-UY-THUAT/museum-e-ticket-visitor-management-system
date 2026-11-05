(async function () {
  if (!initLayout("visitors", "Đoàn khách")) return;
  const S = APP_CONFIG.GROUP_STATUS,
    $ = Helpers.$;
  let groups = [];
  $("#statusFilter").innerHTML += Object.entries(S)
    .map(([k, v]) => `<option value="${k}">${v.label}</option>`)
    .join("");

  async function load() {
    groups = await VisitorService.list();
    render();
  }
  function render() {
    const q = $("#searchInput").value.trim().toLowerCase(),
      st = $("#statusFilter").value;
    const rows = groups.filter((g) => (!st || g.status === st) && (!q || [g.group_name, g.leader_name].some((x) => x.toLowerCase().includes(q))));
    Helpers.renderTable(
      $("#groupBody"),
      rows,
      (g) => `<tr>
      <td><b>${Format.escape(g.group_name)}</b>${g.note ? `<div class="text-small text-muted">${Format.escape(g.note)}</div>` : ""}</td>
      <td>${Format.escape(g.leader_name)}</td><td>${g.phone}<div class="text-small text-muted">${g.email || ""}</div></td>
      <td>${g.size}</td><td>${Format.date(g.visit_date)}</td><td>${Number(g.guide_required) ? "Có" : "Không"}</td><td>${Format.badge(S, g.status)}</td>
      <td><div class="toolbar" style="flex-wrap:nowrap">${g.status === "pending" ? `<button class="btn btn--success btn--sm" data-st="approved" data-id="${g.id}">Duyệt</button><button class="btn btn--outline btn--sm" data-st="rejected" data-id="${g.id}">Từ chối</button>` : ""}
      ${g.status === "approved" ? `<button class="btn btn--outline btn--sm" data-st="visited" data-id="${g.id}">Đã đến</button>` : ""}
      <button class="btn btn--outline btn--sm" data-edit="${g.id}">Sửa</button></div></td></tr>`,
      8,
    );
  }

  function openForm(g = {}) {
    const root = Modal.open({
      title: g.id ? "Sửa đoàn khách" : "Thêm đoàn khách",
      body: `<form id="gForm" novalidate>
        <div class="form-group"><label>Tên đoàn / đơn vị</label><input class="form-control" name="group_name"></div>
        <div class="form-row"><div class="form-group"><label>Trưởng đoàn</label><input class="form-control" name="leader_name"></div><div class="form-group"><label>Số điện thoại</label><input class="form-control" name="phone"></div></div>
        <div class="form-row"><div class="form-group"><label>Email</label><input class="form-control" name="email"></div><div class="form-group"><label>Số người</label><input class="form-control" type="number" name="size"></div></div>
        <div class="form-row"><div class="form-group"><label>Ngày tham quan</label><input class="form-control" type="date" name="visit_date"></div><div class="form-group"><label>Thuyết minh viên</label><select class="form-control" name="guide_required"><option value="1">Có</option><option value="0">Không</option></select></div></div>
        <div class="form-group"><label>Ghi chú</label><textarea class="form-control" rows="2" name="note"></textarea></div></form>`,
      footer: `<button class="btn btn--outline" data-close>Hủy</button><button class="btn btn--primary" id="saveG">Lưu</button>`,
    });
    const form = root.querySelector("#gForm");
    Helpers.fillForm(form, g);
    root.querySelector("#saveG").onclick = async () => {
      const data = Helpers.formData(form);
      const ok = Validation.showErrors(
        form,
        Validation.validate(data, {
          group_name: [[Validation.required, "Nhập tên đoàn"]],
          leader_name: [[Validation.required, "Nhập trưởng đoàn"]],
          phone: [[Validation.phone, "SĐT không hợp lệ"]],
          size: [[(v) => Number(v) >= 10, "Đoàn tối thiểu 10 người"]],
          visit_date: [[Validation.required, "Chọn ngày"]],
        }),
      );
      if (!ok) return;
      await VisitorService.save({ ...data, id: g.id, size: Number(data.size), guide_required: Number(data.guide_required) });
      Notify.success("Đã lưu đoàn khách");
      Modal.close();
      load();
    };
  }

  $("#groupBody").addEventListener("click", async (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    if (b.dataset.st) {
      await VisitorService.setStatus(b.dataset.id, b.dataset.st);
      Notify.success("Đã cập nhật");
      load();
    }
    if (b.dataset.edit) openForm(groups.find((g) => String(g.id) === b.dataset.edit));
  });
  $("#searchInput").addEventListener("input", Helpers.debounce(render));
  $("#statusFilter").addEventListener("change", render);
  $("#newGroupBtn").onclick = () => openForm();
  load();
})();
