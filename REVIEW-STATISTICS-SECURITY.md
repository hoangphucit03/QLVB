Rà soát thống kê và bảo mật — 31/10/2026

Đã sửa các lỗi xác định được trong luồng thống kê và dữ liệu. Đây là rà soát mã nguồn, kiểm thử tự động và kiểm tra API local; không phải chứng nhận bảo mật hay kiểm thử xâm nhập đầy đủ.

Luồng thống kê

- Trước đây trang tải riêng thống kê và hai danh sách giới hạn 1.000 dòng: tổng, tỷ lệ và cơ cấu có thể không khớp. Nay một API đọc hai nguồn đến/đi, tính toàn bộ tổng và phân nhóm tại server; trang không tải toàn bộ nội dung văn bản chỉ để đếm.
- Bộ chọn năm dùng danh sách cố định từ năm hiện tại về 2000, không thay đổi mốc theo lựa chọn. API từ chối năm sai.
- Hủy yêu cầu cũ khi đổi năm; hiển thị đang tải/lỗi/demo rõ ràng, không giữ báo cáo cũ dưới năm mới khi tải lỗi.
- Văn bản chưa hoàn thành có hạn trước ngày hiện tại tại Việt Nam được tính quá hạn. Các nhóm tiến độ không đếm trùng. Văn bản khẩn chưa hoàn thành được đếm kể cả khi không có hạn.
- Văn bản đi tính tất cả trạng thái, bao gồm dự thảo; nhãn đã nói rõ. Thống kê tháng sử dụng ngày đến/ngày phát hành; bộ lọc năm sử dụng trường `nam`. Dữ liệu ngày trong Sheets phải theo YYYY-MM-DD như biểu mẫu. Nếu tự sửa Sheets với ngày định dạng khác, cần chuẩn hóa trước.
- Người chủ trì để trống được xếp vào nhóm “Chưa phân công”. Tên nhóm đặc biệt như `__proto__` không làm hỏng bộ đếm.

Các sửa đổi bảo mật và toàn vẹn dữ liệu

- Loại bỏ khóa ký JWT mặc định công khai; yêu cầu SESSION_SECRET ít nhất 32 ký tự. Khóa thật trong .env.local được giữ nguyên; file mẫu để trống để buộc tạo khóa riêng.
- Dùng chung kiểm tra phiên tại middleware và API: chỉ HS256, bắt buộc thời điểm phát hành/hết hạn, xác minh danh tính và vai trò quản trị. Cookie vẫn HttpOnly, SameSite=Lax và Secure khi chạy production.
- So sánh mật khẩu bằng timingSafeEqual trên hash. Giữ mật khẩu người dùng yêu cầu; không hiển thị trên giao diện.
- Chặn yêu cầu ghi có Origin khác origin ứng dụng hoặc Fetch Metadata cross-site. POST/PUT/PATCH phải là JSON. Có kiểm tra Content-Length 64 KiB; đây không phải giới hạn đọc stream tuyệt đối nếu client bỏ header, nên vẫn cần giới hạn request body tại hạ tầng khi triển khai.
- Giới hạn 30 yêu cầu đăng nhập/phút cho mỗi tiến trình. Đây là lớp giới hạn cơ bản, không thay thế rate limit dùng kho chung/WAF cho nhiều instance; giới hạn chung cũng có thể ảnh hưởng người dùng hợp lệ khi bị tấn công.
- Chặn chuyển hướng đăng nhập ra URL bên ngoài; chỉ cho chuyển đến các trang nghiệp vụ đã định nghĩa.
- Giới hạn URL đính kèm HTTP/HTTPS cả khi nhận dữ liệu mới lẫn khi render liên kết cũ từ Sheets.
- Ghi Sheets bằng RAW thay cho USER_ENTERED để nội dung bắt đầu bằng `=` không trở thành công thức. Không thay đổi các công thức đã có sẵn trong Sheets.
- Khi đã cấu hình Google mà đọc/ghi/xóa lỗi: không chuyển ngầm sang bộ nhớ demo và không báo xóa thành công giả. Cấu hình thiếu một trong email/private key bị từ chối. Chỉ dùng demo khi cả hai giá trị đều chưa cấu hình.
- Bỏ thông báo lỗi Google nguyên gốc khỏi log và phản hồi để giảm nguy cơ lộ thông tin xác thực/ngữ cảnh request. Không trộn dữ liệu mẫu vào danh mục/cấu hình Sheets trống.
- API dùng Cache-Control private/no-store. Bổ sung chống nhúng iframe, nosniff, referrer-policy và CSP giới hạn frame/object/base. CSP này chưa phải chính sách chống XSS hoàn chỉnh.
- Kiểm tra phân trang: page dương, limit 1–1000. Các API nghiệp vụ tiếp tục kiểm tra phiên ở route, ngoài middleware.

Đã kiểm chứng

- `npm test`: 5 nhóm kiểm thử, bao gồm hơn 1.000 bản ghi, lọc năm, quá hạn theo múi giờ Việt Nam, người chưa phân công, tên nhóm đặc biệt, URL nguy hiểm, Google lỗi, ghi RAW, phiên sai/hết hạn/thiếu khóa và giới hạn đăng nhập.
- `npx tsc --noEmit`: đạt.
- API thực tế: sáu nhóm API từ chối khi chưa đăng nhập; đăng nhập và xóa cross-origin bị chặn trước khi truy cập dữ liệu; tham số năm/phân trang sai bị từ chối.
- Thống kê từ Sheets thật: không ở chế độ demo; tổng phân loại và tổng nhóm trạng thái khớp tổng đến. Trang thống kê trả HTTP 200; API có no-store.
- `npm audit --omit=dev --json`: 0 lỗ hổng đã biết trong dependency production tại thời điểm kiểm tra. Không đồng nghĩa không có lỗ hổng chưa công bố, và chưa bao gồm dependency chỉ dùng khi phát triển.
- Không tạo, sửa hoặc xóa văn bản thật trên Google Sheets khi kiểm thử. Các lỗi ghi/xóa được mô phỏng.

Các giới hạn cần xử lý trước khi dùng rộng rãi

1. Hệ thống vẫn dùng một mật khẩu và một vai trò quản trị chung: chưa có tài khoản cá nhân, phân quyền theo người, MFA hoặc nhật ký truy vết người sửa/xóa. Không thể quy trách nhiệm thao tác cho từng người.
2. JWT có thời hạn 7 ngày. Đăng xuất xóa cookie trên trình duyệt nhưng chưa thu hồi token đã bị sao chép; đổi mật khẩu chưa thu hồi mọi phiên. Cần kho phiên/phiên bản tài khoản nếu muốn thu hồi tức thời. Có thể xoay SESSION_SECRET để vô hiệu hóa toàn bộ phiên hiện tại.
3. Google Sheets chưa cung cấp transaction/unique constraint trong cách triển khai này. Hai request đồng thời có thể vượt kiểm tra trùng số; cập nhật cùng một văn bản có thể ghi đè nhau. Cần hàng đợi/khóa dùng chung hoặc database có transaction nếu nhiều người thao tác.
4. Cần HTTPS và chạy production khi triển khai. Kiểm tra cấu hình reverse proxy/Origin, rate limit dùng chung, giới hạn kích thước body và quyền chia sẻ tối thiểu của Service Account trên môi trường thật. Chưa kiểm thử hạ tầng triển khai.
5. Các API GET ngoài thống kê có thể trả lỗi server chung khi Google ngừng hoạt động; không trả dữ liệu demo giả. Cần cải thiện thông báo/thử lại trên từng màn hình nếu muốn trải nghiệm mất kết nối thống nhất.

Tham khảo: [OWASP REST Security](https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html), [OWASP CSRF Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html).
