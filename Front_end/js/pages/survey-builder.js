/* survey-builder.js — Soạn nội dung khảo sát (pages/survey-builder.html), chỉ quản trị viên.
   Loại câu hỏi cố định theo cột của bảng surveys (overall, exhibits, staff, facilities: chấm 1–5 sao; comment: ý kiến),
   ở đây chỉ sửa tiêu đề, gợi ý, bắt buộc, ẩn/hiện, thứ tự và nhãn thang điểm. */
(function () {
  if (!AdminShell.init("survey-builder")) return;
  const $ = (id) => document.getElementById(id);
  const esc = (s) => Format.escape(s);
  const TYPE = { rating: { icon: "star", label: "Chấm 1–5 sao" }, text: { icon: "chat", label: "Ý kiến tự do" } };
  let cfg = null;
  let current = 0; // vị trí câu đang sửa
  let dirty = false;
  const markDirty = () => (dirty = true);
  window.addEventListener("beforeunload", (e) => dirty && e.preventDefault());

  function renderList() {
    const qs = cfg.questions;
    $("qCount").textContent = `${qs.filter((q) => q.enabled).length}/${qs.length} câu đang hiện`;
    $("qList").innerHTML = qs.map((q, i) => `
      <li class="sb-item${i === current ? " is-active" : ""}${q.enabled ? "" : " is-off"}" data-i="${i}">
        <span class="sb-item__no">${i + 1}</span>
        <button type="button" class="sb-item__main" data-pick="${i}"><span class="sb-item__title">${esc(q.title)}</span>
          <span class="sb-item__meta"><span class="material-symbols-outlined">${TYPE[q.type].icon}</span>${TYPE[q.type].label}${q.required ? " · Bắt buộc" : ""}${q.enabled ? "" : " · Đang ẩn"}</span></button>
        <span class="sb-item__move">
          <button type="button" data-move="-1" data-i="${i}" ${i === 0 ? "disabled" : ""} aria-label="Lên"><span class="material-symbols-outlined">keyboard_arrow_up</span></button>
          <button type="button" data-move="1" data-i="${i}" ${i === qs.length - 1 ? "disabled" : ""} aria-label="Xuống"><span class="material-symbols-outlined">keyboard_arrow_down</span></button>
        </span>
      </li>`).join("");
    $("qList").querySelectorAll("[data-pick]").forEach((b) => b.addEventListener("click", () => ((current = Number(b.dataset.pick)), renderAll())));
    $("qList").querySelectorAll("[data-move]").forEach((b) => b.addEventListener("click", () => {
      const i = Number(b.dataset.i), j = i + Number(b.dataset.move);
      [qs[i], qs[j]] = [qs[j], qs[i]];
      current = j;
      markDirty();
      renderAll();
    }));
  }

  function renderEditor() {
    const q = cfg.questions[current];
    $("editor").innerHTML = `
      <div class="flex items-start justify-between gap-3">
        <div><p class="adm-panel__label">Đang sửa câu ${current + 1}</p><h2 class="adm-panel__title">${TYPE[q.type].label}</h2>
          <p class="adm-panel__sub">${q.type === "rating" ? `Điểm lưu vào tiêu chí “${esc(SurveyService.CRITERIA[q.key])}”` : "Nội dung lưu vào phần góp ý"}</p></div>
        <span class="sb-type"><span class="material-symbols-outlined">${TYPE[q.type].icon}</span></span>
      </div>
      <div class="adm-panel__section flex flex-col gap-4">
        <div class="hh-field"><label class="hh-label" for="q_title">Câu hỏi <span class="req">*</span></label><input class="hh-input" id="q_title" maxlength="200" value="${esc(q.title)}" /><span class="hh-error"></span><span class="hh-hint"><span id="q_len">${q.title.length}</span>/200 ký tự</span></div>
        <div class="hh-field"><label class="hh-label" for="q_hint">Gợi ý thêm (không bắt buộc)</label><input class="hh-input" id="q_hint" maxlength="200" value="${esc(q.hint || "")}" /></div>
        ${q.type === "text" ? `<div class="hh-field"><label class="hh-label" for="q_ph">Chữ mờ trong ô nhập</label><input class="hh-input" id="q_ph" maxlength="100" value="${esc(q.placeholder || "")}" /></div>` : ""}
        <label class="adm-switch"><span class="adm-switch__text">Bắt buộc trả lời<small>Khách phải trả lời câu này mới gửi được.</small></span><input type="checkbox" id="q_req" ${q.required ? "checked" : ""} /></label>
        <label class="adm-switch"><span class="adm-switch__text">Hiện câu hỏi này<small>Tắt để tạm ẩn mà không xóa.</small></span><input type="checkbox" id="q_on" ${q.enabled ? "checked" : ""} ${q.key === "overall" ? "disabled" : ""} /></label>
        ${q.key === "overall" ? `<p class="hh-hint">Câu đánh giá chung luôn hiện vì dùng để tính tỷ lệ hài lòng.</p>` : ""}
      </div>
      ${q.type === "rating" ? `<div class="adm-panel__section"><p class="adm-panel__label">Nhãn thang điểm (dùng chung cho mọi câu chấm sao)</p>
        <div class="sb-scale">${cfg.star_labels.map((l, i) => `<label><span>${i + 1} ★</span><input class="hh-input" data-star="${i}" maxlength="30" value="${esc(l)}" /></label>`).join("")}</div></div>` : ""}`;
    const bind = (id, fn) => $(id)?.addEventListener("input", (e) => { fn(e.target); markDirty(); renderList(); renderPreview(); });
    bind("q_title", (el) => { q.title = el.value; $("q_len").textContent = el.value.length; });
    bind("q_hint", (el) => (q.hint = el.value));
    bind("q_ph", (el) => (q.placeholder = el.value));
    $("q_req").addEventListener("change", (e) => { q.required = e.target.checked; markDirty(); renderList(); renderPreview(); });
    $("q_on").addEventListener("change", (e) => { q.enabled = e.target.checked; markDirty(); renderList(); renderPreview(); });
    $("editor").querySelectorAll("[data-star]").forEach((inp) => inp.addEventListener("input", () => { cfg.star_labels[inp.dataset.star] = inp.value; markDirty(); renderPreview(); }));
  }

  function renderPreview() {
    const shown = cfg.questions.filter((q) => q.enabled);
    const q = cfg.questions[current];
    const pos = shown.indexOf(q);
    const body = !q.enabled
      ? `<p class="sb-preview__hidden"><span class="material-symbols-outlined">visibility_off</span>Câu này đang ẩn, khách sẽ không thấy.</p>`
      : q.type === "rating"
        ? `<div class="sb-stars" id="pvStars">${[1, 2, 3, 4, 5].map((n) => `<button type="button" data-n="${n}" aria-label="${n} sao"><span class="material-symbols-outlined">star</span></button>`).join("")}</div><p class="sb-star-label" id="pvLabel">Chạm vào sao để đánh giá</p>`
        : `<textarea class="hh-input" rows="4" placeholder="${esc(q.placeholder || "")}"></textarea>`;
    $("preview").innerHTML = `
      <div class="sb-preview__brand"><span class="material-symbols-outlined">account_balance</span> ${esc(APP_CONFIG.SITE_NAME)}</div>
      <p class="sb-preview__title">${esc(cfg.title)}</p>
      ${current === 0 || pos === 0 ? `<p class="sb-preview__intro">${esc(cfg.intro)}</p>` : ""}
      ${q.enabled ? `<p class="sb-preview__step">Câu ${pos + 1} / ${shown.length}</p>` : ""}
      <p class="sb-preview__q">${esc(q.title)}${q.required && q.enabled ? ' <span class="req">*</span>' : ""}</p>
      ${q.hint ? `<p class="sb-preview__hint">${esc(q.hint)}</p>` : ""}
      ${body}
      <button class="hh-btn hh-btn--primary hh-btn--block mt-5" type="button" tabindex="-1">${pos === shown.length - 1 ? "Gửi đánh giá" : "Câu tiếp theo"}</button>`;
    $("pvStars")?.querySelectorAll("[data-n]").forEach((b) => b.addEventListener("click", () => {
      const n = Number(b.dataset.n);
      $("pvStars").querySelectorAll("[data-n]").forEach((x) => x.classList.toggle("is-on", Number(x.dataset.n) <= n));
      $("pvLabel").textContent = `${n} sao: ${cfg.star_labels[n - 1]}`;
    }));
  }

  function renderAll() {
    renderList();
    renderEditor();
    renderPreview();
  }

  function fillGeneral() {
    $("title").value = cfg.title;
    $("intro").value = cfg.intro;
    $("sendEmail").checked = !!cfg.send_email;
    $("sendAfter").value = String(cfg.send_after_hours);
    $("validHours").value = String(cfg.link_valid_hours);
    $("emailOpts").classList.toggle("sb-disabled", !cfg.send_email);
  }

  $("title").addEventListener("input", (e) => ((cfg.title = e.target.value), markDirty(), renderPreview()));
  $("intro").addEventListener("input", (e) => ((cfg.intro = e.target.value), markDirty(), renderPreview()));
  $("sendEmail").addEventListener("change", (e) => ((cfg.send_email = e.target.checked), markDirty(), fillGeneral()));
  $("sendAfter").addEventListener("change", (e) => ((cfg.send_after_hours = Number(e.target.value)), markDirty()));
  $("validHours").addEventListener("change", (e) => ((cfg.link_valid_hours = Number(e.target.value)), markDirty()));

  $("saveBtn").addEventListener("click", (e) => {
    // Kiểm tra: tiêu đề khảo sát và tiêu đề từng câu không được trống
    const errTitle = cfg.title.trim().length < 5;
    $("title").classList.toggle("is-invalid", errTitle);
    $("title").closest(".hh-field").querySelector(".hh-error").textContent = errTitle ? "Tiêu đề tối thiểu 5 ký tự" : "";
    const bad = cfg.questions.findIndex((q) => q.title.trim().length < 5);
    if (bad >= 0) {
      current = bad;
      renderAll();
      $("q_title").classList.add("is-invalid");
      $("editor").querySelector(".hh-error").textContent = "Câu hỏi tối thiểu 5 ký tự";
      return Notify.error(`Câu ${bad + 1} chưa có nội dung`);
    }
    if (errTitle) return $("title").focus();
    Helpers.withBusy(e.currentTarget, async () => {
      cfg.questions.forEach((q) => { q.title = q.title.trim(); q.hint = (q.hint || "").trim(); });
      await SurveyService.saveConfig(cfg);
      dirty = false;
      Notify.success("Đã lưu bộ câu hỏi khảo sát");
    });
  });

  Promise.all([SurveyService.getConfig(), SurveyService.list()])
    .then(([c, responses]) => {
      cfg = c;
      const s = SurveyService.summary(responses);
      $("responseInfo").innerHTML = `Đã nhận <b>${s.count}</b> phản hồi · điểm chung trung bình <b>${s.overall.toFixed(1)}/5</b> · ${Math.round(s.satisfied * 100)}% hài lòng`;
      fillGeneral();
      renderAll();
    })
    .catch((err) => Notify.error(err.message));
})();
