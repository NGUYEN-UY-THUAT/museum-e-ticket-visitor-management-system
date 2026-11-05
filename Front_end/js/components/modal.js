window.Modal = {
  /** Modal.open({ title, body (html), footer (html), onOpen(root) }) → trả về phần tử modal */
  open({ title = "", body = "", footer = "", onOpen } = {}) {
    this.close();
    const root = document.createElement("div");
    root.className = "modal is-open";
    root.id = "appModal";
    root.innerHTML = `<div class="modal__dialog" role="dialog">
      <div class="modal__header"><h3>${title}</h3><button class="modal__close" data-close>&times;</button></div>
      <div class="modal__body">${body}</div>
      ${footer ? `<div class="modal__footer">${footer}</div>` : ""}</div>`;
    root.addEventListener("click", (e) => {
      if (e.target === root || e.target.closest("[data-close]")) this.close();
    });
    document.body.appendChild(root);
    onOpen?.(root);
    return root;
  },
  close() {
    document.getElementById("appModal")?.remove();
  },
  /** Hộp xác nhận thay cho confirm() */
  confirm(message, title = "Xác nhận") {
    return new Promise((resolve) => {
      const root = this.open({ title, body: `<p>${message}</p>`, footer: `<button class="btn btn--outline" data-close>Hủy</button><button class="btn btn--primary" id="modalOk">Đồng ý</button>` });
      root.querySelector("#modalOk").onclick = () => {
        this.close();
        resolve(true);
      };
      root.querySelectorAll("[data-close]").forEach((b) => b.addEventListener("click", () => resolve(false)));
    });
  },
};
