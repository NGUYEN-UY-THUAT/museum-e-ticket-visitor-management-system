(async function () {
  if (!initLayout("tickets", "Vé điện tử")) return;
  const S = APP_CONFIG.TICKET_STATUS;
  const $ = Helpers.$;
  let tickets = [],
    types = [];
  $("#statusFilter").innerHTML += Object.entries(S)
    .map(([k, v]) => `<option value="${k}">${v.label}</option>`)
    .join("");

  async function load() {
    [tickets, types] = await Promise.all([TicketService.list(), TicketService.types()]);
    render();
  }
  const typeName = (id) => types.find((t) => t.id === id)?.name || "-";
  function render() {
    const q = $("#searchInput").value.trim().toLowerCase(),
      st = $("#statusFilter").value,
      dt = $("#dateFilter").value;
    const rows = tickets.filter((t) => (!st || t.status === st) && (!dt || t.visit_date === dt) && (!q || [t.code, t.customer_name, t.phone, t.email].some((x) => String(x).toLowerCase().includes(q))));
    Helpers.renderTable(
      $("#ticketBody"),
      rows,
      (t) => `<tr>
      <td><b>${t.code}</b></td><td>${Format.escape(t.customer_name)}<div class="text-small text-muted">${t.phone}</div></td>
      <td>${typeName(t.ticket_type_id)}</td><td>${t.quantity}</td><td>${Format.date(t.visit_date)}</td>
      <td>${Format.currency(t.total)}</td><td>${Format.badge(S, t.status)}</td>
      <td><div class="toolbar" style="flex-wrap:nowrap"><button class="btn btn--outline btn--sm" data-qr="${t.id}">QR</button>
      ${t.status === "pending" ? `<button class="btn btn--success btn--sm" data-pay="${t.id}">Thu tiền</button>` : ""}
      ${["paid", "pending"].includes(t.status) ? `<button class="btn btn--outline btn--sm" data-cancel="${t.id}">Hủy</button>` : ""}</div></td></tr>`,
      8,
    );
  }

  function showTicket(t) {
    Modal.open({
      title: "Vé điện tử",
      body: `<div class="eticket"><div class="eticket__qr" id="qrBox"></div><div class="eticket__code">${t.code}</div>
        <p><b>${Format.escape(t.customer_name)}</b></p><p>${typeName(t.ticket_type_id)} × ${t.quantity}</p>
        <p>Ngày tham quan: <b>${Format.date(t.visit_date)}</b></p><p>${Format.currency(t.total)} · ${Format.badge(S, t.status)}</p></div>`,
      footer: `<button class="btn btn--outline" data-close>Đóng</button><button class="btn btn--primary" onclick="window.print()">In vé</button>`,
      onOpen: () => Helpers.renderQR(document.getElementById("qrBox"), t.code),
    });
  }

  function openSell() {
    const opts = types
      .filter((t) => Number(t.active))
      .map((t) => `<option value="${t.id}">${t.name} - ${Format.currency(t.price)}</option>`)
      .join("");
    const root = Modal.open({
      title: "Bán vé tại quầy",
      body: `<form id="sellForm" novalidate>
        <div class="form-group"><label>Họ tên khách</label><input class="form-control" name="customer_name"></div>
        <div class="form-row"><div class="form-group"><label>Số điện thoại</label><input class="form-control" name="phone"></div><div class="form-group"><label>Email</label><input class="form-control" name="email"></div></div>
        <div class="form-row"><div class="form-group"><label>Loại vé</label><select class="form-control" name="ticket_type_id">${opts}</select></div><div class="form-group"><label>Số lượng</label><input class="form-control" type="number" min="1" name="quantity" value="1"></div></div>
        <div class="form-group"><label>Ngày tham quan</label><input class="form-control" type="date" name="visit_date" value="${Format.isoDate()}"></div>
        <p>Thành tiền: <b id="totalText"></b></p></form>`,
      footer: `<button class="btn btn--outline" data-close>Hủy</button><button class="btn btn--primary" id="sellBtn">Phát hành vé</button>`,
    });
    const form = root.querySelector("#sellForm");
    const calc = () => {
      const t = types.find((x) => String(x.id) === form.ticket_type_id.value);
      root.querySelector("#totalText").textContent = Format.currency((t?.price || 0) * (form.quantity.value || 0));
    };
    form.addEventListener("input", calc);
    calc();
    root.querySelector("#sellBtn").onclick = async () => {
      const data = Helpers.formData(form);
      const ok = Validation.showErrors(
        form,
        Validation.validate(data, {
          customer_name: [[Validation.required, "Nhập họ tên"]],
          phone: [[Validation.phone, "SĐT không hợp lệ"]],
          quantity: [[Validation.positive, "Số lượng phải lớn hơn 0"]],
          visit_date: [[Validation.notPast, "Ngày không được ở quá khứ"]],
        }),
      );
      if (!ok) return;
      try {
        const t = await TicketService.book(data);
        Notify.success("Đã phát hành vé " + t.code);
        await load();
        showTicket(t);
      } catch (e) {
        Notify.error(e.message);
      }
    };
  }

  function openTypes() {
    const root = Modal.open({
      title: "Loại vé & giá",
      body: `<table class="table"><thead><tr><th>Tên</th><th>Giá (₫)</th><th>Bán</th></tr></thead><tbody>${types.map((t) => `<tr data-id="${t.id}"><td><input class="form-control" name="name" value="${Format.escape(t.name)}"></td><td><input class="form-control" type="number" name="price" value="${t.price}"></td><td><input type="checkbox" name="active" ${Number(t.active) ? "checked" : ""}></td></tr>`).join("")}</tbody></table>`,
      footer: `<button class="btn btn--outline" data-close>Đóng</button><button class="btn btn--primary" id="saveTypes">Lưu</button>`,
    });
    root.querySelector("#saveTypes").onclick = async () => {
      for (const tr of root.querySelectorAll("tr[data-id]")) {
        await TicketService.saveType({ id: Number(tr.dataset.id), name: tr.querySelector("[name=name]").value, price: Number(tr.querySelector("[name=price]").value), active: tr.querySelector("[name=active]").checked ? 1 : 0 });
      }
      Notify.success("Đã lưu loại vé");
      Modal.close();
      load();
    };
  }

  $("#ticketBody").addEventListener("click", async (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    const find = (id) => tickets.find((t) => String(t.id) === id);
    if (b.dataset.qr) showTicket(find(b.dataset.qr));
    if (b.dataset.pay) {
      await TicketService.markPaid(b.dataset.pay);
      Notify.success("Đã thu tiền");
      load();
    }
    if (b.dataset.cancel && (await Modal.confirm("Hủy vé này?"))) {
      await TicketService.cancel(b.dataset.cancel);
      Notify.info("Đã hủy vé");
      load();
    }
  });
  $("#searchInput").addEventListener("input", Helpers.debounce(render));
  $("#statusFilter").addEventListener("change", render);
  $("#dateFilter").addEventListener("change", render);
  $("#newTicketBtn").onclick = openSell;
  $("#typesBtn").onclick = openTypes;
  if (!AuthService.isAdmin()) $("#typesBtn").remove();
  await load();
  if (Helpers.query("new")) openSell();
})();
