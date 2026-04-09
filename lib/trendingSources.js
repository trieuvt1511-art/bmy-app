// Các nguồn RSS ẩm thực quốc tế để B'My tự động fetch bài trending hằng ngày.
// Không scrape HTML (dễ vỡ, vi phạm TOS) — chỉ đọc RSS/JSON feed công khai.
//
// Danh sách được chọn theo tiêu chí:
//   1. Có feed RSS ổn định nhiều năm
//   2. Nội dung tập trung ẩm thực & ẩm thực châu Á
//   3. Giấy phép cho phép tóm tắt + link về bài gốc
//
// /api/refresh-trending sẽ pull tất cả feed, lấy N bài mới nhất,
// dùng Groq Llama 3.3 để viết lại tóm tắt tiếng Việt (không copy nguyên văn),
// và lưu vào data/trending.json để trang /blog hiển thị.

// Danh sách 5 nguồn ổn định đã được verify trực tiếp từ Vercel runtime:
//   thekitchn, bonappetit, eater  → 3 nguồn tiếng Anh
//   afamily-amthuc, kenh14-anquaydi → 2 nguồn tiếng Việt
//
// Các nguồn đã thử nhưng bị loại:
//   - seriouseats / foodandwine: Cloudflare trả 402 bất kể User-Agent
//   - vnexpress: không có feed am-thuc, /rss/am-thuc.rss redirect về homepage HTML
//   - monngonmoingay: response bị Vercel security filter redact (cookies trong XML)
//   - cooky.vn: /rss endpoint trả 404
export const TRENDING_SOURCES = [
  {
    id: "thekitchn",
    name: "The Kitchn",
    url: "https://www.thekitchn.com/main.rss",
    lang: "en",
    focus: "Home cooking, recipes, kitchen tips",
  },
  {
    id: "bonappetit",
    name: "Bon Appétit",
    url: "https://www.bonappetit.com/feed/rss",
    lang: "en",
    focus: "Trending recipes, food culture",
  },
  {
    id: "eater",
    name: "Eater",
    url: "https://www.eater.com/rss/index.xml",
    lang: "en",
    focus: "Restaurant industry, food trends",
  },
  {
    id: "afamily-amthuc",
    name: "AFamily Ẩm Thực",
    url: "https://afamily.vn/an-ngon.rss",
    lang: "vi",
    focus: "Món ngon gia đình, mẹo nấu ăn",
  },
  {
    id: "kenh14-anquaydi",
    name: "Kenh14 Ăn Quẩy Đi",
    url: "https://kenh14.vn/an-quay-di.rss",
    lang: "vi",
    focus: "Quán ngon, trải nghiệm đường phố, xu hướng ăn uống",
  },
];

// Số bài lấy từ mỗi feed mỗi lần refresh
export const ITEMS_PER_SOURCE = 3;

// Tổng số bài trending được hiển thị trên /blog cùng lúc
export const MAX_TRENDING_ITEMS = 12;
