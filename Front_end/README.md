# Frontend - Phần mềm quản lý khách tham quan, vé điện tử và sự kiện bảo tàng

HTML + CSS + JavaScript thuần (không React, không cần build). Backend dùng MySQL, gọi qua REST API.

## Chạy thử
- Mở `index.html` bằng trình duyệt, hoặc dùng Live Server của VS Code (khuyên dùng, để camera quét QR hoạt động).
- Trang khách tham quan bắt đầu từ `index.html`. Khách và cán bộ dùng chung trang `pages/account-login.html`:
  tài khoản khách (email / SĐT) vào "Vé của tôi", tài khoản cán bộ (tên đăng nhập) vào trang quản trị `pages/dashboard.html`.
  Giao diện khách không có đường dẫn nào sang trang quản trị.
- Tài khoản và mã vé chạy thử không ghi trong giao diện hay README; xem ghi chú riêng của nhóm.
- Nút "Tiếp tục với Google" chạy giả lập khi `USE_MOCK` bật hoặc `APP_CONFIG.GOOGLE_CLIENT_ID` để trống; điền Client ID và tắt mock để dùng Google thật.

Mặc định `USE_MOCK: true` trong `js/config/api.config.js`: dữ liệu mẫu lưu ở localStorage của trình duyệt.
Khi backend MySQL sẵn sàng, đổi thành `false` và sửa `BASE_URL`.

## Cấu trúc
```
frontend/
├── index.html                    Trang chủ khách tham quan
├── 404.html                      Trang lỗi không tìm thấy (cấu hình máy chủ trả trang này khi sai đường dẫn)
├── pages/
│   │  ── Khách tham quan ──
│   ├── museums.html              Danh sách bảo tàng: tìm kiếm, lọc, sắp xếp, phân trang
│   ├── museum-detail.html        Chi tiết bảo tàng: giới thiệu, giá vé, sự kiện, đánh giá, chỉ đường
│   ├── ticket-selection.html     Đặt vé bước 1: ngày, khung giờ, loại vé, số lượng
│   ├── checkout.html             Đặt vé bước 2: thông tin người đặt, VAT, phương thức thanh toán
│   ├── payment-result.html       Đặt vé bước 3: thanh toán thành công / thất bại
│   ├── my-tickets.html           Vé của tôi: sắp tới / đã dùng / đã hủy, xem QR
│   ├── ticket-detail.html        Chi tiết một vé + mã QR soát vé
│   ├── event-list.html           Danh sách sự kiện, triển lãm (lưới / lịch)
│   ├── event-detail.html         Chi tiết sự kiện + đăng ký tham dự
│   ├── group-booking.html        Đặt vé đoàn, theo dõi hồ sơ đoàn
│   ├── survey.html               Khảo sát mức độ hài lòng
│   ├── profile.html              Hồ sơ cá nhân, lịch sử đơn vé
│   ├── account-login.html        Đăng nhập chung: khách (email / SĐT) và cán bộ (tên đăng nhập)
│   ├── account-register.html     Đăng ký tài khoản khách
│   ├── forgot-password.html      Quên mật khẩu: email → mã OTP → mật khẩu mới
│   ├── ticket-lookup.html        Tra cứu vé không cần đăng nhập (mã vé / email / SĐT), hiện mã QR
│   ├── ticket-change.html        Đổi ngày - khung giờ, hủy vé & hoàn tiền (gửi yêu cầu cho cán bộ duyệt)
│   ├── policies.html             Hướng dẫn dùng QR, quy định tham quan, chính sách hoàn vé, điều khoản, bảo mật
│   ├── contact.html              Liên hệ, gửi yêu cầu hỗ trợ, câu hỏi thường gặp
│   ├── booking.html              (Trang dịch vụ gộp cũ, còn logic mock tạo vé QR; sẽ bỏ khi đã nối logic vào các trang trên)
│   │  ── Cán bộ / quản trị (vai trò staff + admin; mục "admin" chỉ quản trị viên mở được) ──
│   ├── dashboard.html            Bảng điều khiển: khách hôm nay, việc cần xử lý, lượt vào gần đây, sự kiện sắp tới
│   ├── statistics.html           Thống kê theo khoảng ngày, biểu đồ, xuất CSV (admin)
│   ├── orders.html               Đơn hàng & hoàn tiền: duyệt / từ chối yêu cầu đổi giờ, hủy vé; xác nhận thanh toán
│   ├── tickets.html              Vé điện tử: tra cứu, xem QR, bán vé tại quầy
│   ├── ticket-types.html         Loại vé & giá (admin)
│   ├── checkin.html              Soát vé tại cổng: quét QR / nhập mã, chọn cổng, nhật ký lượt vào
│   ├── visitors.html             Đoàn khách: duyệt đăng ký, ghi nhận đoàn đến
│   ├── museum-management.html    Quản lý bảo tàng: thông tin, giờ mở cửa, đóng / mở bán (admin)
│   ├── time-slots.html           Khung giờ & sức chứa theo ngày, tạm khóa khung giờ
│   ├── events.html               Sự kiện & triển lãm: tạo, sửa, theo dõi số đăng ký
│   ├── event-checkin.html        Điểm danh khách tham dự sự kiện (QR / nhập mã)
│   ├── surveys.html              Kết quả khảo sát: điểm từng tiêu chí, góp ý
│   ├── survey-builder.html       Soạn nội dung bộ câu hỏi khảo sát (admin)
│   ├── staff.html                Cán bộ & phân quyền: thêm, khóa, đặt lại mật khẩu (admin)
│   └── settings.html             Cài đặt hệ thống: liên hệ, giờ đón khách, sức chứa mặc định (admin)
├── assets/ (images, icons, fonts)
├── css/
│   ├── base/        reset, variables, typography (dùng chung)
│   │                design-tokens.css  bộ màu Heritage & Horizon (biến --hh-*)
│   │                utilities.css      lớp tiện ích đã biên dịch sẵn cho trang khách (không dùng CDN)
│   ├── components/  button, modal (+ thông báo), card, public-navbar, footer, chip, museum-card, pagination,
│   │                heritage-ui.css (thẻ, ô nhập, nút, nhãn, tab, FAQ dùng chung cho trang khách và quản trị)
│   ├── layouts/     admin-layout (khung trang quản trị: sidebar, bảng, thẻ số liệu), public-layout, visitor-layout (trang khách),
│   │                visitor-auth-layout (khung 2 cột của trang đăng nhập / đăng ký khách)
│   └── pages/       1 file CSS cho mỗi trang, cùng tên với trang (index.html dùng home.css)
└── js/
    ├── config/      api.config.js (endpoint), app.config.js (ROUTES đường dẫn các trang, menu, trạng thái)
    ├── services/    api, auth (cán bộ), customer (tài khoản khách), ticket (+ tra cứu, yêu cầu đổi/hủy), event, visitor,
    │                survey, statistics, museum, support (liên hệ), order (đơn & hoàn tiền), staff (cán bộ), timeslot (khung giờ)
    ├── components/  public-navbar + footer (trang khách), admin-shell (sidebar + thanh trên của trang quản trị), modal, notification,
    │                museum-card, pagination, google-login
    ├── utils/       format, validation, helpers, admin-ui (thẻ số liệu, phân trang, xuất CSV cho trang quản trị)
    └── pages/       1 file JS cho mỗi trang, cùng tên với trang (index.html dùng home.js)
```

Các file JS dùng biến toàn cục (`window.TicketService`...) thay vì ES module để mở trực tiếp file vẫn chạy.
Thứ tự nạp script: config → utils → services → components → pages.
Đường dẫn giữa các trang khai báo một chỗ ở `APP_CONFIG.ROUTES`; thanh điều hướng và chân trang được vẽ bởi `PublicNavbar.render()` / `SiteFooter.render()`.

### Ghi chú cho các trang khách thiết kế từ Stitch
- Bố cục dùng lớp tiện ích (vd `flex px-6 bg-primary`) đã biên dịch sẵn trong `css/base/utilities.css`. Thêm lớp mới thì sinh lại theo `../tools/tailwind/README.md` (thư mục `tools/` ở gốc repo).
- Ảnh mẫu đang là link ảnh của Stitch (trong `css/pages/*.css`, class `*-photo-N`). Nên tải ảnh thật về `assets/images/` rồi đổi `url()`.
- Dữ liệu trên các trang này vẫn là dữ liệu mẫu viết sẵn trong HTML; bước tiếp theo là nối với `js/services/*` (giống trang `museums.html`).

## API backend cần có (REST, JSON)
| Phương thức | Đường dẫn | Mô tả |
|---|---|---|
| POST | /api/auth/login | `{username,password}` → `{token,user}` |
| GET/POST/PUT | /api/ticket-types[/:id] | Loại vé & giá |
| GET/POST/PUT | /api/tickets[/:id] | Vé; lọc `?code=&status=&visit_date=` |
| GET/POST | /api/checkins | Nhật ký vào cổng |
| GET/POST/PUT/DELETE | /api/events[/:id] | Sự kiện |
| GET/POST | /api/event-registrations | Đăng ký sự kiện, lọc `?event_id=` |
| GET/POST/PUT/DELETE | /api/groups[/:id] | Đoàn khách |
| GET/POST | /api/surveys | Khảo sát |
| GET | /api/statistics?from=&to= | Số liệu tổng hợp |
| GET/PUT | /api/settings | Cài đặt hệ thống |
| GET/POST/PUT | /api/users[/:id] | Cán bộ (vai trò `admin` / `staff`, trạng thái `active` / `locked`) |
| GET/POST/PUT | /api/museums[/:id] | Quản trị bảo tàng (`status: open|closed`, `slot_capacity`) |
| GET/POST/PUT | /api/time-slots[/:id] | Điều chỉnh sức chứa / khóa theo `museum_id, date, slot` |
| GET/PUT | /api/survey-config | Nội dung bộ câu hỏi khảo sát |
| POST | /api/customers/register | Đăng ký khách `{full_name,email,phone,password}` → `{token,customer}` |
| POST | /api/customers/login | Đăng nhập khách `{account,password}` (account = email hoặc SĐT) → `{token,customer}` |
| POST | /api/customers/forgot-password | Gửi mã OTP 6 số qua email `{email}` |
| POST | /api/customers/reset-password | Đặt lại mật khẩu `{email,otp,password}` |
| POST | /api/customers/google | Đăng nhập Google `{id_token}` → `{token,customer}` (backend kiểm tra id_token, chưa có email thì tạo tài khoản) |
| GET | /api/tickets?email= / ?phone= / ?code= | Tra cứu vé không cần đăng nhập |
| GET/POST/PUT | /api/ticket-requests[/:id] | Yêu cầu đổi giờ / hủy vé (`type: change|cancel`, `status: pending|approved|rejected`, `processed_by`) |
| POST | /api/contact-messages | Tin nhắn hỗ trợ từ trang Liên hệ |

Header xác thực: `Authorization: Bearer <token>`. Phản hồi có thể là dữ liệu trực tiếp hoặc `{ data: ... }`; lỗi trả `{ message }`.
Tên trường trong JSON trùng tên cột MySQL dự kiến (ví dụ `tickets.code, customer_name, ticket_type_id, quantity, visit_date, total, status`).

Thư viện CDN: qrcodejs (sinh QR), html5-qrcode (quét QR bằng camera), Chart.js (biểu đồ).

## Trang danh sách bảo tàng (pages/museums.html) — file liên quan
| Thư mục | File | Vai trò |
|---|---|---|
| css/base | variables.css (khối `.theme-heritage`), typography.css (icon, tiện ích chữ) | Bộ màu navy + vàng di sản, chỉ áp dụng khi `<body class="theme-heritage">` |
| css/layouts | public-layout.css | Khung trang khách: `.container`, `.site-main`, `.page-section` |
| css/components | public-navbar.css, footer.css, chip.css, museum-card.css, pagination.css, button.css (biến thể `--accent/--soft/--tool`) | Thành phần giao diện dùng lại |
| css/pages | museums.css | Hero, hộp lọc, lưới kết quả, banner đoàn khách, modal chi tiết |
| js/config | app.config.js (`ROUTES`, `PUBLIC_NAV`, `CITIES`, `MUSEUM_TYPES`, `HOME_PAGE_SIZE`), api.config.js (`MUSEUMS`, `MUSEUM_STATS`) | Cấu hình |
| js/utils | format.js (`reviewCount`, `openingHours`...), helpers.js (`normalizeText`, `routeUrl`, `isOpenNow`, `distanceKm`) | Hàm tiện ích |
| js/services | museum.service.js, mock/museum.mock.js | Lấy danh sách bảo tàng (mock hoặc API thật) |
| js/components | public-navbar.js, footer.js, museum-card.js, pagination.js | Vẽ navbar, footer, thẻ bảo tàng, phân trang |
| js/pages | museums.js | Logic trang chủ: bộ lọc đồng bộ lên URL (`?q=&city=&type=&sort=&open=&page=`) |

API cần có: `GET /api/museums?keyword=&city=&type=&sort=popular|rating|price-asc|distance&openNow=1&lat=&lng=&page=&pageSize=`
→ `{ items, total, page, pageSize, totalPages }`; `GET /api/museums/:id`; `GET /api/museums/stats` → `{ partner_count }`.
Bảng MySQL `museums`: `id, name, city_code, category_code, badge_label, badge_icon, description, address, open_time, close_time, open_days, min_price, rating, review_count, image_url, latitude, longitude`.
