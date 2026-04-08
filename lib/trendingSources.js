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

export const TRENDING_SOURCES = [
  {
    id: "thekitchn",
    name: "The Kitchn",
    url: "https://www.thekitchn.com/main.rss",
    lang: "en",
    focus: "Home cooking, recipes, kitchen tips",
  },
  {
    id: "seriouseats",
    name: "Serious Eats",
    url: "https://www.seriouseats.com/feed.xml",
    lang: "en",
    focus: "Food science, technique, deep-dive recipes",
  },
  {
    id: "bonappetit",
    name: "Bon Appétit",
    url: "https://www.bonappetit.com/feed/rss",
    lang: "en",
    focus: "Trending recipes, food culture",
  },
  {
    id: "foodandwine",
    name: "Food & Wine",
    url: "https://www.foodandwine.com/feed",
    lang: "en",
    focus: "Global cuisine, wine pairings",
  },
  {
    id: "eater",
    name: "Eater",
    url: "https://www.eater.com/rss/index.xml",
    lang: "en",
    focus: "Restaurant industry, food trends",
  },
  {
    id: "cooky-vn",
    name: "Cooky.vn",
    url: "https://www.cooky.vn/rss",
    lang: "vi",
    focus: "Công thức Việt, ẩm thực gia đình",
  },
  {
    id: "monngonmoingay",
    name: "Món Ngon Mỗi Ngày",
    url: "https://monngonmoingay.com/feed/",
    lang: "vi",
    focus: "Món Việt truyền thống, video hướng dẫn",
  },
];

// Số bài lấy từ mỗi feed mỗi lần refresh
export const ITEMS_PER_SOURCE = 3;

// Tổng số bài trending được hiển thị trên /blog cùng lúc
export const MAX_TRENDING_ITEMS = 12;
