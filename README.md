# Hệ thống quản lý khách tham quan, vé điện tử và sự kiện bảo tàng

Phần mềm web quản lý khách tham quan, vé điện tử và sự kiện của bảo tàng: đặt vé, phát hành vé QR, kiểm soát lượt vào, đăng ký tham dự sự kiện, quản lý đoàn khách và khảo sát mức độ hài lòng.

> **Trạng thái:** frontend đã hoàn thành và đang chạy bằng dữ liệu mẫu (lưu trong `localStorage` của trình duyệt). Backend REST và cơ sở dữ liệu MySQL chưa được xây dựng.

## Chức năng

| Phân hệ | Mô tả |
|---|---|
| **Đặt vé** | Khách xem danh sách bảo tàng, chọn loại vé, ngày tham quan, số lượng và đặt vé trực tuyến. Cán bộ có thể bán vé tại quầy và quản lý loại vé, giá vé. |
| **Vé điện tử QR** | Mỗi vé có một mã duy nhất kèm mã QR. Trạng thái vé: chưa dùng, đã dùng, hết hạn, đã hủy. Khách có thể tra cứu vé theo mã. |
| **Kiểm soát lượt vào** | Cán bộ quét mã QR bằng camera hoặc nhập mã vé. Hệ thống kiểm tra vé hợp lệ, chặn vé đã dùng và ghi lại mỗi lượt vào trong nhật ký vào cổng. |
| **Đăng ký sự kiện** | Cán bộ tạo sự kiện với ngày diễn ra và số chỗ tối đa. Khách đăng ký tham dự, cán bộ xem danh sách đăng ký của từng sự kiện. |
| **Quản lý đoàn khách** | Khách gửi yêu cầu tham quan theo đoàn (trưởng đoàn, số người, ngày đến). Cán bộ tiếp nhận, duyệt hoặc từ chối lịch của đoàn. |
| **Khảo sát mức độ hài lòng** | Khách chấm điểm và góp ý sau chuyến tham quan. Cán bộ xem kết quả khảo sát. |
| **Thống kê** | Bảng điều khiển và biểu đồ về số vé bán ra, doanh thu, lượt vào và mức độ hài lòng, có xuất file CSV (quản trị viên). |

## Vai trò người dùng

- **Khách tham quan**: xem bảo tàng, đặt vé, đăng ký sự kiện, đăng ký đoàn, làm khảo sát, tra cứu vé. Không cần đăng nhập.
- **Cán bộ vận hành**: đăng nhập để bán vé, soát vé tại cổng, quản lý sự kiện, đoàn khách và khảo sát.
- **Quản trị viên**: có toàn bộ quyền của cán bộ, thêm thống kê và cài đặt thông tin bảo tàng.

## Công nghệ sử dụng

| Thành phần | Công nghệ |
|---|---|
| Frontend | HTML5, CSS3, JavaScript thuần (không dùng framework, không cần build) |
| Mã QR | [qrcodejs](https://github.com/davidshimjs/qrcodejs) để tạo mã, [html5-qrcode](https://github.com/mebjas/html5-qrcode) để quét bằng camera (nạp qua CDN) |
| Biểu đồ | [Chart.js](https://www.chartjs.org/) (nạp qua CDN) |
| Cơ sở dữ liệu | MySQL 8 (InnoDB, `utf8mb4`) |
| Giao tiếp | REST API dạng JSON, xác thực bằng `Authorization: Bearer <token>` |

## Cấu trúc thư mục frontend

```
frontend/
├── index.html                 Trang chủ khách tham quan (danh sách bảo tàng: tìm kiếm, lọc, sắp xếp, phân trang, xem chi tiết)
├── README.md                  Ghi chú frontend và danh sách API backend cần có
├── pages/
│   ├── booking.html           Dịch vụ cho khách: đặt vé QR, sự kiện, đăng ký đoàn, khảo sát, tra cứu vé
│   ├── login.html             Đăng nhập cán bộ
│   ├── dashboard.html         Bảng điều khiển
│   ├── tickets.html           Vé điện tử: bán vé tại quầy, phát hành QR, loại vé và giá
│   ├── checkin.html           Kiểm soát lượt vào: quét QR hoặc nhập mã, nhật ký vào cổng
│   ├── events.html            Sự kiện và danh sách đăng ký
│   ├── visitors.html          Đoàn khách: tiếp nhận, duyệt lịch
│   ├── surveys.html           Kết quả khảo sát mức độ hài lòng
│   ├── statistics.html        Thống kê, biểu đồ, xuất CSV (quản trị viên)
│   └── settings.html          Cài đặt thông tin bảo tàng (quản trị viên)
├── assets/
│   ├── images/
│   ├── icons/
│   └── fonts/
├── css/
│   ├── base/                  reset.css, variables.css, typography.css
│   ├── components/            button, card, chip, modal, navbar, sidebar, public-navbar,
│   │                          footer, museum-card, pagination
│   ├── layouts/               main-layout.css (cán bộ), auth-layout.css (đăng nhập), public-layout.css (khách)
│   └── pages/                 mỗi trang một file CSS (home.css cho index.html)
└── js/
    ├── config/                api.config.js (địa chỉ API, endpoint, USE_MOCK), app.config.js (menu, route, trạng thái)
    ├── services/              api, auth, museum, ticket, event, visitor, survey, statistics
    │   └── mock/              museum.mock.js (dữ liệu mẫu)
    ├── components/            navbar, sidebar, public-navbar, footer, modal, notification,
    │                          museum-card, pagination
    ├── utils/                 format.js, validation.js, helpers.js
    └── pages/                 mỗi trang một file JS (home.js cho index.html)
```

Các file JS dùng biến toàn cục (ví dụ `window.TicketService`) thay vì ES module, nên mở trực tiếp file HTML vẫn chạy được. Thứ tự nạp script trên mọi trang: `config → utils → services → components → pages`.

## Cơ sở dữ liệu MySQL (tổng quan)

Các bảng chính: `users`, `museums`, `ticket_types`, `tickets`, `checkins`, `events`, `event_registrations`, `visitor_groups`, `surveys`, `settings`.

Bảng đoàn khách đặt tên `visitor_groups` vì `GROUPS` là từ khóa dành riêng trong MySQL 8. Tên trường JSON ở frontend trùng với tên cột dự kiến trong MySQL (ví dụ `tickets.code, customer_name, ticket_type_id, quantity, visit_date, total, status`).

Tạo cơ sở dữ liệu:

```sql
CREATE DATABASE museum CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## Chạy frontend

1. Mở `frontend/index.html` bằng trình duyệt, hoặc tốt hơn là chạy thư mục bằng **Live Server** của VS Code (camera quét QR cần chạy trên `localhost` hoặc HTTPS).
2. Trang cho khách: `index.html` và `pages/booking.html`.
3. Trang cho cán bộ: `pages/login.html`. Tài khoản thử: `admin / admin123` (quản trị viên), `staff / staff123` (soát vé).

Mặc định `USE_MOCK: true` trong `js/config/api.config.js`, mọi dữ liệu được lưu trong `localStorage`. Khi backend sẵn sàng, đổi thành `false` và sửa `BASE_URL` thành địa chỉ API. Danh sách endpoint backend cần cung cấp nằm trong `frontend/README.md`.

## Giấy phép

Đồ án học tập, sử dụng nội bộ. Bảo lưu mọi quyền.
