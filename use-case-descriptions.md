# MÔ TẢ USE CASE - WEBSITE TÍNH CALORIES VÀ GỢI Ý THỰC ĐƠN THEO TÌNH TRẠNG SỨC KHỎE

## 1. USE CASE QUẢN LÝ TÀI KHOẢN

### UC001: Đăng nhập
**Actor:** Người dùng vãng lai, Người dùng, Quản trị viên
**Mô tả:** Người dùng đăng nhập vào hệ thống bằng Google/email 
**Precondition:** Người dùng chưa đăng nhập
**Main Flow:**
1. Người dùng truy cập trang đăng nhập
2. Đăng nhập google/email
3. Hệ thống xác thực thông tin
**Postcondition:** Người dùng đã đăng nhập thành công
**Exception:** Thông tin đăng nhập không chính xác

### UC002: Đăng ký
**Actor:** Người dùng vãng lai
**Mô tả:** Người dùng vãng lai tạo tài khoản mới trong hệ thống
**Precondition:** Chưa có tài khoản
**Main Flow:**
1. Người dùng truy cập trang đăng ký
2. Nhập thông tin cá nhân (họ tên, email, số điện thoại, mật khẩu)
3. Xác nhận mật khẩu
**Postcondition:** Tài khoản mới được tạo thành công
**Exception:** Email đã tồn tại, thông tin không hợp lệ

### UC003: Quên mật khẩu
**Actor:** Người dùng vãng lai, Người dùng
**Mô tả:** Người dùng yêu cầu đặt lại mật khẩu khi quên
**Precondition:** Có tài khoản trong hệ thống
**Main Flow:**
1. Người dùng chọn "Quên mật khẩu"
2. Nhập email đã đăng ký
3. Hệ thống gửi link đặt lại mật khẩu qua email
4. Người dùng click vào link
5. Nhập mật khẩu mới
6. Xác nhận mật khẩu mới
**Postcondition:** Mật khẩu được đặt lại thành công
**Exception:** Email không tồn tại, link hết hạn

### UC004: Đăng xuất
**Actor:** Người dùng, Quản trị viên
**Mô tả:** Người dùng đăng xuất khỏi hệ thống
**Precondition:** Người dùng đã đăng nhập
**Main Flow:**
1. Người dùng chọn "Đăng xuất"
2. Hệ thống xóa session
3. Chuyển hướng về trang chủ
**Postcondition:** Người dùng đã đăng xuất thành công

### UC005: Quản lý tài khoản cá nhân
**Actor:** Người dùng
**Mô tả:** Người dùng cập nhật thông tin cá nhân và quản lý hồ sơ
**Precondition:** Đã đăng nhập
**Main Flow:**
1. Truy cập trang hồ sơ cá nhân
2. Xem thông tin hiện tại
3. Cập nhật thông tin cá nhân
4. Thêm nhật ký ăn uống
5. Xem tiến trình
**Postcondition:** Thông tin cá nhân được cập nhật
**Exception:** Thông tin không hợp lệ

## 2. USE CASE THÔNG TIN VÀ ĐIỀU HƯỚNG

### UC006: Xem trang chủ
**Actor:** Người dùng vãng lai, Người dùng
**Mô tả:** Hiển thị trang chủ với thông tin tổng quan
**Precondition:** Không
**Main Flow:**
1. Truy cập trang chủ
2. Hiển thị banner quảng cáo
3. Hiển thị liên kết đến chức năng tính Calories
4. Hiển thị tính năng nổi bật
5. Hiển thị món ăn nổi bật
6. Hiển thị thông tin liên hệ
**Postcondition:** Trang chủ được hiển thị thành công

### UC007: Tính toán thông tin sức khỏe
**Actor:** Người dùng vãng lai, Người dùng
**Mô tả:** Người dùng hoặc khách vãng lai nhập thông tin cá nhân để tính toán các chỉ số sức khỏe (BMI, BMR, TDEE, v.v.)
**Precondition:** Không
**Main Flow:**
1. Truy cập trang tính toán
2. Nhập thông tin (tuổi, giới tính, chiều cao, cân nặng, mức vận động)
3. Hệ thống tính toán và hiển thị kết quả
**Postcondition:** Kết quả tính toán được hiển thị
**Exception:** Thông tin nhập không hợp lệ

### UC008: Nhận thực đơn gợi ý
**Actor:** Người dùng vãng lai, Người dùng
**Mô tả:** Hệ thống gợi ý thực đơn phù hợp với tình trạng sức khỏe và mục tiêu cá nhân
**Precondition:** Đã tính toán thông tin sức khỏe
**Main Flow:**
1. Hệ thống phân tích dữ liệu sức khỏe và mục tiêu
2. Hệ thống xử lý và đưa ra gợi ý
3. Hiển thị thực đơn phù hợp
**Postcondition:** Thực đơn gợi ý được hiển thị

### UC009: Lưu lịch sử tính toán
**Actor:** Người dùng
**Mô tả:** Lưu lại các lần tính toán sức khỏe của người dùng
**Precondition:** Đã đăng nhập
**Main Flow:**
1. Sau khi tính toán, người dùng chọn lưu lịch sử
2. Hệ thống lưu thông tin vào hồ sơ cá nhân
**Postcondition:** Lịch sử tính toán được lưu lại

### UC010: Xem món ăn và công thức
**Actor:** Người dùng vãng lai, Người dùng
**Mô tả:** Xem danh sách món ăn, công thức nấu ăn, thành phần dinh dưỡng
**Precondition:** Không
**Main Flow:**
1. Truy cập trang món ăn/công thức
2. Chọn món ăn để xem chi tiết
3. Xem thông tin dinh dưỡng và cách nấu
**Postcondition:** Thông tin món ăn/công thức được hiển thị

### UC011: Thêm/Xóa bữa ăn
**Actor:** Người dùng
**Mô tả:** Thêm hoặc xóa bữa ăn vào thực đơn cá nhân.
**Precondition:** Thêm hoặc xóa bữa ăn vào thực đơn cá nhân.
**Main Flow:**
1. Chọn món ăn muốn thêm/xóa
2. Hệ thống cập nhật thực đơn cá nhân
**Postcondition:** Thực đơn cá nhân được cập nhật
**Exception:** Món ăn không tồn tại

### UC012: Xem tiến trình
**Actor:** Người dùng
**Mô tả:** Xem tiến trình sức khỏe và dinh dưỡng
**Precondition:** Đã đăng nhập
**Main Flow:**
1. Truy cập trang tiến trình
2. Xem biểu đồ tiến trình
3. Xem thống kê dinh dưỡng
4. Xem mục tiêu và kết quả
**Postcondition:** Tiến trình được hiển thị

### UC013: Xem giới thiệu
**Actor:** Người dùng vãng lai, Người dùng
**Mô tả:** Xem thông tin giới thiệu về website
**Precondition:** Không
**Main Flow:**
1. Truy cập trang giới thiệu
2. Xem thông tin về website
3. Xem tính năng chính
**Postcondition:** Trang giới thiệu được hiển thị

### UC014: Gửi liên hệ
**Actor:** Người dùng
**Mô tả:** Gửi thông tin liên hệ và phản hồi
**Precondition:** Đã đăng nhập
**Main Flow:**
1. Truy cập trang liên hệ
2. Nhập thông tin liên hệ
3. Nhập nội dung phản hồi
4. Gửi thông tin
**Postcondition:** Thông tin liên hệ được gửi thành công
**Exception:** Thông tin không hợp lệ

### UC015: Xem điều khoản và bảo mật
**Actor:** Người dùng vãng lai, Người dùng
**Mô tả:** Xem điều khoản sử dụng và chính sách bảo mật
**Precondition:** Không
**Main Flow:**
1. Truy cập trang điều khoản
2. Xem điều khoản sử dụng
3. Xem chính sách bảo mật
**Postcondition:** Điều khoản và bảo mật được hiển thị

## 3. USE CASE QUẢN TRỊ HỆ THỐNG (ADMIN)

### UC016: Quản lý tài khoản người dùng
**Actor:** Quản trị viên
**Mô tả:** Quản lý danh sách người dùng hệ thống
**Precondition:** Đã đăng nhập với quyền admin
**Main Flow:**
1. Xem danh sách người dùng
2. Xem chi tiết người dùng
3. Đánh dấu tài khoản hoạt động/không hoạt động
4. Xóa tài khoản (nếu cần)
**Postcondition:** Quản lý người dùng thành công

### UC017: Quản lý công thức và món ăn
**Actor:** Quản trị viên
**Mô tả:** Thêm, sửa, xóa công thức và món ăn
**Precondition:** Đã đăng nhập với quyền admin
**Main Flow:**
1. Xem danh sách món ăn và công thức
2. Thêm món ăn/công thức mới
3. Chỉnh sửa thông tin món ăn
4. Upload hình ảnh món ăn
5. Cập nhật thông tin dinh dưỡng
6. Xóa món ăn (nếu cần)
**Postcondition:** Quản lý món ăn và công thức thành công

### UC018: Xem thống kê báo cáo
**Actor:** Quản trị viên
**Mô tả:** Xem tổng quan thống kê hệ thống
**Precondition:** Đã đăng nhập với quyền admin
**Main Flow:**
1. Truy cập dashboard
2. Xem thống kê người dùng
3. Xem thống kê tính toán
4. Xem biểu đồ phân tích
5. Xuất báo cáo
**Postcondition:** Thống kê báo cáo được hiển thị

### UC019: Quản lý liên hệ
**Actor:** Quản trị viên
**Mô tả:** Quản lý thông tin liên hệ từ người dùng
**Precondition:** Đã đăng nhập với quyền admin
**Main Flow:**
1. Xem danh sách liên hệ
2. Xem chi tiết liên hệ
3. Phản hồi liên hệ
4. Đánh dấu đã xử lý
**Postcondition:** Quản lý liên hệ thành công

### UC020: Quản lý cài đặt
**Actor:** Quản trị viên
**Mô tả:** Quản lý cài đặt hệ thống
**Precondition:** Đã đăng nhập với quyền admin
**Main Flow:**
1. Truy cập trang cài đặt
2. Cập nhật thông tin website
3. Cấu hình hệ thống
4. Quản lý thông báo
5. Lưu cài đặt
**Postcondition:** Cài đặt được cập nhật thành công

## 4. USE CASE TÍCH HỢP BÊN NGOÀI

### UC021: Tích hợp AI Together
**Actor:** Người dùng, AI Together
**Mô tả:** Tích hợp AI để gợi ý thực đơn thông minh
**Precondition:** Đã tính toán thông tin sức khỏe
**Main Flow:**
1. Gửi dữ liệu sức khỏe đến AI Together
2. AI phân tích và đưa ra gợi ý
3. Nhận kết quả từ AI
4. Hiển thị thực đơn gợi ý
**Postcondition:** Thực đơn AI được hiển thị
**Exception:** AI không khả dụng
