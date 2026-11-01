Trình chỉnh sửa PDF thống nhất

Mở `/cong-cu-pdf` từ mục “Chỉnh sửa PDF”. Website chạy trên Vercel, tài liệu được xử lý trong trình duyệt và Web Worker của máy người dùng. Không có API upload/xử lý PDF ở server.

Luồng: mở một PDF → xem ảnh thu nhỏ và trang lớn → chọn trang → xoay/xóa/chèn/di chuyển → hoàn tác nếu cần → Lưu PDF. Các thao tác nối tiếp trong cùng phiên làm việc, không cần tải file trung gian.

- Xoay: chọn một hoặc nhiều trang, nhấn Xoay 90°; giữ nguyên góc xoay gốc và cộng thêm góc xoay đã chọn.
- Xóa: bỏ các trang đã chọn khỏi bản đang chỉnh sửa. Không được xóa toàn bộ trang.
- Chèn từ PDF khác: chọn file nguồn, nhập các trang nguồn (`1,3-5`) và vị trí đầu tài liệu hoặc sau bất kỳ trang nào, kể cả cuối. Chọn toàn bộ trang nguồn để ghép cả file.
- Di chuyển: chọn trang xem lớn, dùng mũi tên trái/phải để đổi vị trí trang trong tài liệu.
- Tách trang đã chọn: xuất những trang được chọn thành một PDF mới, theo thứ tự hiện tại và góc xoay hiện tại; không loại trang khỏi tài liệu đang chỉnh sửa. Nếu cần chuyển hẳn các trang sang file khác: tách rồi xóa lựa chọn tương ứng.
- Chọn trang bằng checkbox hoặc nhập phạm vi theo số thứ tự đang hiển thị. Không đánh dấu trang nào thì thao tác áp dụng cho trang đang xem.
- Hoàn tác/làm lại: giữ tối đa 30 bước chỉnh sửa. Xuất/tách không làm mất lịch sử.
- Lưu PDF tải file mới, không ghi đè file gốc. Đóng tài liệu/hủy kết thúc Worker và giải phóng phiên. Tải lại trang sẽ mất thay đổi chưa xuất.

Giới hạn: tổng 50 MB, 20 file nguồn, 300 trang nguồn/kết quả. Các file đã nạp trong phiên tiếp tục chiếm tài nguyên để có thể hoàn tác; đóng tài liệu để giải phóng hoàn toàn phiên. Thumbnail chỉ render khi gần vùng nhìn thấy.

Chưa có sửa chữ/hình ngay trong trang hoặc chức năng đầy đủ của Adobe Acrobat. Chưa hỗ trợ PDF có mật khẩu và bảo toàn chữ ký số, bookmark, biểu mẫu tương tác. Các thao tác tổ chức trang không phải xóa/che thông tin mật bên trong một trang. Không chạy JavaScript nhúng trong PDF.

Kiểm thử: `npm run dev`, sau đó `npm run test:pdf`. Dùng Edge headless có sẵn trên Windows; nền tảng khác cần Chromium cho Playwright. Kiểm tra chuỗi xoay → chèn trang bất kỳ vào giữa → xóa → hoàn tác/làm lại → tách → di chuyển → lưu, đối chiếu kích thước/thứ tự/góc xoay của PDF thực tế. Kiểm tra bản gốc không đổi, không có upload hoặc request tới dịch vụ ngoài. Chỉ dùng fixture được tạo tại máy, không sửa tài liệu thật.
