Chuyển đổi PDF/ảnh trên trình duyệt

Mở `/chuyen-doi` sau khi đăng nhập. Hỗ trợ PDF, PNG, JPG; tối đa 20 MB và 30 trang PDF mỗi lượt. Không có API upload hoặc API OCR cho chức năng này. Vercel phân phối giao diện, worker, mô hình và font; tài liệu được xử lý bằng CPU/RAM của máy mở website.

Có thể chọn file, kéo thả hoặc bấm vùng dán rồi nhấn Ctrl+V để dán ảnh/file do trình duyệt cung cấp trong clipboard. Dán chữ vào ô chỉnh sửa vẫn hoạt động bình thường. Một số trình duyệt không nhận file copy từ File Explorer; khi đó dùng kéo thả/chọn file. Mỗi lần xử lý một tài liệu.

- PDF có chữ: PDF.js đọc nội dung và vị trí chữ. Trang có quá ít chữ sẽ tự chuyển qua OCR; có thể chọn “Luôn OCR” nếu lớp chữ trong PDF không đúng.
- PDF scan/ảnh: render từng trang, dùng Tesseract.js với mô hình Việt/Anh. Model được phục vụ từ `/ocr-assets/`, không dùng CDN bên ngoài.
- Text có thể sửa theo trang rồi tải TXT hoặc Word theo nội dung đã sửa.
- Word giữ vị trí chữ: xuất các khung chữ chỉnh sửa được ở tọa độ gần bản gốc. Chưa dựng lại ảnh, chữ ký, con dấu, bảng có cấu trúc hoặc đường kẻ. Dùng font thay thế; cần kiểm tra lại xuống dòng. Không biến toàn bộ trang thành ảnh để giả lập Word chỉnh sửa được.
- File và kết quả không được ghi vào localStorage/IndexedDB. Tesseract có thể cache mô hình ngôn ngữ trong IndexedDB; đây không phải tài liệu. Xóa kết quả/đóng trang giải phóng tham chiếu; JavaScript không bảo đảm xóa vật lý tức thời khỏi RAM/swap của hệ điều hành.
- Không tự lưu kết quả vào Google Sheets. Không chạy script, macro hay liên kết lấy từ tài liệu. Các tài liệu quan trọng vẫn cần người dùng đối chiếu kết quả OCR.

Cài đặt / Vercel

`npm ci`, sau đó `npm run dev` hoặc `npm run build`. Script predev/prebuild tự sao chép worker, WASM, CMap, font và mô hình từ node_modules sang public/ocr-assets. Thư mục asset được Git bỏ qua và được dựng lại lúc build, không cần commit file mô hình lớn. Không cần API key OCR hay biến môi trường OCR mới.

Kiểm tra

- `npm run test:ocr`: cần máy chủ ở http://localhost:3000 và .env.local có mật khẩu. Chạy Edge headless nếu có sẵn trên Windows; ở hệ khác cần cài Chromium cho Playwright. Có thể đặt OCR_TEST_URL để chọn địa chỉ khác; chỉ dùng môi trường được phép kiểm thử.
- Kiểm tra PDF có chữ, ảnh OCR Việt/Anh, xuất DOCX chứa text/khung vị trí, text đã sửa, file giả và hủy xử lý. Theo dõi mạng để xác nhận không upload và không gọi dịch vụ ngoài trong phép thử. Không sửa dữ liệu Google Sheets.
- Model/assets cần được tải trước khi OCR hoạt động. Chưa có service worker để bảo đảm website hoạt động hoàn toàn offline. Tốc độ phụ thuộc thiết bị; chưa có GPU/WebGPU hoặc mô hình phân tích bố cục nâng cao.
