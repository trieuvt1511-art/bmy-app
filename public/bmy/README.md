# B'My Mascot Assets

Thư mục này chứa các file hình mascot B'My (style Hergé / ligne claire).
Component `<Mascot />` sẽ tự động load các file PNG theo tên chuẩn dưới đây.
Nếu thiếu file nào, app sẽ fallback sang emoji tương ứng — không bị vỡ layout.

## 8 file cần lưu vào `/public/bmy/`

| Tên file               | Mô tả mascot                                         | Dùng ở đâu                           |
|------------------------|------------------------------------------------------|--------------------------------------|
| `mascot-leek.png`      | Ngồi ôm bó tỏi tây, nón len đỏ, áo xanh             | Empty state trang Shopping           |
| `mascot-herbs-blue.png`| Ngồi ôm rau thơm, mũ lưỡi trai xanh, áo đỏ         | Story section trang /bmy             |
| `mascot-herbs-red.png` | Ngồi ôm rau thơm, mũ lưỡi trai đỏ, áo xanh         | (dự phòng)                           |
| `mascot-study-red.png` | Cúi đọc sách + ly cà phê, nón len đỏ               | CTA trang /bmy                       |
| `mascot-study-blue.png`| Cúi đọc sách + ly cà phê, nón len xanh             | Empty state trang Favorites          |
| `mascot-skate-blue.png`| Ngồi xổm trên ván "Bánh mỳ Việt Nam", áo xanh      | Decorative trang /bmy (menu)         |
| `mascot-skate-red.png` | Ngồi xổm trên ván "Bánh mỳ Việt Nam", áo đỏ        | Decorative trang /bmy (menu)         |
| `mascot-skate-jump.png`| Bay trượt ván cầm túi giấy, nón đỏ, áo vàng        | Hero B'My + BMyPromo (trang chủ)     |

## Hướng dẫn chuẩn bị file

1. **Format**: PNG nền trong suốt (transparent). Nếu nền trắng thì cần xoá nền trước.
2. **Kích thước gợi ý**: 1024×1024 hoặc 800×800 — vuông, để mascot nằm gọn giữa.
3. **Tối ưu**: nên nén qua https://tinypng.com hoặc `squoosh.app` để mỗi file dưới ~200 KB.
4. **Lưu đúng tên**: tên file phân biệt hoa thường, dùng dấu gạch nối `-`, không dấu cách.

## Cách dùng trong code

```jsx
import Mascot from "@/components/Mascot";

// Mặc định: skate-jump size 160
<Mascot />

// Chỉ định variant + kích thước
<Mascot name="herbs-blue" size={200} />

// Thêm hiệu ứng bay bổng
<Mascot name="skate-jump" size={280} floating />

// Hoặc dùng class Tailwind cho các animation khác
<Mascot name="leek" size={160} className="animate-wiggle" />
```

## Các animation có sẵn

- `animate-float` — bay lên xuống nhẹ nhàng (4s) — dùng prop `floating`
- `animate-wiggle` — lắc qua lại nhẹ (2.5s)
- `animate-bounce-slow` — nhún lên xuống (3s)

## Fallback

Nếu mascot PNG chưa có, component tự hiện emoji:

- `leek` → 🥬
- `herbs-blue` → 🌿
- `herbs-red` → 🌱
- `study-red` → 📚
- `study-blue` → 🥤
- `skate-blue`, `skate-red` → 🛹
- `skate-jump` → 🤸
