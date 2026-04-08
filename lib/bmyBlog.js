// 6 bài blog MVP "evergreen" của B'My — nội dung luôn có trên app,
// song song với trending feed được làm mới hằng ngày qua /api/refresh-trending.
//
// Mỗi bài có: slug, lang gốc là tiếng Việt. Cột useAutoTranslate sẽ lo dịch EN/ES.
// Ảnh Unsplash. Author cố định "B'My Kitchen".

export const BMY_BLOG_POSTS = [
  {
    slug: "cau-chuyen-banh-mi-viet",
    title: "Bánh mì Việt Nam: từ ổ bánh của người Pháp tới biểu tượng ẩm thực thế giới",
    excerpt:
      "Hành trình hơn 100 năm biến một ổ baguette Pháp thành một trong những món đường phố được yêu thích nhất hành tinh.",
    cover:
      "https://images.unsplash.com/photo-1600454866045-33a64cf0ae52?auto=format&fit=crop&w=1600&q=80",
    tags: ["Lịch sử", "Bánh mì", "Văn hoá"],
    readMin: 6,
    date: "2026-04-01",
    author: "B'My Kitchen",
    body: `## Một ổ bánh – hai nền văn hoá

Khi người Pháp mang baguette vào Sài Gòn đầu thế kỷ 20, không ai ngờ rằng người Việt sẽ biến nó thành một món ăn hoàn toàn khác: vỏ giòn tan, ruột rỗng xốp, kẹp nhân đầy màu sắc Á Đông. Đó là cuộc "tái cấu trúc" đầy tinh tế của một dân tộc vốn quen thổi hồn vào mọi thứ nguyên liệu.

## Điều làm bánh mì Việt khác biệt

Bánh mì Việt có tỉ lệ bột - nước rất cao, cộng với một lượng nhỏ bột gạo hoặc bột mì trắng nhẹ, tạo nên ruột bánh rỗng và vỏ mỏng đặc trưng – điều mà baguette Pháp truyền thống không có. Nhân bánh là cả một thế giới: pate béo ngậy, thịt nướng sả thơm lừng, đồ chua giòn tan, rau mùi tươi mát, chút xì dầu Maggi đậm đà, và không thể thiếu một chút ớt cay.

## Từ xe đẩy tới Michelin Guide

Ngày nay, Oxford English Dictionary đã ghi nhận chính thức từ "banh mi". Những quán như Banh Mi Phuong (Hội An) hay Banh Mi Huynh Hoa (Sài Gòn) trở thành điểm đến trong hành trình ẩm thực của du khách quốc tế. B'My mang tinh thần đó tới Madrid – không phải để "Pháp hoá" hay "Tây hoá", mà để giữ trọn vẹn hồn Việt trong từng ổ bánh.`,
  },
  {
    slug: "ca-phe-robusta-viet-nam",
    title: "Cà phê Robusta Việt Nam: vì sao ngon đậm hơn bạn tưởng",
    excerpt:
      "Robusta vốn bị xem là 'em út' của Arabica, nhưng người Việt đã biến nó thành một trường phái thưởng thức hoàn toàn riêng biệt.",
    cover:
      "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=1600&q=80",
    tags: ["Cà phê", "Văn hoá"],
    readMin: 5,
    date: "2026-04-02",
    author: "B'My Kitchen",
    body: `## Đất đỏ bazan Tây Nguyên

Việt Nam là nước xuất khẩu Robusta lớn nhất thế giới, và phần lớn đến từ vùng đất đỏ bazan của Đắk Lắk, Lâm Đồng, Gia Lai. Độ cao, ánh nắng và lượng mưa ở đây tạo nên những hạt Robusta đặc biệt đậm, hàm lượng caffein cao gấp đôi Arabica nhưng vị ngọt hậu nếu được rang đúng cách.

## Nghệ thuật pha phin

Không có máy espresso nào tái tạo được cảm giác chờ từng giọt cà phê nhỏ xuống chiếc ly trong suốt, từ từ hoà với lớp sữa đặc ở đáy. Kỹ thuật pha phin của người Việt đòi hỏi bột xay vừa phải, nước 92–95°C và lòng kiên nhẫn. Chỉ vậy thôi, mà vị cà phê Việt không thể trộn lẫn với bất cứ phong cách nào khác trên thế giới.

## B'My chọn gì cho ly cà phê của bạn

Chúng tôi nhập hạt Robusta Buôn Ma Thuột, rang nhẹ lửa kiểu Ý phối với chút bơ, giữ được vị mạnh mà không gắt. Sữa đặc được nhập trực tiếp từ nhà máy Vinamilk. Mỗi ly cà phê sữa đá ở B'My là một lời chào thân thuộc từ Tây Nguyên gửi tới Madrid.`,
  },
  {
    slug: "pho-bo-va-nhung-bi-mat",
    title: "Phở bò và 5 bí mật của một nồi nước dùng trong veo",
    excerpt:
      "Vì sao nồi phở của các bà, các cô Hà Nội luôn trong vắt, thơm nức mà không nồi phở nào ngoài nước làm lại được?",
    cover:
      "https://images.unsplash.com/photo-1583835746434-cf1534674b41?auto=format&fit=crop&w=1600&q=80",
    tags: ["Công thức", "Phở", "Kỹ thuật"],
    readMin: 7,
    date: "2026-04-03",
    author: "B'My Kitchen",
    body: `## Bí mật 1 – Chọn xương

Không phải chỉ xương ống. Một nồi phở ngon cần cả xương ống (cho ngọt), xương đuôi (cho dẻo), và một miếng bắp bò tươi (cho thơm). Tỉ lệ vàng là 2:1:1.

## Bí mật 2 – Chần rồi rửa

Bước bị nhiều người bỏ qua: chần xương trong nước sôi 5 phút, rồi rửa thật sạch bằng nước lạnh. Bước này loại hết máu bẩn và mùi hôi. Nước dùng sẽ trong ngay từ đầu thay vì phải vớt bọt suốt 3 tiếng.

## Bí mật 3 – Gia vị nướng

Hành tím, gừng – nướng trên lửa trực tiếp cho tới khi cháy xém, bỏ lớp ngoài rồi mới thả vào nồi. Hương khói từ việc nướng này là thứ không thể thay thế bằng gừng hành luộc.

## Bí mật 4 – Ninh nhỏ lửa

Nồi phở Hà Nội chuẩn ninh ở nhiệt độ 85–90°C, không để sôi bùng. Sôi bùng sẽ làm nước đục và vị xương chìm xuống đáy. 4–6 tiếng là tối thiểu; có nhà ninh tới 12 tiếng.

## Bí mật 5 – Tỉ lệ mắm:đường

Người Bắc thường nêm bằng nước mắm Phú Quốc loại ngon + chút đường phèn (không dùng đường cát). Đường phèn làm nước dùng có độ ngọt hậu thanh thoát. Bí quyết nhỏ này là thứ các bà các cô không nói cho bất cứ ai.`,
  },
  {
    slug: "5-mon-viet-de-nau-tai-nha",
    title: "5 món Việt dễ nấu tại căn bếp châu Âu của bạn",
    excerpt:
      "Không cần nguyên liệu khó tìm, không cần kỹ thuật khó. 5 món này bạn có thể làm ngay với siêu thị Mercadona hoặc Carrefour.",
    cover:
      "https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?auto=format&fit=crop&w=1600&q=80",
    tags: ["Công thức", "Người Việt xa nhà"],
    readMin: 6,
    date: "2026-04-04",
    author: "B'My Kitchen",
    body: `## 1. Gỏi cuốn tôm thịt

Tất cả những gì bạn cần có tại Mercadona: bún (rice vermicelli ở quầy Á châu), bánh tráng, tôm đông lạnh, thịt ba chỉ, rau xà lách và mùi tây thay cho rau răm. Cuốn 10 phút là có bữa sáng mát lành.

## 2. Thịt kho nước dừa

Nước dừa Cocoloco ở Mercadona thay cho nước dừa tươi. Thịt ba chỉ cắt vuông, kho 1 tiếng với nước mắm + chút đường caramel. Phần nước kho dùng ăn với cơm cả tuần.

## 3. Cơm chiên dương châu phiên bản Tây

Dùng cơm nguội, xúc xích Iberico thái hạt lựu thay lạp xưởng, thêm đậu hà lan đông lạnh và trứng. Chìa khoá: chảo phải nóng già trước khi cho cơm.

## 4. Canh chua kiểu châu Âu

Không có me? Dùng chanh vàng + cà chua chín + chút đường + nước mắm + cá hake. Đơn giản mà đủ vị chua-ngọt-cay-mặn đặc trưng.

## 5. Cà phê sữa đá kiểu "lười"

Không có phin? Pha espresso double + 2 thìa sữa đặc + đá. Không "xịn" bằng phin nhưng 80% vị Việt là đã tuyệt lắm rồi.`,
  },
  {
    slug: "vi-sao-am-thuc-viet-len-ngoi",
    title: "Vì sao ẩm thực Việt đang 'lên ngôi' ở châu Âu?",
    excerpt:
      "Từ Berlin tới Paris, Madrid tới Amsterdam – các quán Việt đang mọc lên khắp nơi. Có gì đằng sau làn sóng này?",
    cover:
      "https://images.unsplash.com/photo-1576577445504-6af96477db52?auto=format&fit=crop&w=1600&q=80",
    tags: ["Thị trường", "Văn hoá", "Xu hướng"],
    readMin: 8,
    date: "2026-04-05",
    author: "B'My Kitchen",
    body: `## Một làn sóng không ồn ào

Trong khi ẩm thực Thái, Trung, Nhật đã định vị mình ở châu Âu từ nhiều thập kỷ, ẩm thực Việt là làn sóng mới nhất – và cũng lặng lẽ nhất. Không cần nhiều marketing, các quán phở, bún bò, bánh mì cứ thế xuất hiện, nhanh chóng trở thành điểm hẹn cuối tuần của người bản xứ.

## Sức hấp dẫn: nhẹ, tươi, giàu rau

Xu hướng ăn uống ở châu Âu trong 5 năm qua rất rõ: ít dầu mỡ hơn, nhiều rau hơn, cân bằng protein thực vật. Ẩm thực Việt đánh trúng cả ba điểm này. Một tô phở có đạm, có tinh bột, có rau thơm tươi – và không hề nặng bụng.

## Giá hợp lý, trải nghiệm cao

Với 10–15€, thực khách châu Âu có thể có một bữa ăn hoàn chỉnh, lành mạnh và đậm đà – trong khi các lựa chọn fusion hay fine dining thường bắt đầu từ 25€. Đây là lý do ẩm thực Việt cực kỳ phù hợp với nhóm thực khách trẻ và gia đình.

## Cơ hội cho B'My tại Madrid

Madrid hiện có chưa đến 20 nhà hàng Việt "đúng chuẩn", trong khi nhu cầu tăng 40% mỗi năm (theo báo cáo ngành F&B Tây Ban Nha 2025). B'My sinh ra để phục vụ đúng thị trường này – không fusion, không lai, chỉ có Việt Nam thật sự.`,
  },
  {
    slug: "10-rau-thom-viet-nam",
    title: "10 loại rau thơm Việt và cách dùng đúng",
    excerpt:
      "Hiểu rau thơm là hiểu một nửa ẩm thực Việt. Đây là cẩm nang nhanh gọn cho người mới bắt đầu.",
    cover:
      "https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=1600&q=80",
    tags: ["Nguyên liệu", "Rau thơm"],
    readMin: 6,
    date: "2026-04-06",
    author: "B'My Kitchen",
    body: `## Vì sao rau thơm là linh hồn của ẩm thực Việt

Không nước nào trên thế giới dùng rau thơm nhiều như Việt Nam. Một đĩa gỏi cuốn có thể kèm 5–7 loại rau, và mỗi loại đóng một vai trò riêng biệt về mùi, vị, màu sắc.

## Danh sách 10 loại cần biết

1. **Húng quế (Thai basil)** – mùi hồi nhẹ, đi với phở và gỏi cuốn.
2. **Rau răm (Vietnamese coriander)** – cay nhẹ, không thể thiếu với trứng vịt lộn.
3. **Tía tô (Perilla)** – lá tím, thơm mát, đi với bún đậu mắm tôm.
4. **Kinh giới** – họ hàng với tía tô, đi với bún chả.
5. **Ngò gai (Culantro)** – hậu vị mạnh, thả vào tô phở.
6. **Ngò om (Rice paddy herb)** – vị chua nhẹ, đi với canh chua cá lóc.
7. **Mùi ta / ngò rí (Coriander)** – mùi tươi, rắc khắp nơi.
8. **Lá lốt (Wild betel)** – cuốn thịt bò nướng.
9. **Diếp cá (Fish mint)** – vị rất mạnh, dùng sống với cá kho.
10. **Sả (Lemongrass)** – nền tảng hương vị của gần như mọi món nướng Việt.

## Mẹo mua ở châu Âu

Tại Madrid, bạn có thể tìm ở Mercado de San Fernando (Lavapiés) hoặc các chợ Á châu ở Usera. Rau răm, kinh giới, lá lốt thường phải đặt trước. Sả và húng quế có sẵn quanh năm.`,
  },
];

export function getBmyBlogBySlug(slug) {
  return BMY_BLOG_POSTS.find((p) => p.slug === slug) || null;
}
