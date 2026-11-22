/* Nút "Tiếp tục với Google" cho trang đăng nhập / đăng ký của khách.
   Dùng: GoogleLogin.bind(document.getElementById("googleBtn"), customer => {...})
   - Có APP_CONFIG.GOOGLE_CLIENT_ID và tắt mock: dùng Google Identity Services thật
     (nạp https://accounts.google.com/gsi/client), id_token gửi lên backend qua CustomerService.loginWithGoogle.
   - Còn lại (chạy thử): mở hộp chọn tài khoản Google mẫu. */
window.GoogleLogin = (function () {
  const GSI_SRC = "https://accounts.google.com/gsi/client";

  function loadGsi() {
    if (window.google?.accounts?.id) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = GSI_SRC;
      s.async = true;
      s.onload = resolve;
      s.onerror = () => reject(new Error("Không tải được dịch vụ đăng nhập Google"));
      document.head.appendChild(s);
    });
  }

  /** Đăng nhập thật bằng Google Identity Services */
  async function realLogin(onDone) {
    await loadGsi();
    google.accounts.id.initialize({
      client_id: APP_CONFIG.GOOGLE_CLIENT_ID,
      callback: async (res) => {
        try {
          onDone(await CustomerService.loginWithGoogle({ id_token: res.credential }));
        } catch (err) {
          Notify.error(err.message);
        }
      },
    });
    google.accounts.id.prompt();
  }

  /** Chạy thử: hộp chọn tài khoản giả lập */
  function mockLogin(onDone) {
    const root = Modal.open({
      title: "Chọn tài khoản Google",
      body: `<div class="glogin">
        <p class="hh-alert hh-alert--info"><span class="material-symbols-outlined">info</span><span>Chưa kết nối Google thật: nhập họ tên và Gmail để giả lập đăng nhập.</span></p>
        <form class="glogin__other" id="gloginForm" novalidate>
          <input class="hh-input" name="full_name" placeholder="Họ và tên" />
          <input class="hh-input" name="email" type="email" placeholder="ten@gmail.com" />
          <span class="hh-error" id="gloginErr"></span>
          <button class="hh-btn hh-btn--primary hh-btn--block" type="submit">Tiếp tục</button>
        </form></div>`,
    });
    const finish = async (profile) => {
      try {
        const c = await CustomerService.loginWithGoogle(profile);
        Modal.close();
        onDone(c);
      } catch (err) {
        root.querySelector("#gloginErr").textContent = err.message;
      }
    };
    root.querySelector("#gloginForm").addEventListener("submit", (e) => {
      e.preventDefault();
      finish({ full_name: e.target.full_name.value, email: e.target.email.value });
    });
  }

  return {
    bind(btn, onDone) {
      if (!btn) return;
      btn.addEventListener("click", () => {
        const real = !API_CONFIG.USE_MOCK && APP_CONFIG.GOOGLE_CLIENT_ID;
        (real ? realLogin(onDone) : Promise.resolve(mockLogin(onDone))).catch((err) => Notify.error(err.message));
      });
    },
  };
})();
