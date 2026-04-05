window.CATEGORIES = {
  greetings:  { label: "Greetings & Basics",           emoji: "👋" },
  food:       { label: "Food & Restaurants",           emoji: "🍜" },
  shopping:   { label: "Shopping",                     emoji: "🛍️" },
  directions: { label: "Directions & Transportation",  emoji: "🗺️" },
  emergency:  { label: "Emergency & Help",             emoji: "🆘" }
};

window.PHRASES = [
  // ─── Greetings & Basics (15) ───────────────────────────────────────────────
  { id: "greet_001", category: "greetings", english: "Good morning",          japanese: "おはようございます",       romaji: "Ohayou gozaimasu",              notes: "Formal morning greeting",            difficulty: 1 },
  { id: "greet_002", category: "greetings", english: "Good afternoon / Hello", japanese: "こんにちは",              romaji: "Konnichiwa",                    notes: "Universal daytime greeting",         difficulty: 1 },
  { id: "greet_003", category: "greetings", english: "Good evening",           japanese: "こんばんは",              romaji: "Konbanwa",                      notes: "Evening greeting",                   difficulty: 1 },
  { id: "greet_004", category: "greetings", english: "Goodbye (formal)",       japanese: "さようなら",              romaji: "Sayounara",                     notes: "Final farewell",                     difficulty: 1 },
  { id: "greet_005", category: "greetings", english: "See you later",          japanese: "またね",                  romaji: "Mata ne",                       notes: "Casual goodbye",                     difficulty: 1 },
  { id: "greet_006", category: "greetings", english: "Thank you (formal)",     japanese: "ありがとうございます",     romaji: "Arigatou gozaimasu",            notes: "Polite thank you",                   difficulty: 1 },
  { id: "greet_007", category: "greetings", english: "Thank you (casual)",     japanese: "ありがとう",              romaji: "Arigatou",                      notes: "Casual thank you",                   difficulty: 1 },
  { id: "greet_008", category: "greetings", english: "You're welcome",         japanese: "どういたしまして",         romaji: "Dou itashimashite",             notes: "Response to thank you",              difficulty: 2 },
  { id: "greet_009", category: "greetings", english: "Excuse me / Sorry",      japanese: "すみません",              romaji: "Sumimasen",                     notes: "Also used to get attention",         difficulty: 1 },
  { id: "greet_010", category: "greetings", english: "I'm sorry",              japanese: "ごめんなさい",             romaji: "Gomen nasai",                   notes: "Sincere apology",                    difficulty: 1 },
  { id: "greet_011", category: "greetings", english: "Yes",                    japanese: "はい",                    romaji: "Hai",                           notes: "Polite yes / I see",                 difficulty: 1 },
  { id: "greet_012", category: "greetings", english: "No",                     japanese: "いいえ",                  romaji: "Iie",                           notes: "Polite no",                          difficulty: 1 },
  { id: "greet_013", category: "greetings", english: "Please (offering)",      japanese: "どうぞ",                  romaji: "Douzo",                         notes: "After you / here you go",           difficulty: 1 },
  { id: "greet_014", category: "greetings", english: "I don't understand",     japanese: "わかりません",             romaji: "Wakarimasen",                   notes: "Very useful phrase",                 difficulty: 1 },
  { id: "greet_015", category: "greetings", english: "Do you speak English?",  japanese: "英語を話せますか？",        romaji: "Eigo wo hanasemasu ka?",        notes: "Ask locals for help",                difficulty: 2 },

  // ─── Food & Restaurants (15) ───────────────────────────────────────────────
  { id: "food_001", category: "food", english: "I'd like to order",            japanese: "注文をお願いします",       romaji: "Chuumon wo onegaishimasu",      notes: "Flag down a waiter",                 difficulty: 2 },
  { id: "food_002", category: "food", english: "The check, please",            japanese: "お会計をお願いします",     romaji: "Okaikei wo onegaishimasu",      notes: "Ask for the bill",                   difficulty: 2 },
  { id: "food_003", category: "food", english: "It's delicious!",              japanese: "おいしい！",              romaji: "Oishii!",                       notes: "Compliment the food",                difficulty: 1 },
  { id: "food_004", category: "food", english: "Water, please",                japanese: "お水をください",           romaji: "Omizu wo kudasai",              notes: "Request water",                      difficulty: 1 },
  { id: "food_005", category: "food", english: "I have allergies",             japanese: "アレルギーがあります",     romaji: "Arerugii ga arimasu",           notes: "Important safety phrase",            difficulty: 2 },
  { id: "food_006", category: "food", english: "No meat, please",              japanese: "お肉なしでお願いします",   romaji: "Oniku nashi de onegaishimasu", notes: "For vegetarians",                    difficulty: 3 },
  { id: "food_007", category: "food", english: "A table for two",              japanese: "二人用のテーブルをお願いします", romaji: "Futari you no teeburu wo onegaishimasu", notes: "Seating request",           difficulty: 3 },
  { id: "food_008", category: "food", english: "What do you recommend?",       japanese: "おすすめは何ですか？",     romaji: "Osusume wa nan desu ka?",       notes: "Ask for the house special",          difficulty: 2 },
  { id: "food_009", category: "food", english: "This one, please",             japanese: "これをください",           romaji: "Kore wo kudasai",               notes: "Point and order",                    difficulty: 1 },
  { id: "food_010", category: "food", english: "Is this spicy?",               japanese: "これは辛いですか？",        romaji: "Kore wa karai desu ka?",        notes: "Ask about spice level",              difficulty: 2 },
  { id: "food_011", category: "food", english: "I'm vegetarian",               japanese: "ベジタリアンです",          romaji: "Bejitarian desu",               notes: "Dietary restriction",                difficulty: 1 },
  { id: "food_012", category: "food", english: "Separate checks, please",      japanese: "別々にお願いします",       romaji: "Betsu betsu ni onegaishimasu",  notes: "Split the bill",                     difficulty: 2 },
  { id: "food_013", category: "food", english: "A menu, please",               japanese: "メニューをください",       romaji: "Menyuu wo kudasai",             notes: "Request a menu",                     difficulty: 1 },
  { id: "food_014", category: "food", english: "Very tasty, thank you",        japanese: "とてもおいしかったです",    romaji: "Totemo oishikatta desu",        notes: "Compliment after eating",            difficulty: 2 },
  { id: "food_015", category: "food", english: "Where is the entrance?",       japanese: "入口はどこですか？",        romaji: "Iriguchi wa doko desu ka?",     notes: "Find the restaurant entrance",       difficulty: 2 },

  // ─── Shopping (10) ─────────────────────────────────────────────────────────
  { id: "shop_001", category: "shopping", english: "How much is this?",        japanese: "これはいくらですか？",      romaji: "Kore wa ikura desu ka?",        notes: "Essential shopping phrase",          difficulty: 1 },
  { id: "shop_002", category: "shopping", english: "That's too expensive",     japanese: "高すぎます",              romaji: "Takasugimasu",                  notes: "Politely decline on price",          difficulty: 2 },
  { id: "shop_003", category: "shopping", english: "Do you have another size?",japanese: "別のサイズはありますか？",  romaji: "Betsu no saizu wa arimasu ka?", notes: "Ask for different size",             difficulty: 2 },
  { id: "shop_004", category: "shopping", english: "I'm just looking",         japanese: "見ているだけです",          romaji: "Mite iru dake desu",            notes: "Tell staff you're browsing",         difficulty: 2 },
  { id: "shop_005", category: "shopping", english: "Can I pay by card?",       japanese: "カードで払えますか？",      romaji: "Kaado de haraemasu ka?",        notes: "Check card payment",                 difficulty: 2 },
  { id: "shop_006", category: "shopping", english: "Do you have a discount?",  japanese: "割引はありますか？",        romaji: "Waribiki wa arimasu ka?",       notes: "Ask about sales",                    difficulty: 2 },
  { id: "shop_007", category: "shopping", english: "I'll take this one",       japanese: "これをください",           romaji: "Kore wo kudasai",               notes: "Purchase decision",                  difficulty: 1 },
  { id: "shop_008", category: "shopping", english: "A bag, please",            japanese: "袋をください",             romaji: "Fukuro wo kudasai",             notes: "Ask for a shopping bag",             difficulty: 1 },
  { id: "shop_009", category: "shopping", english: "Tax included?",            japanese: "税込みですか？",            romaji: "Zeikomi desu ka?",              notes: "Check if tax is included",           difficulty: 2 },
  { id: "shop_010", category: "shopping", english: "Do you have another color?",japanese: "別の色はありますか？",     romaji: "Betsu no iro wa arimasu ka?",   notes: "Ask for color options",              difficulty: 2 },

  // ─── Directions & Transportation (15) ──────────────────────────────────────
  { id: "dir_001", category: "directions", english: "Where is the train station?", japanese: "駅はどこですか？",       romaji: "Eki wa doko desu ka?",           notes: "Find the station",                  difficulty: 1 },
  { id: "dir_002", category: "directions", english: "Where is the bathroom?",     japanese: "トイレはどこですか？",    romaji: "Toire wa doko desu ka?",         notes: "Most used phrase ever",             difficulty: 1 },
  { id: "dir_003", category: "directions", english: "Turn right",                 japanese: "右に曲がってください",    romaji: "Migi ni magatte kudasai",        notes: "Direction instruction",             difficulty: 2 },
  { id: "dir_004", category: "directions", english: "Turn left",                  japanese: "左に曲がってください",    romaji: "Hidari ni magatte kudasai",      notes: "Direction instruction",             difficulty: 2 },
  { id: "dir_005", category: "directions", english: "Go straight",                japanese: "まっすぐ行ってください",  romaji: "Massugu itte kudasai",           notes: "Direction instruction",             difficulty: 2 },
  { id: "dir_006", category: "directions", english: "How far is it?",             japanese: "どのくらい遠いですか？",  romaji: "Dono kurai tooi desu ka?",       notes: "Ask about distance",                difficulty: 2 },
  { id: "dir_007", category: "directions", english: "One ticket to [place]",      japanese: "〜まで一枚ください",      romaji: "~ made ichimai kudasai",         notes: "Buy a train ticket",                difficulty: 2 },
  { id: "dir_008", category: "directions", english: "Which platform?",            japanese: "何番ホームですか？",      romaji: "Nanban hoomu desu ka?",          notes: "Find your train platform",          difficulty: 2 },
  { id: "dir_009", category: "directions", english: "Does this train go to…?",   japanese: "この電車は〜に行きますか？", romaji: "Kono densha wa ~ ni ikimasu ka?", notes: "Confirm train destination",       difficulty: 2 },
  { id: "dir_010", category: "directions", english: "I'm lost",                   japanese: "迷子になりました",        romaji: "Maigo ni narimashita",           notes: "Tell someone you're lost",          difficulty: 2 },
  { id: "dir_011", category: "directions", english: "Take me to this address",    japanese: "この住所まで行ってください", romaji: "Kono juusho made itte kudasai", notes: "For taxis — show the address",      difficulty: 3 },
  { id: "dir_012", category: "directions", english: "How long does it take?",     japanese: "どのくらい時間がかかりますか？", romaji: "Dono kurai jikan ga kakarimasu ka?", notes: "Ask travel time",            difficulty: 3 },
  { id: "dir_013", category: "directions", english: "Is there a bus to…?",        japanese: "〜行きのバスはありますか？", romaji: "~ yuki no basu wa arimasu ka?", notes: "Find bus to destination",           difficulty: 2 },
  { id: "dir_014", category: "directions", english: "Please stop here",           japanese: "ここで止めてください",     romaji: "Koko de tomete kudasai",         notes: "Tell taxi driver to stop",          difficulty: 2 },
  { id: "dir_015", category: "directions", english: "Where is the nearest hotel?",japanese: "一番近いホテルはどこですか？", romaji: "Ichiban chikai hoteru wa doko desu ka?", notes: "Find accommodation",       difficulty: 2 },

  // ─── Emergency & Help (10) ─────────────────────────────────────────────────
  { id: "emrg_001", category: "emergency", english: "Help!",                    japanese: "助けてください！",         romaji: "Tasukete kudasai!",              notes: "Call for help urgently",            difficulty: 1 },
  { id: "emrg_002", category: "emergency", english: "Call the police!",         japanese: "警察を呼んでください！",    romaji: "Keisatsu wo yonde kudasai!",     notes: "Emergency — police",               difficulty: 2 },
  { id: "emrg_003", category: "emergency", english: "Call an ambulance!",       japanese: "救急車を呼んでください！",  romaji: "Kyuukyuusha wo yonde kudasai!", notes: "Emergency — medical",              difficulty: 2 },
  { id: "emrg_004", category: "emergency", english: "I need a doctor",          japanese: "医者が必要です",           romaji: "Isha ga hitsuyou desu",          notes: "Medical help needed",               difficulty: 2 },
  { id: "emrg_005", category: "emergency", english: "I've been robbed",         japanese: "盗まれました",             romaji: "Nusumaremashita",                notes: "Report theft",                      difficulty: 3 },
  { id: "emrg_006", category: "emergency", english: "I'm hurt",                 japanese: "怪我をしました",           romaji: "Kega wo shimashita",             notes: "Report an injury",                  difficulty: 2 },
  { id: "emrg_007", category: "emergency", english: "Where is the hospital?",   japanese: "病院はどこですか？",        romaji: "Byouin wa doko desu ka?",        notes: "Find medical care",                 difficulty: 1 },
  { id: "emrg_008", category: "emergency", english: "I need to contact my embassy", japanese: "大使館に連絡が必要です", romaji: "Taishikan ni renraku ga hitsuyou desu", notes: "Contact home country",       difficulty: 3 },
  { id: "emrg_009", category: "emergency", english: "I'm allergic to…",         japanese: "〜にアレルギーがあります", romaji: "~ ni arerugii ga arimasu",       notes: "State allergy",                     difficulty: 2 },
  { id: "emrg_010", category: "emergency", english: "I lost my passport",       japanese: "パスポートをなくしました", romaji: "Pasupooto wo nakushimashita",    notes: "Report lost documents",             difficulty: 3 }
];
