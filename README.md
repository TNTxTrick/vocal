# Sổ Tay Từ Vựng — hướng dẫn deploy lên Vercel

Project này gồm:
- `index.html` — toàn bộ giao diện web (đăng nhập, quản trị, kiểm tra từ vựng, chuỗi ngày, sáng/tối...)
- `api/kv.js` — serverless function làm cầu nối giữa web và Vercel KV (kho lưu trữ dùng chung)
- `package.json` — khai báo thư viện `@vercel/kv`

## Bước 1 — Đưa code lên GitHub
1. Tạo một repository mới trên GitHub.
2. Upload toàn bộ nội dung thư mục này lên (bao gồm `index.html`, thư mục `api/`, `package.json`).

## Bước 2 — Deploy lên Vercel
1. Vào [vercel.com](https://vercel.com) → **Add New → Project**.
2. Chọn repository vừa tạo → **Import**.
3. Vercel sẽ tự nhận diện đây là project tĩnh có kèm serverless functions — không cần chỉnh Build Command hay Output Directory, cứ để mặc định và bấm **Deploy**.

Sau bước này, web đã chạy được — nhưng **chưa có kho lưu trữ dùng chung**, vì `api/kv.js` cần một Vercel KV database để hoạt động. Nếu chưa làm bước 3, web sẽ tự động lưu tạm bằng `localStorage` (chỉ lưu riêng trên từng trình duyệt).

## Bước 3 — Kết nối Vercel KV (để dữ liệu dùng chung cho mọi người)
1. Vào project vừa deploy trên Vercel → tab **Storage**.
2. Chọn **Create Database → KV** (được cung cấp bởi Upstash, có gói miễn phí).
3. Đặt tên bất kỳ, chọn vùng gần người dùng của bạn, bấm **Create**.
4. Ở màn hình tiếp theo, chọn **Connect Project** → chọn đúng project này → xác nhận.
   → Vercel sẽ tự động thêm các biến môi trường cần thiết (`KV_REST_API_URL`, `KV_REST_API_TOKEN`, v.v.) vào project, không cần bạn tự nhập.
5. Vào tab **Deployments** → bấm **Redeploy** ở bản deploy mới nhất (để các biến môi trường mới có hiệu lực).

## Bước 4 — Kiểm tra
1. Mở web đã deploy.
2. Đăng nhập admin (`admin` / `admin123`) hoặc vào bằng tên học viên bất kỳ — nếu thấy banner đỏ "Chưa kết nối kho lưu trữ dùng chung" ở đầu trang, nghĩa là KV chưa hoạt động.
3. Sau khi làm xong bước 3 (Connect KV + Redeploy), quay lại trang và bấm nút **"Kiểm tra lại kết nối"** trên banner đó (không cần tải lại trang) — nếu chuyển sang thông báo thành công là đã xong.
4. Đổi mật khẩu admin ngay để bảo mật (tab Tài khoản admin).
5. Thử thêm một từ vựng, sau đó mở web bằng trình duyệt/thiết bị khác — nếu thấy từ đó xuất hiện, nghĩa là dữ liệu đã dùng chung đúng như mong muốn.

### Nếu vẫn không kết nối được sau khi đã Connect + Redeploy
- Vào Vercel → project → tab **Settings → Environment Variables**, kiểm tra có các biến bắt đầu bằng `KV_` (ví dụ `KV_REST_API_URL`, `KV_REST_API_TOKEN`) hay chưa. Nếu không có, quay lại tab Storage và Connect lại.
- Vào tab **Deployments → (bản mới nhất) → Functions logs**, xem log của `api/kv.js` nếu có lỗi cụ thể.
- Đảm bảo đã **Redeploy** sau khi Connect KV — biến môi trường chỉ có hiệu lực ở lần deploy sau khi được thêm vào.

## Lưu ý bảo mật
- Mật khẩu admin được lưu ở dạng văn bản thường (không mã hoá) trong KV — phù hợp cho lớp học/nhóm nhỏ dùng nội bộ, **không phù hợp cho ứng dụng công khai có dữ liệu nhạy cảm**.
- Không cần backend riêng cho học viên: học viên chỉ cần nhập tên để vào luyện tập, không có mật khẩu.
