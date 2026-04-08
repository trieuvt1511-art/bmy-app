// 24 công thức Việt Nam — curate thủ công từ Cooky.vn, MónNgonMỗiNgày, TheKitchn
// Mỗi record khớp schema TheMealDB để reuse component RecipeCard + trang chi tiết.
// Ảnh dùng Unsplash (miễn phí), có thể thay bằng ảnh thật của B'My sau.
//
// Nguồn tham khảo:
// - https://www.cooky.vn/cong-thuc
// - https://monngonmoingay.com/
// - https://www.thekitchn.com/shrimp-fried-rice-266999
//
// Format: giữ nguyên key theo TheMealDB (idMeal, strMeal, strMealThumb, strCategory,
// strArea, strInstructions, strIngredientN, strMeasureN, strYoutube, strSource)
// kèm trường mở rộng: slug, strMealVi, strInstructionsVi, timeMin, difficulty, isBmy

const img = (q) =>
  `https://images.unsplash.com/${q}?auto=format&fit=crop&w=1200&q=80`;

function make(idx, data) {
  const base = {
    idMeal: `bmy-${String(idx).padStart(3, "0")}`,
    strArea: "Vietnamese",
    strTags: "Vietnamese,BMy",
    strYoutube: "",
    strSource: data.source || "https://cooky.vn",
    isBmy: true,
    ...data,
  };
  // expand ingredients/measures to TheMealDB's 20-slot shape
  for (let i = 1; i <= 20; i++) {
    base[`strIngredient${i}`] = data.ingredients?.[i - 1]?.name || "";
    base[`strMeasure${i}`] = data.ingredients?.[i - 1]?.measure || "";
  }
  return base;
}

export const BMY_RECIPES = [
  // ───────── 12 MÓN SIGNATURE ─────────
  make(1, {
    slug: "pho-bo-ha-noi",
    strMeal: "Hanoi Beef Pho",
    strMealVi: "Phở Bò Hà Nội",
    strCategory: "Soup",
    strMealThumb: img("photo-1583835746434-cf1534674b41"),
    timeMin: 180,
    difficulty: "hard",
    region: "Bắc",
    strInstructions:
      "1. Blanch beef bones in boiling water 5 min, rinse clean.\n2. Roast ginger and shallot over open flame until charred.\n3. Simmer bones with roasted aromatics, star anise, cinnamon, cardamom, cloves, fennel for 4–6 hours. Skim foam.\n4. Season broth with fish sauce, rock sugar, salt.\n5. Blanch rice noodles 10 s in boiling water, drain into bowl.\n6. Lay thin-sliced raw beef on noodles, ladle boiling broth on top to cook beef instantly.\n7. Top with spring onion, coriander, Thai basil, lime, chili.",
    strInstructionsVi:
      "1. Trụng xương bò nước sôi 5 phút, rửa sạch bọt bẩn.\n2. Nướng gừng và hành tím trên lửa cho cháy xém, cạo sạch.\n3. Ninh xương cùng gừng hành nướng, hoa hồi, quế, thảo quả, đinh hương, tiểu hồi trong 4–6 tiếng. Vớt bọt liên tục.\n4. Nêm nước dùng bằng nước mắm, đường phèn, muối cho vừa miệng.\n5. Trụng bánh phở 10 giây cho nóng, cho vào tô.\n6. Xếp thịt bò tái thái mỏng lên trên, chan nước dùng sôi già để thịt chín tới.\n7. Rắc hành lá, ngò, húng quế, vắt chanh, ớt.",
    ingredients: [
      { name: "Beef bones", measure: "1.5 kg" },
      { name: "Beef brisket", measure: "500 g" },
      { name: "Rice noodles (bánh phở)", measure: "500 g" },
      { name: "Ginger", measure: "1 large piece" },
      { name: "Shallot", measure: "3 bulbs" },
      { name: "Star anise", measure: "4 pieces" },
      { name: "Cinnamon stick", measure: "1" },
      { name: "Cardamom", measure: "2 pods" },
      { name: "Fish sauce", measure: "3 tbsp" },
      { name: "Rock sugar", measure: "1 tbsp" },
      { name: "Spring onion", measure: "4 stalks" },
      { name: "Thai basil", measure: "1 bunch" },
      { name: "Lime", measure: "2" },
    ],
    source: "https://monngonmoingay.com/pho-bo-ha-noi",
  }),
  make(2, {
    slug: "banh-mi-thit-nuong",
    strMeal: "Grilled Pork Banh Mi",
    strMealVi: "Bánh Mì Thịt Nướng",
    strCategory: "Street Food",
    strMealThumb: img("photo-1600454866045-33a64cf0ae52"),
    timeMin: 45,
    difficulty: "medium",
    region: "Nam",
    strInstructions:
      "1. Marinate thin-sliced pork with lemongrass, garlic, fish sauce, sugar, oyster sauce, honey for 30 min.\n2. Grill pork over charcoal until caramelized edges.\n3. Pickle carrot and daikon in vinegar+sugar for 15 min.\n4. Split baguette, toast briefly.\n5. Spread pâté and mayo inside. Stack cucumber, pickles, pork, coriander, sliced chili.\n6. Drizzle Maggi seasoning, close and serve hot.",
    strInstructionsVi:
      "1. Ướp thịt heo thái mỏng với sả băm, tỏi, nước mắm, đường, dầu hào, mật ong trong 30 phút.\n2. Nướng thịt trên than hoa cho xém cạnh.\n3. Ngâm chua cà rốt và củ cải trắng với giấm + đường trong 15 phút.\n4. Bổ đôi bánh mì, nướng lại cho giòn.\n5. Phết pa-tê và mayonnaise, xếp dưa leo, đồ chua, thịt nướng, ngò, ớt thái lát.\n6. Rưới chút xì dầu Maggi, kẹp lại và dùng nóng.",
    ingredients: [
      { name: "Pork shoulder", measure: "500 g" },
      { name: "Baguette (Vietnamese)", measure: "4" },
      { name: "Pâté", measure: "4 tbsp" },
      { name: "Mayonnaise", measure: "4 tbsp" },
      { name: "Carrot", measure: "1" },
      { name: "Daikon", measure: "1 small" },
      { name: "Lemongrass", measure: "3 stalks" },
      { name: "Garlic", measure: "4 cloves" },
      { name: "Fish sauce", measure: "2 tbsp" },
      { name: "Honey", measure: "1 tbsp" },
      { name: "Coriander", measure: "1 bunch" },
      { name: "Cucumber", measure: "1" },
      { name: "Maggi seasoning", measure: "1 tsp" },
    ],
    source: "https://cooky.vn/cong-thuc/banh-mi-thit-nuong",
  }),
  make(3, {
    slug: "bun-cha-ha-noi",
    strMeal: "Bun Cha (Hanoi grilled pork noodles)",
    strMealVi: "Bún Chả Hà Nội",
    strCategory: "Noodles",
    strMealThumb: img("photo-1569058242253-92a9c755a0ec"),
    timeMin: 60,
    difficulty: "medium",
    region: "Bắc",
    strInstructions:
      "1. Mince pork belly, shape into small patties.\n2. Marinate patties + thin-sliced pork belly with shallot, garlic, fish sauce, honey, pepper for 30 min.\n3. Grill both cuts over charcoal until smoky.\n4. Make dipping sauce: warm water + sugar + fish sauce + lime + garlic + chili + pickled papaya+carrot.\n5. Serve with rice vermicelli and fresh herbs; dip noodles into warm sauce bowl with pork.",
    strInstructionsVi:
      "1. Băm nhỏ thịt ba chỉ, viên thành chả miếng nhỏ.\n2. Ướp chả viên + ba chỉ thái mỏng cùng hành tím băm, tỏi, nước mắm, mật ong, tiêu trong 30 phút.\n3. Nướng trên than hoa cho thơm, hơi xém.\n4. Pha nước chấm: nước ấm + đường + nước mắm + chanh + tỏi + ớt, thả đu đủ và cà rốt ngâm chua.\n5. Dọn cùng bún tươi và rau sống; chấm bún vào bát nước chấm ấm có thịt nướng.",
    ingredients: [
      { name: "Pork belly", measure: "500 g" },
      { name: "Minced pork", measure: "300 g" },
      { name: "Rice vermicelli (bún)", measure: "500 g" },
      { name: "Fish sauce", measure: "4 tbsp" },
      { name: "Honey", measure: "2 tbsp" },
      { name: "Garlic", measure: "5 cloves" },
      { name: "Shallot", measure: "3" },
      { name: "Lime", measure: "2" },
      { name: "Green papaya", measure: "1 cup, pickled" },
      { name: "Fresh herbs (lettuce, perilla, mint)", measure: "1 big bunch" },
    ],
    source: "https://monngonmoingay.com/bun-cha",
  }),
  make(4, {
    slug: "goi-cuon-tom-thit",
    strMeal: "Fresh Shrimp Spring Rolls",
    strMealVi: "Gỏi Cuốn Tôm Thịt",
    strCategory: "Appetizer",
    strMealThumb: img("photo-1553701275-1d2118f4adb1"),
    timeMin: 30,
    difficulty: "easy",
    region: "Nam",
    strInstructions:
      "1. Boil shrimp 2 min, peel, slice lengthwise.\n2. Boil pork belly 20 min, cool, slice thin.\n3. Cook rice vermicelli; rinse under cold water.\n4. Soften rice paper with warm water on damp cloth.\n5. Layer lettuce, vermicelli, pork, herbs and 2 shrimp halves. Roll tight.\n6. Serve with hoisin-peanut sauce or fish sauce dip.",
    strInstructionsVi:
      "1. Luộc tôm 2 phút, bóc vỏ, chẻ đôi.\n2. Luộc thịt ba chỉ 20 phút, để nguội, thái mỏng.\n3. Trụng bún tươi, xả nước lạnh.\n4. Nhúng bánh tráng qua nước ấm, đặt lên khăn ẩm.\n5. Xếp xà lách, bún, thịt, rau thơm và 2 nửa tôm. Cuốn chặt tay.\n6. Dùng kèm tương đậu phộng hoặc nước mắm chua ngọt.",
    ingredients: [
      { name: "Rice paper", measure: "12 sheets" },
      { name: "Shrimp", measure: "300 g" },
      { name: "Pork belly", measure: "200 g" },
      { name: "Rice vermicelli", measure: "150 g" },
      { name: "Lettuce", measure: "1 head" },
      { name: "Mint", measure: "1 bunch" },
      { name: "Coriander", measure: "1 bunch" },
      { name: "Hoisin sauce", measure: "4 tbsp" },
      { name: "Peanut butter", measure: "2 tbsp" },
    ],
    source: "https://cooky.vn/cong-thuc/goi-cuon",
  }),
  make(5, {
    slug: "com-tam-suon-nuong",
    strMeal: "Broken Rice with Grilled Pork Chop",
    strMealVi: "Cơm Tấm Sườn Nướng",
    strCategory: "Rice",
    strMealThumb: img("photo-1626057196810-bd47f28f2afe"),
    timeMin: 60,
    difficulty: "medium",
    region: "Nam",
    strInstructions:
      "1. Marinate pork chops with lemongrass, garlic, shallot, fish sauce, honey, oyster sauce overnight.\n2. Grill chops until caramelized, brush with reserved marinade.\n3. Cook broken rice (steam slightly softer than normal).\n4. Fry egg sunny-side up.\n5. Plate rice with grilled chop, fried egg, pickled veggies, spring onion oil. Serve with nước mắm chấm.",
    strInstructionsVi:
      "1. Ướp sườn cốt-lết với sả, tỏi, hành tím, nước mắm, mật ong, dầu hào để qua đêm.\n2. Nướng sườn trên than cho vàng, phết nước ướp.\n3. Nấu cơm tấm (thêm nước để cơm mềm hơn bình thường).\n4. Chiên trứng ốp la.\n5. Trình bày cơm với sườn nướng, trứng, đồ chua, mỡ hành. Dùng kèm nước mắm chấm.",
    ingredients: [
      { name: "Broken rice", measure: "400 g" },
      { name: "Pork chops", measure: "4 pieces" },
      { name: "Lemongrass", measure: "3 stalks" },
      { name: "Garlic", measure: "5 cloves" },
      { name: "Honey", measure: "2 tbsp" },
      { name: "Fish sauce", measure: "3 tbsp" },
      { name: "Eggs", measure: "4" },
      { name: "Spring onion", measure: "4 stalks" },
      { name: "Pickled veggies", measure: "1 cup" },
    ],
    source: "https://monngonmoingay.com/com-tam",
  }),
  make(6, {
    slug: "bun-bo-hue",
    strMeal: "Bun Bo Hue (spicy beef noodle)",
    strMealVi: "Bún Bò Huế",
    strCategory: "Soup",
    strMealThumb: img("photo-1576577445504-6af96477db52"),
    timeMin: 180,
    difficulty: "hard",
    region: "Trung",
    strInstructions:
      "1. Simmer beef bones, pork hock, beef shank with lemongrass bundle, shallot, ginger for 3 hours.\n2. Stir-fry shallot + garlic + annatto seeds in oil, strain. Bloom chili paste + shrimp paste.\n3. Add aromatic chili oil to broth. Season with fish sauce and sugar.\n4. Cook thick rice noodles.\n5. Serve with slices of beef shank, pork hock, pork blood cube, chả Huế, lime, herbs, bean sprouts.",
    strInstructionsVi:
      "1. Ninh xương bò, móng heo, bắp bò với bó sả, hành tím, gừng trong 3 tiếng.\n2. Phi hành tỏi với hạt điều đỏ, lọc lấy dầu màu. Phi mắm ruốc với sả ớt.\n3. Cho dầu điều và ruốc vào nồi nước dùng. Nêm nước mắm, đường.\n4. Trụng bún sợi to.\n5. Múc ra tô với bắp bò, móng heo, huyết, chả Huế, rau sống, giá, chanh, ớt.",
    ingredients: [
      { name: "Beef shank", measure: "700 g" },
      { name: "Pork hock", measure: "500 g" },
      { name: "Thick rice noodles", measure: "500 g" },
      { name: "Lemongrass", measure: "6 stalks" },
      { name: "Shrimp paste (mắm ruốc)", measure: "3 tbsp" },
      { name: "Annatto seeds", measure: "2 tbsp" },
      { name: "Chili paste", measure: "2 tbsp" },
      { name: "Fish sauce", measure: "4 tbsp" },
      { name: "Bean sprouts", measure: "300 g" },
    ],
    source: "https://monngonmoingay.com/bun-bo-hue",
  }),
  make(7, {
    slug: "ca-kho-to",
    strMeal: "Caramelized Fish in Clay Pot",
    strMealVi: "Cá Kho Tộ",
    strCategory: "Main",
    strMealThumb: img("photo-1607330289024-1535c6b4e1c1"),
    timeMin: 60,
    difficulty: "medium",
    region: "Nam",
    strInstructions:
      "1. Make caramel: melt sugar in pan until amber, add hot water.\n2. In clay pot, layer fish steaks, shallot, garlic, chili, ginger.\n3. Pour caramel, fish sauce, a splash of coconut water. Bring to boil then simmer 40 min until sauce thickens.\n4. Drizzle cooking oil and cracked pepper. Serve with rice.",
    strInstructionsVi:
      "1. Thắng nước màu: đun đường tới màu cánh gián, đổ nước nóng.\n2. Xếp cá đã làm sạch vào thố đất cùng hành tím, tỏi, ớt, gừng.\n3. Rưới nước màu, nước mắm, chút nước dừa. Đun sôi rồi hạ lửa kho 40 phút tới khi nước sánh lại.\n4. Rưới dầu ăn và rắc tiêu. Dùng với cơm nóng.",
    ingredients: [
      { name: "Catfish steaks", measure: "600 g" },
      { name: "Sugar", measure: "3 tbsp" },
      { name: "Fish sauce", measure: "3 tbsp" },
      { name: "Coconut water", measure: "200 ml" },
      { name: "Shallot", measure: "3" },
      { name: "Garlic", measure: "4 cloves" },
      { name: "Chili", measure: "2" },
      { name: "Black pepper", measure: "1 tsp" },
    ],
    source: "https://monngonmoingay.com/ca-kho-to",
  }),
  make(8, {
    slug: "banh-xeo-mien-trung",
    strMeal: "Sizzling Crepe (Banh Xeo)",
    strMealVi: "Bánh Xèo Miền Trung",
    strCategory: "Street Food",
    strMealThumb: img("photo-1562158074-62f5bde27c90"),
    timeMin: 60,
    difficulty: "medium",
    region: "Trung",
    strInstructions:
      "1. Mix batter: rice flour, turmeric, coconut milk, water, spring onion. Rest 20 min.\n2. Heat pan, sauté pork slices and shrimp.\n3. Ladle batter, swirl to coat. Add bean sprouts. Cover 2 min.\n4. Fold in half and slide out crispy.\n5. Wrap in lettuce + herbs, dip in fish sauce.",
    strInstructionsVi:
      "1. Pha bột: bột gạo, nghệ, nước cốt dừa, nước, hành lá. Nghỉ 20 phút.\n2. Làm nóng chảo, xào sơ thịt ba chỉ và tôm.\n3. Đổ bột, xoay chảo cho bột dàn mỏng. Thêm giá. Đậy nắp 2 phút.\n4. Gấp đôi bánh lại và lấy ra khi vỏ giòn.\n5. Cuốn với rau sống, chấm nước mắm chua ngọt.",
    ingredients: [
      { name: "Rice flour", measure: "300 g" },
      { name: "Turmeric powder", measure: "1 tsp" },
      { name: "Coconut milk", measure: "200 ml" },
      { name: "Pork belly", measure: "200 g" },
      { name: "Shrimp", measure: "200 g" },
      { name: "Bean sprouts", measure: "200 g" },
      { name: "Spring onion", measure: "4 stalks" },
      { name: "Lettuce + herbs", measure: "1 big bunch" },
    ],
    source: "https://cooky.vn/cong-thuc/banh-xeo",
  }),
  make(9, {
    slug: "ca-phe-trung",
    strMeal: "Hanoi Egg Coffee",
    strMealVi: "Cà Phê Trứng",
    strCategory: "Drink",
    strMealThumb: img("photo-1511920170033-f8396924c348"),
    timeMin: 10,
    difficulty: "easy",
    region: "Bắc",
    strInstructions:
      "1. Brew strong Vietnamese filter coffee (phin).\n2. Whisk egg yolk + condensed milk + a drop of vanilla until pale and fluffy.\n3. Pour hot coffee into cup, spoon the egg foam on top.\n4. Serve with hot water bath underneath to keep warm.",
    strInstructionsVi:
      "1. Pha phin cà phê Việt đậm đặc.\n2. Đánh lòng đỏ trứng + sữa đặc + 1 giọt vani cho bông mịn, màu vàng nhạt.\n3. Rót cà phê nóng ra ly, đặt lớp trứng bông lên trên.\n4. Đặt ly vào bát nước nóng để giữ ấm khi thưởng thức.",
    ingredients: [
      { name: "Vietnamese robusta coffee", measure: "15 g" },
      { name: "Hot water", measure: "60 ml" },
      { name: "Egg yolk", measure: "1" },
      { name: "Condensed milk", measure: "2 tbsp" },
      { name: "Vanilla", measure: "1 drop" },
    ],
    source: "https://monngonmoingay.com/ca-phe-trung",
  }),
  make(10, {
    slug: "com-chien-tom",
    strMeal: "Shrimp Fried Rice",
    strMealVi: "Cơm Chiên Tôm",
    strCategory: "Rice",
    strMealThumb: img("photo-1603133872878-684f208fb84b"),
    timeMin: 25,
    difficulty: "easy",
    region: "Nam",
    strInstructions:
      "1. Use cold day-old jasmine rice (break up clumps).\n2. Heat oil high, scramble egg briefly, set aside.\n3. Stir-fry shrimp 1 min, remove.\n4. Sauté shallot + garlic, add diced carrot, peas, corn.\n5. Add rice, toss aggressively 3 min. Season with fish sauce, light soy, pinch sugar, pepper.\n6. Return shrimp and egg, toss with spring onion. Finish with sesame oil.\n(Note: technique adapted from TheKitchn's shrimp fried rice guide — cold rice + hot pan = signature texture.)",
    strInstructionsVi:
      "1. Dùng cơm nguội để qua đêm, bóp tơi.\n2. Chảo nóng dầu, đảo trứng sơ, xúc ra.\n3. Xào tôm 1 phút, xúc ra.\n4. Phi hành tím + tỏi, thêm cà rốt, đậu hà lan, bắp hạt.\n5. Cho cơm vào, xào to lửa 3 phút. Nêm nước mắm, xì dầu, chút đường, tiêu.\n6. Trả tôm và trứng, thêm hành lá. Rưới dầu mè.\n(Kỹ thuật tham khảo bài 'Shrimp Fried Rice' của TheKitchn — cơm nguội + chảo nóng già là chìa khóa tạo kết cấu đặc trưng.)",
    ingredients: [
      { name: "Cold cooked rice", measure: "4 cups" },
      { name: "Shrimp", measure: "250 g" },
      { name: "Eggs", measure: "2" },
      { name: "Carrot", measure: "1 small, diced" },
      { name: "Peas", measure: "100 g" },
      { name: "Corn", measure: "100 g" },
      { name: "Garlic", measure: "3 cloves" },
      { name: "Shallot", measure: "2" },
      { name: "Fish sauce", measure: "1 tbsp" },
      { name: "Soy sauce", measure: "1 tbsp" },
      { name: "Spring onion", measure: "3 stalks" },
      { name: "Sesame oil", measure: "1 tsp" },
    ],
    source: "https://www.thekitchn.com/shrimp-fried-rice-266999",
  }),
  make(11, {
    slug: "canh-chua-ca-loc",
    strMeal: "Sour Tamarind Fish Soup",
    strMealVi: "Canh Chua Cá Lóc",
    strCategory: "Soup",
    strMealThumb: img("photo-1580476262798-bddd9f4b7369"),
    timeMin: 40,
    difficulty: "medium",
    region: "Nam",
    strInstructions:
      "1. Dissolve tamarind paste in hot water, strain.\n2. Sauté garlic in oil, add tomato wedges and pineapple chunks.\n3. Pour water + tamarind, bring to boil. Add fish chunks and cook 7 min.\n4. Add bean sprouts, okra, taro stem. Season with fish sauce, sugar, chili.\n5. Finish with rice paddy herb (ngò om) and garlic oil.",
    strInstructionsVi:
      "1. Dầm me với nước nóng, lọc bỏ hạt.\n2. Phi tỏi, cho cà chua và dứa vào xào sơ.\n3. Đổ nước + nước me, đun sôi. Thả cá lóc nấu 7 phút.\n4. Thêm giá, đậu bắp, bạc hà. Nêm nước mắm, đường, ớt.\n5. Rắc ngò om và rưới tỏi phi thơm.",
    ingredients: [
      { name: "Snakehead fish", measure: "600 g" },
      { name: "Tamarind paste", measure: "3 tbsp" },
      { name: "Tomato", measure: "2" },
      { name: "Pineapple", measure: "1/2" },
      { name: "Bean sprouts", measure: "200 g" },
      { name: "Okra", measure: "6" },
      { name: "Taro stem (bạc hà)", measure: "2 stalks" },
      { name: "Rice paddy herb", measure: "1 bunch" },
    ],
    source: "https://monngonmoingay.com/canh-chua-ca-loc",
  }),
  make(12, {
    slug: "che-ba-mau",
    strMeal: "Three-Color Sweet Dessert",
    strMealVi: "Chè Ba Màu",
    strCategory: "Dessert",
    strMealThumb: img("photo-1563379091339-03b21ab4a4f8"),
    timeMin: 60,
    difficulty: "easy",
    region: "Nam",
    strInstructions:
      "1. Soak mung beans and red beans separately overnight. Cook with sugar until tender.\n2. Make pandan jelly: agar + pandan extract + sugar, set, cut into cubes.\n3. Warm coconut cream with pinch of salt and a bit of sugar.\n4. In tall glass layer: red beans → mung beans → pandan jelly. Top with crushed ice and coconut cream.",
    strInstructionsVi:
      "1. Ngâm đậu xanh và đậu đỏ riêng qua đêm. Nấu với đường tới khi mềm.\n2. Làm thạch lá dứa: bột rau câu + nước cốt lá dứa + đường, để đông, cắt hạt lựu.\n3. Nấu nước cốt dừa với chút muối và đường cho hơi đặc.\n4. Xếp vào ly cao: đậu đỏ → đậu xanh → thạch lá dứa. Thêm đá bào và nước cốt dừa lên trên.",
    ingredients: [
      { name: "Red beans", measure: "150 g" },
      { name: "Mung beans (peeled)", measure: "150 g" },
      { name: "Agar powder", measure: "10 g" },
      { name: "Pandan extract", measure: "3 tbsp" },
      { name: "Coconut cream", measure: "400 ml" },
      { name: "Sugar", measure: "200 g" },
      { name: "Crushed ice", measure: "as needed" },
    ],
    source: "https://cooky.vn/cong-thuc/che-ba-mau",
  }),

  // ───────── 12 MÓN BỔ SUNG ─────────
  make(13, {
    slug: "bun-dau-mam-tom",
    strMeal: "Bun Dau Mam Tom",
    strMealVi: "Bún Đậu Mắm Tôm",
    strCategory: "Street Food",
    strMealThumb: img("photo-1625938144755-652e08e359b7"),
    timeMin: 50,
    difficulty: "medium",
    region: "Bắc",
    strInstructions:
      "1. Fry tofu cubes until crispy and golden.\n2. Boil and slice pork belly.\n3. Whip shrimp paste (mắm tôm) with lime juice, sugar, chili, a splash of hot oil until foamy.\n4. Serve vermicelli squares with tofu, pork, chả cốm, herbs and the shrimp paste dip.",
    strInstructionsVi:
      "1. Chiên đậu phụ ngập dầu tới khi vàng giòn.\n2. Luộc thịt ba chỉ, thái miếng.\n3. Đánh mắm tôm với chanh, đường, ớt và chút dầu nóng cho sủi bọt.\n4. Dọn bún lá với đậu chiên, thịt luộc, chả cốm, rau sống và mắm tôm.",
    ingredients: [
      { name: "Firm tofu", measure: "400 g" },
      { name: "Pork belly", measure: "400 g" },
      { name: "Shrimp paste", measure: "3 tbsp" },
      { name: "Lime", measure: "2" },
      { name: "Bún lá", measure: "500 g" },
      { name: "Perilla leaves", measure: "1 bunch" },
    ],
    source: "https://cooky.vn/cong-thuc/bun-dau-mam-tom",
  }),
  make(14, {
    slug: "banh-cuon-thanh-tri",
    strMeal: "Steamed Rice Rolls (Banh Cuon)",
    strMealVi: "Bánh Cuốn Thanh Trì",
    strCategory: "Breakfast",
    strMealThumb: img("photo-1595854341625-f33ee10dbf94"),
    timeMin: 60,
    difficulty: "hard",
    region: "Bắc",
    strInstructions:
      "1. Mix rice flour, tapioca starch, water, salt, oil. Rest 2 h.\n2. Stir-fry minced pork with wood-ear mushroom and shallot.\n3. Steam a thin layer of batter on cloth, add filling, roll up.\n4. Top with crispy fried shallots, sliced chả and coriander. Serve with warm dipping sauce.",
    strInstructionsVi:
      "1. Pha bột gạo + bột năng + nước + muối + dầu ăn. Nghỉ 2 tiếng.\n2. Xào thịt băm với mộc nhĩ và hành tím.\n3. Hấp một lớp bột mỏng lên vải, cho nhân vào và cuộn lại.\n4. Rắc hành phi, chả lụa thái và ngò. Dùng với nước chấm ấm.",
    ingredients: [
      { name: "Rice flour", measure: "300 g" },
      { name: "Tapioca starch", measure: "50 g" },
      { name: "Minced pork", measure: "250 g" },
      { name: "Wood-ear mushroom", measure: "20 g dried" },
      { name: "Fried shallots", measure: "3 tbsp" },
      { name: "Chả lụa", measure: "200 g" },
    ],
    source: "https://monngonmoingay.com/banh-cuon",
  }),
  make(15, {
    slug: "mi-quang",
    strMeal: "Quang-Style Turmeric Noodles",
    strMealVi: "Mì Quảng",
    strCategory: "Noodles",
    strMealThumb: img("photo-1604908176997-125f25cc6f3d"),
    timeMin: 60,
    difficulty: "medium",
    region: "Trung",
    strInstructions:
      "1. Simmer pork ribs and shrimp broth with annatto oil, fish sauce.\n2. Cook turmeric noodles.\n3. Plate noodles with shallow broth, top with ribs, shrimp, quail egg.\n4. Garnish with peanuts, sesame cracker, fresh herbs, lime, chili.",
    strInstructionsVi:
      "1. Ninh sườn heo và tôm lấy nước dùng, nêm dầu điều, nước mắm.\n2. Trụng mì Quảng sợi vàng.\n3. Xếp mì ra tô chan ít nước, xếp sườn, tôm, trứng cút.\n4. Rắc đậu phộng, bánh tráng nướng, rau sống, chanh ớt.",
    ingredients: [
      { name: "Turmeric rice noodles", measure: "500 g" },
      { name: "Pork ribs", measure: "500 g" },
      { name: "Shrimp", measure: "250 g" },
      { name: "Quail eggs", measure: "12" },
      { name: "Peanuts", measure: "100 g" },
      { name: "Rice cracker", measure: "4" },
      { name: "Annatto oil", measure: "2 tbsp" },
    ],
    source: "https://monngonmoingay.com/mi-quang",
  }),
  make(16, {
    slug: "cao-lau",
    strMeal: "Cao Lau (Hoi An noodles)",
    strMealVi: "Cao Lầu Hội An",
    strCategory: "Noodles",
    strMealThumb: img("photo-1617093727343-374698b1b08d"),
    timeMin: 90,
    difficulty: "hard",
    region: "Trung",
    strInstructions:
      "1. Braise pork (char siu style) with soy sauce, five spice, sugar.\n2. Slice pork thin, reserve braising liquid.\n3. Blanch cao lầu noodles, mix with tiny amount of braising sauce.\n4. Plate noodles, top with pork, crispy cao lầu crackers, bean sprouts, herbs. Drizzle extra sauce.",
    strInstructionsVi:
      "1. Rim thịt heo xá xíu với xì dầu, ngũ vị hương, đường.\n2. Thái mỏng, giữ nước rim.\n3. Trụng sợi cao lầu, trộn với một chút nước rim.\n4. Xếp mì, đặt thịt, bánh cao lầu giòn, giá, rau sống. Rưới thêm nước rim.",
    ingredients: [
      { name: "Cao lau noodles", measure: "500 g" },
      { name: "Pork shoulder", measure: "500 g" },
      { name: "Soy sauce", measure: "3 tbsp" },
      { name: "Five spice powder", measure: "1 tsp" },
      { name: "Sugar", measure: "2 tbsp" },
      { name: "Bean sprouts", measure: "200 g" },
      { name: "Herbs", measure: "1 bunch" },
    ],
    source: "https://cooky.vn/cong-thuc/cao-lau",
  }),
  make(17, {
    slug: "hu-tieu-nam-vang",
    strMeal: "Hu Tieu Nam Vang (Cambodian-style noodle soup)",
    strMealVi: "Hủ Tiếu Nam Vang",
    strCategory: "Soup",
    strMealThumb: img("photo-1569718212165-3a8278d5f624"),
    timeMin: 120,
    difficulty: "medium",
    region: "Nam",
    strInstructions:
      "1. Simmer pork bones with dried squid and daikon for clear, sweet broth.\n2. Prep toppings: sliced pork, shrimp, liver, minced pork, quail egg.\n3. Cook clear tapioca noodles.\n4. Assemble bowl: noodles, toppings, broth. Garnish with garlic chives, bean sprouts, fried garlic oil.",
    strInstructionsVi:
      "1. Ninh xương heo với mực khô và củ cải để có nước dùng trong, ngọt.\n2. Chuẩn bị topping: thịt nạc thái, tôm, gan, thịt băm, trứng cút.\n3. Trụng hủ tiếu dai.\n4. Xếp tô: hủ tiếu, topping, chan nước dùng. Rắc hẹ, giá, tỏi phi.",
    ingredients: [
      { name: "Pork bones", measure: "1 kg" },
      { name: "Dried squid", measure: "1" },
      { name: "Daikon", measure: "1" },
      { name: "Tapioca noodles", measure: "500 g" },
      { name: "Shrimp", measure: "200 g" },
      { name: "Pork liver", measure: "150 g" },
      { name: "Quail eggs", measure: "12" },
      { name: "Garlic chives", measure: "1 bunch" },
    ],
    source: "https://monngonmoingay.com/hu-tieu-nam-vang",
  }),
  make(18, {
    slug: "ga-kho-gung",
    strMeal: "Ginger Braised Chicken",
    strMealVi: "Gà Kho Gừng",
    strCategory: "Main",
    strMealThumb: img("photo-1598103442097-8b74394b95c6"),
    timeMin: 40,
    difficulty: "easy",
    region: "Bắc",
    strInstructions:
      "1. Marinate chicken chunks with fish sauce, sugar, pepper, shallot.\n2. Fry smashed ginger in oil until fragrant.\n3. Add chicken and caramel sauce, sear until color deepens.\n4. Add a splash of water, simmer 20 min until sauce glazes chicken.\n5. Finish with chili and green onion.",
    strInstructionsVi:
      "1. Ướp gà với nước mắm, đường, tiêu, hành tím.\n2. Phi gừng đập dập cho thơm.\n3. Cho gà và nước hàng vào rim cho lên màu.\n4. Thêm chút nước, kho 20 phút cho nước sốt sánh bám vào gà.\n5. Rắc ớt và hành lá.",
    ingredients: [
      { name: "Chicken thighs", measure: "800 g" },
      { name: "Ginger", measure: "1 large piece" },
      { name: "Fish sauce", measure: "3 tbsp" },
      { name: "Caramel sauce", measure: "2 tbsp" },
      { name: "Sugar", measure: "1 tbsp" },
      { name: "Chili", measure: "2" },
    ],
    source: "https://cooky.vn/cong-thuc/ga-kho-gung",
  }),
  make(19, {
    slug: "thit-kho-trung",
    strMeal: "Caramel Pork and Eggs",
    strMealVi: "Thịt Kho Trứng",
    strCategory: "Main",
    strMealThumb: img("photo-1504674900247-0877df9cc836"),
    timeMin: 90,
    difficulty: "easy",
    region: "Nam",
    strInstructions:
      "1. Blanch pork belly chunks, rinse.\n2. Caramelize sugar, add pork, fish sauce, shallot, black pepper. Toss to coat.\n3. Add coconut water to cover. Add hard-boiled eggs.\n4. Simmer gently 1 h until pork is tender and sauce glossy.",
    strInstructionsVi:
      "1. Chần thịt ba chỉ, rửa sạch.\n2. Thắng đường, cho thịt vào đảo cùng nước mắm, hành tím, tiêu đen.\n3. Chế nước dừa ngập thịt, cho trứng luộc.\n4. Kho nhỏ lửa 1 tiếng tới khi thịt mềm và nước kho sánh lại.",
    ingredients: [
      { name: "Pork belly", measure: "1 kg" },
      { name: "Hard-boiled eggs", measure: "6" },
      { name: "Coconut water", measure: "500 ml" },
      { name: "Fish sauce", measure: "4 tbsp" },
      { name: "Sugar", measure: "3 tbsp" },
      { name: "Shallot", measure: "3" },
    ],
    source: "https://monngonmoingay.com/thit-kho-trung",
  }),
  make(20, {
    slug: "nem-ran-cha-gio",
    strMeal: "Crispy Spring Rolls (Cha Gio)",
    strMealVi: "Nem Rán / Chả Giò",
    strCategory: "Appetizer",
    strMealThumb: img("photo-1606735584795-76c97b98c05e"),
    timeMin: 60,
    difficulty: "medium",
    region: "Bắc",
    strInstructions:
      "1. Mix filling: minced pork, shrimp, wood-ear, glass noodles, grated carrot, onion, egg, seasoning.\n2. Soften rice paper with sugar water for crisp shell.\n3. Roll tight into finger-length pieces.\n4. Fry twice: first at 150°C to set, second at 180°C for crispy golden crust.\n5. Serve with fish sauce dip and herbs.",
    strInstructionsVi:
      "1. Trộn nhân: thịt băm, tôm, mộc nhĩ, miến, cà rốt bào, hành tây, trứng, gia vị.\n2. Thấm bánh tráng bằng nước đường cho vỏ giòn.\n3. Cuộn chặt từng cái cỡ ngón tay.\n4. Chiên 2 lần: 150°C cho nhân chín, sau đó 180°C cho vỏ vàng giòn.\n5. Dùng kèm nước mắm chua ngọt và rau sống.",
    ingredients: [
      { name: "Rice paper", measure: "20 sheets" },
      { name: "Minced pork", measure: "400 g" },
      { name: "Shrimp", measure: "200 g" },
      { name: "Wood-ear mushroom", measure: "30 g dried" },
      { name: "Glass noodles", measure: "50 g" },
      { name: "Carrot", measure: "1" },
      { name: "Onion", measure: "1" },
      { name: "Egg", measure: "1" },
    ],
    source: "https://cooky.vn/cong-thuc/nem-ran",
  }),
  make(21, {
    slug: "sua-chua-nep-cam",
    strMeal: "Yogurt with Black Sticky Rice",
    strMealVi: "Sữa Chua Nếp Cẩm",
    strCategory: "Dessert",
    strMealThumb: img("photo-1488477181946-6428a0291777"),
    timeMin: 40,
    difficulty: "easy",
    region: "Bắc",
    strInstructions:
      "1. Soak black sticky rice 4 h. Simmer with water until tender.\n2. Add sugar and a splash of coconut cream, stir until glossy.\n3. Cool. Spoon into glass and top with homemade yogurt.",
    strInstructionsVi:
      "1. Ngâm nếp cẩm 4 tiếng, nấu với nước cho mềm.\n2. Thêm đường và chút nước cốt dừa, đảo đều tới khi sánh.\n3. Để nguội, múc vào ly và phủ sữa chua lên trên.",
    ingredients: [
      { name: "Black sticky rice", measure: "200 g" },
      { name: "Sugar", measure: "80 g" },
      { name: "Coconut cream", measure: "100 ml" },
      { name: "Homemade yogurt", measure: "4 cups" },
    ],
    source: "https://monngonmoingay.com/sua-chua-nep-cam",
  }),
  make(22, {
    slug: "tra-dao-cam-sa",
    strMeal: "Peach Lemongrass Iced Tea",
    strMealVi: "Trà Đào Cam Sả",
    strCategory: "Drink",
    strMealThumb: img("photo-1556679343-c7306c1976bc"),
    timeMin: 15,
    difficulty: "easy",
    region: "Nam",
    strInstructions:
      "1. Steep black tea with crushed lemongrass 5 min. Strain.\n2. Dissolve sugar in hot tea.\n3. Add orange juice and peach syrup.\n4. Pour into ice-filled glass, garnish with sliced peach and fresh lemongrass.",
    strInstructionsVi:
      "1. Hãm trà đen với sả đập dập 5 phút, lọc.\n2. Hoà tan đường khi trà còn nóng.\n3. Thêm nước cam và siro đào.\n4. Rót vào ly đá, trang trí miếng đào và sả tươi.",
    ingredients: [
      { name: "Black tea", measure: "5 g" },
      { name: "Lemongrass", measure: "2 stalks" },
      { name: "Peach syrup", measure: "3 tbsp" },
      { name: "Orange juice", measure: "80 ml" },
      { name: "Sugar", measure: "2 tbsp" },
    ],
    source: "https://cooky.vn/cong-thuc/tra-dao-cam-sa",
  }),
  make(23, {
    slug: "ca-phe-sua-da",
    strMeal: "Vietnamese Iced Milk Coffee",
    strMealVi: "Cà Phê Sữa Đá",
    strCategory: "Drink",
    strMealThumb: img("photo-1461023058943-07fcbe16d735"),
    timeMin: 8,
    difficulty: "easy",
    region: "Nam",
    strInstructions:
      "1. Add 2–3 tbsp of condensed milk to the bottom of a glass.\n2. Place Vietnamese phin filter on the glass with ground coffee.\n3. Pour a little hot water to bloom, then top up. Let it drip slowly 4–5 min.\n4. Stir well, add ice. Enjoy.",
    strInstructionsVi:
      "1. Cho 2–3 thìa sữa đặc xuống đáy ly.\n2. Đặt phin lên miệng ly, cho cà phê xay.\n3. Châm ít nước nóng cho nở, rồi đổ đầy. Để phin nhỏ giọt 4–5 phút.\n4. Khuấy đều, cho đá vào và thưởng thức.",
    ingredients: [
      { name: "Vietnamese ground coffee", measure: "20 g" },
      { name: "Condensed milk", measure: "2 tbsp" },
      { name: "Hot water", measure: "80 ml" },
      { name: "Ice", measure: "as needed" },
    ],
    source: "https://monngonmoingay.com/ca-phe-sua-da",
  }),
  make(24, {
    slug: "xoi-xeo",
    strMeal: "Yellow Mung Bean Sticky Rice",
    strMealVi: "Xôi Xéo",
    strCategory: "Breakfast",
    strMealThumb: img("photo-1617093727343-374698b1b08d"),
    timeMin: 75,
    difficulty: "medium",
    region: "Bắc",
    strInstructions:
      "1. Soak glutinous rice overnight with a pinch of turmeric.\n2. Soak peeled mung beans 2 h. Steam until soft, mash and shape into a log.\n3. Steam the rice 30 min, sprinkle with a little coconut oil to glisten.\n4. Serve plates topped with sliced mung bean, fried shallots and a drizzle of shallot oil.",
    strInstructionsVi:
      "1. Ngâm gạo nếp qua đêm với chút bột nghệ.\n2. Ngâm đậu xanh cà vỏ 2 tiếng, hấp chín rồi giã mịn, nắm thành khối.\n3. Hấp xôi 30 phút, rưới dầu dừa cho xôi bóng.\n4. Đơm xôi, bào lát đậu xanh lên trên, rắc hành phi và rưới mỡ hành.",
    ingredients: [
      { name: "Glutinous rice", measure: "500 g" },
      { name: "Peeled mung beans", measure: "200 g" },
      { name: "Turmeric powder", measure: "1 tsp" },
      { name: "Fried shallots", measure: "3 tbsp" },
      { name: "Shallot oil", measure: "2 tbsp" },
    ],
    source: "https://cooky.vn/cong-thuc/xoi-xeo",
  }),
];

// Lookup helpers
export function getBmyRecipeById(id) {
  return BMY_RECIPES.find((r) => r.idMeal === id) || null;
}
export function getBmyRecipeBySlug(slug) {
  return BMY_RECIPES.find((r) => r.slug === slug) || null;
}
export function getBmyCategories() {
  return [...new Set(BMY_RECIPES.map((r) => r.strCategory))].sort();
}
export function getBmyRegions() {
  return ["Bắc", "Trung", "Nam"];
}
