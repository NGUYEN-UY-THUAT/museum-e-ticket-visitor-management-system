# Sinh lại css/base/utilities.css

Các trang khách tham quan (thiết kế từ Stitch) dùng lớp tiện ích kiểu Tailwind như `flex`, `px-6`, `bg-primary`.
Các lớp này đã được biên dịch sẵn thành CSS thuần ở `Front_end/css/base/utilities.css`, nên trang chạy không cần Tailwind CDN hay bước build.

Chỉ khi bạn **thêm lớp tiện ích mới** vào HTML/JS thì mới cần sinh lại file:

```bash
cd tools/tailwind
npx tailwindcss@3.4.17 -c tailwind.config.js -i input.css -o ../../Front_end/css/base/utilities.css
```

Đổi màu: sửa `Front_end/css/base/design-tokens.css`, không cần sinh lại.
