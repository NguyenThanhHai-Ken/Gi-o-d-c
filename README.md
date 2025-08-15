# Ứng dụng Toán 6–9 (MVP)

- React + Vite
- Hiển thị công thức bằng KaTeX
- Thi thử 15/45/90 phút (tự cấu hình)
- Cá nhân hóa: gợi ý chủ đề dựa trên độ chính xác
- Lưu tiến trình cục bộ; có sẵn hook kết nối Firebase (Auth + Firestore)

## Cách chạy
```bash
npm i
npm run dev
```

## Kết nối Firebase
Tạo dự án Firebase, bật Authentication (Google) và Firestore. Tạo file `.env` sao chép từ `.env.example`.

```env
VITE_FB_API_KEY=...
VITE_FB_AUTH_DOMAIN=...
VITE_FB_PROJECT_ID=...
VITE_FB_STORAGE_BUCKET=...
VITE_FB_MESSAGING_SENDER_ID=...
VITE_FB_APP_ID=...
```

## Nhập nội dung Toán 6–9
Mở `src/data/catalog.json` và thêm theo cấu trúc:
```
classes[] -> subjects[] -> topics[] -> lessons[]
lesson: { id, title, theory(LaTeX), examples[], questions[] }
```

Mỗi `question` dạng MCQ:
```json
{ "level":"easy|medium|hard", "type":"mcq",
  "question":"...",
  "options":["A","B","C","D"],
  "answer": 1,               // chỉ số đáp án đúng
  "explain":"giải thích ngắn"
}
```


## Tính năng giáo viên & xuất báo cáo
- Trang giáo viên: `/teacher` (phải đăng nhập bằng tài khoản Google)
- Xuất lịch sử và thống kê theo chủ đề dưới dạng CSV (có thể mở bằng Excel).
- Giao bài (mẫu): API để tạo assignment được scaffold trong `utils/cloudStore.js`.


## Hoàn thiện E (A+B+C+D)
- **PDF -> JSON**: Sử dụng `pdf_importer.py` để tách văn bản từng trang từ PDF. Sau đó biên tập thành `catalog.json`.
- **Giao bài & Quản lý học sinh**: `createAssignment`, `listAssignments`, `submitAssignment` có sẵn trong `src/utils/cloudStore.js`. Hãy cấu hình **Firestore security rules** để phân quyền (giáo viên chỉ tạo assignment cho lớp mình, học sinh chỉ nộp cho assignment có lớp tương ứng).
- **Xuất .xlsx**: nếu muốn xuất file Excel đẹp, tải thư viện SheetJS (XLSX) trên client hoặc thêm dependency npm `xlsx` và import. Mã đã hỗ trợ fallback CSV.
- **Theme & Analytics**: Toggle theme lưu trong `localStorage`; analytics lưu cục bộ và có thể đẩy lên Firestore bằng `flushAnalytics`.

### Lưu ý bảo mật
- Firestore write operations hiện dựa trên client SDK; cần cấu hình security rules trước khi ra mắt.
- Không lưu thông tin nhạy cảm trong tài liệu công khai.


## Branding
- Logo and favicon added in `public_assets/` (blue theme). `logo.svg`, `favicon-512.png`, `favicon-32.png`.

## Deploy
- `vercel.json` included and GitHub Actions workflow at `.github/workflows/deploy.yml`.
- Add `VERCEL_TOKEN` to GitHub Secrets to enable automatic deploy.
