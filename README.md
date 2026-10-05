# AstraMind — Frontend MVP Demo

## Chạy website
Chỉ cần mở `index.html` bằng trình duyệt.

## Có gì trong demo?
- Landing page theo concept AstraMind
- Responsive desktop/mobile
- Tạo hồ sơ người dùng
- Dashboard 3 hệ thống
- Màn hình Bản đồ sao
- Màn hình Tử vi 12 cung
- Màn hình Thần số học
- AI Chat demo có ngữ cảnh
- Pricing
- Privacy Center
- Export dữ liệu JSON
- Lưu profile bằng localStorage

## Lưu ý
Các kết quả Tử vi/Bản đồ sao trong frontend hiện là dữ liệu minh hoạ. Không nên dùng demo này để cung cấp kết quả chiêm tinh thực tế.

## Hướng tích hợp production
Frontend có thể chuyển sang Next.js + TypeScript + Tailwind.
Backend:
- Supabase Auth/PostgreSQL
- Calculation Engine: Swiss Ephemeris + module tử vi + numerology
- AI API + RAG knowledge base
- Payment: VNPay/MoMo/Stripe
- Vercel + service riêng cho calculation engine
