# 🛍️ ShopOnline – E-Commerce Landing Page

Landing page thương mại điện tử giao diện hiện đại, tối ưu trải nghiệm trên mọi thiết bị (Responsive Mobile & Desktop), hỗ trợ giỏ hàng động, thanh toán nhiều hình thức và trợ lý Chatbot tự động.

---

## 🚀 Hướng Dẫn Đưa Lên GitHub & Bật GitHub Pages

### Cách 1: Tải trực tiếp trên giao diện web GitHub (Đơn giản nhất)
1. Truy cập [GitHub](https://github.com) và tạo một **New repository** (ví dụ đặt tên: `ecommerce-landing`). Chọn chế độ **Public**.
2. Tại trang repo vừa tạo, nhấn vào **"uploading an existing file"** (hoặc kéo thả toàn bộ các file bên trong thư mục này vào giao diện GitHub).
   > **Lưu ý:** Kéo trực tiếp các file và thư mục (`index.html`, `product.html`, `checkout.html`, `orders.html`, `css/`, `js/`, `assets/`, `.nojekyll`...), không kéo lồng cả thư mục cha `ecommerce-landing`.
3. Bấm **Commit changes** để lưu file.

### Cách 2: Sử dụng Git Command Line
```bash
git init
git add .
git commit -m "Initial commit - ShopOnline Landing Page"
git branch -M main
git remote add origin https://github.com/<tai-khoan-cua-ban>/<ten-repo>.git
git push -u origin main
```

---

## 🌐 Kích Hoạt GitHub Pages Để Chạy Web Online

1. Trong repository trên GitHub, vào tab **Settings** (ở thanh menu phía trên).
2. Ở thanh bên trái, chọn mục **Pages**.
3. Tại phần **Build and deployment** > **Branch**:
   - Chọn nhánh: **`main`** (hoặc `master`).
   - Chọn thư mục: **`/(root)`**.
   - Bấm nút **Save**.
4. Chờ khoảng 1–2 phút rồi tải lại trang. GitHub sẽ hiển thị đường link trang web của bạn:
   👉 `https://<ten-user>.github.io/<ten-repo>/`

---

## 📁 Cấu Trúc Dự Án

```text
ecommerce-landing/
├── index.html          # Trang chủ & danh sách sản phẩm nổi bật
├── product.html        # Trang chi tiết sản phẩm
├── checkout.html       # Trang thanh toán & xác nhận đơn hàng
├── orders.html         # Trang lịch sử đơn hàng đã đặt
├── .nojekyll           # Bỏ qua Jekyll giúp GitHub Pages chạy nhanh và đúng định dạng
├── .gitignore          # Bỏ qua các file rác của hệ thống
├── css/
│   └── style.css       # Toàn bộ CSS phong cách hiện đại, responsive
├── js/
│   ├── data.js         # Dữ liệu sản phẩm mẫu & cấu hình
│   ├── main.js         # Logic trang chủ, slider, lọc sản phẩm, chi tiết & giỏ hàng
│   ├── checkout.js     # Xử lý tính tiền, phí ship, lưu đơn hàng
│   ├── orders.js       # Hiển thị lịch sử đơn hàng từ LocalStorage
│   └── chatbot.js      # Trợ lý ảo tư vấn tự động (FAQ)
└── assets/             # Thư mục chứa hình ảnh/tài nguyên tĩnh bổ sung
```

---

## ✨ Tính Năng Nổi Bật

- **Banner Slider**: Tự động chuyển slide mượt mà, hỗ trợ chuyển thủ công.
- **Lọc danh mục**: Phân loại theo Áo, Quần, Giày, Váy, Phụ kiện...
- **Chi tiết sản phẩm**: Hiển thị thông số, hình ảnh, đánh giá và thêm vào giỏ tức thì.
- **Giỏ hàng động (Mini Cart)**: Thêm/bớt số lượng, xóa sản phẩm, tự động tính tổng tiền và lưu vào `LocalStorage`.
- **Thanh toán**:
  - Hỗ trợ COD, chuyển khoản ngân hàng, MoMo, ZaloPay.
  - Tự động miễn phí vận chuyển cho đơn hàng từ 500.000đ.
  - Kiểm tra form hợp lệ và sinh mã đơn hàng ngẫu nhiên.
- **Lịch sử đơn hàng**: Theo dõi trạng thái đơn hàng đã đặt trong phiên làm việc.
- **Chatbot thông minh**: Hỗ trợ giải đáp nhanh các câu hỏi về giá, đổi trả, bảo hành, phí ship...
