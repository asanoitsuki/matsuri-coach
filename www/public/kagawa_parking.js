// 香川県の主要会場の周辺駐車場マスタ（実在する常設・過去実績の臨時駐車場）
// type: "permanent" (青) = 通年営業の有料/無料駐車場
// type: "temporary" (オレンジ) = 過去に祭り当日のみ開放された実績のある臨時駐車場
// 嘘の自動生成は禁止。確実に存在するものだけを記載。
// 座標は実在地点の概算（小数点4位精度）
(function () {
  window.PARKING_MAP = Object.assign(window.PARKING_MAP || {}, {

    // ── 金刀比羅宮（こんぴらさん） ──
    "kg07": [
      { name: "琴平町営西駐車場", type: "permanent", fee: "1日500円", lat: 34.1867, lng: 133.8222, capacity: "約100台" },
      { name: "琴平町営北駐車場", type: "permanent", fee: "1日500円", lat: 34.1893, lng: 133.8210, capacity: "約70台" },
      { name: "高灯籠前 公共駐車場", type: "permanent", fee: "1時間200円〜", lat: 34.1857, lng: 133.8205, capacity: "約30台" }
    ],
    "kg134": [
      { name: "琴平町営西駐車場", type: "permanent", fee: "1日500円", lat: 34.1867, lng: 133.8222, capacity: "約100台" },
      { name: "金倉川河川敷 臨時駐車場", type: "temporary", fee: "祭り当日のみ無料", lat: 34.1850, lng: 133.8260, capacity: "約50台" }
    ],
    "kg173": [
      { name: "琴平町営西駐車場", type: "permanent", fee: "1日500円", lat: 34.1867, lng: 133.8222, capacity: "約100台" },
      { name: "琴平町営北駐車場", type: "permanent", fee: "1日500円", lat: 34.1893, lng: 133.8210, capacity: "約70台" }
    ],

    // ── 栗林公園 ──
    "kg167": [
      { name: "栗林公園 北口駐車場", type: "permanent", fee: "1時間320円", lat: 34.3338, lng: 134.0480, capacity: "約63台" },
      { name: "栗林公園 東駐車場", type: "permanent", fee: "1時間320円", lat: 34.3290, lng: 134.0508, capacity: "約36台" }
    ],

    // ── 丸亀城 ──
    "kg148": [
      { name: "丸亀城内 大手町駐車場", type: "permanent", fee: "無料", lat: 34.2842, lng: 133.7975, capacity: "約50台" },
      { name: "市民ひろば駐車場", type: "permanent", fee: "無料", lat: 34.2856, lng: 133.7988, capacity: "約100台" }
    ],

    // ── 善通寺 ──
    "kg135": [
      { name: "善通寺 有料駐車場", type: "permanent", fee: "1回500円", lat: 34.2270, lng: 133.7820, capacity: "約100台" },
      { name: "善通寺 市営駐車場", type: "permanent", fee: "1時間100円", lat: 34.2280, lng: 133.7800, capacity: "約60台" }
    ],
    "kg180": [
      { name: "善通寺 有料駐車場", type: "permanent", fee: "1回500円", lat: 34.2270, lng: 133.7820, capacity: "約100台" },
      { name: "善通寺 市営駐車場", type: "permanent", fee: "1時間100円", lat: 34.2280, lng: 133.7800, capacity: "約60台" }
    ],
    "kg204": [
      { name: "善通寺 有料駐車場", type: "permanent", fee: "1回500円", lat: 34.2270, lng: 133.7820, capacity: "約100台" }
    ],

    // ── 屋島・八栗 ──
    "kg138": [
      { name: "屋島山上 観光駐車場", type: "permanent", fee: "1回300円", lat: 34.3725, lng: 134.1063, capacity: "約100台" }
    ],
    "kg208": [
      { name: "八栗ケーブル 麓駅駐車場", type: "permanent", fee: "無料", lat: 34.3780, lng: 134.1520, capacity: "約80台" }
    ],

    // ── 高松中心部 ──
    "kg174": [
      { name: "玉藻公園駐車場", type: "permanent", fee: "1時間100円", lat: 34.3464, lng: 134.0485, capacity: "約57台" }
    ],
    "kg216": [
      { name: "中央公園地下駐車場", type: "permanent", fee: "30分150円", lat: 34.3401, lng: 134.0434, capacity: "約330台" }
    ],

    // ── 父母ヶ浜 ──
    "kg163": [
      { name: "高屋神社 山頂駐車場", type: "permanent", fee: "無料（数台のみ）", lat: 34.0832, lng: 133.6750, capacity: "約5台" },
      { name: "高屋神社 下宮駐車場", type: "permanent", fee: "無料", lat: 34.0900, lng: 133.6850, capacity: "約30台" }
    ],

    // ── 小豆島 ──
    "kg212": [
      { name: "中山千枚田 観光駐車場", type: "permanent", fee: "無料", lat: 34.4800, lng: 134.2600, capacity: "約20台" }
    ],
    "kg217": [
      { name: "マルキン醤油記念館 駐車場", type: "permanent", fee: "無料", lat: 34.4831, lng: 134.2020, capacity: "約40台" }
    ],

    // ── サンポート高松 ──
    "kg118": [
      { name: "サンポート高松 地下駐車場", type: "permanent", fee: "30分150円", lat: 34.3548, lng: 134.0464, capacity: "約750台" }
    ],
    "kg107": [
      { name: "サンポート高松 地下駐車場", type: "permanent", fee: "30分150円", lat: 34.3548, lng: 134.0464, capacity: "約750台" }
    ],

    // ── 高松空港 ──
    "kg164": [
      { name: "高松空港 立体駐車場", type: "permanent", fee: "30分100円", lat: 34.2150, lng: 134.0186, capacity: "約2400台" }
    ],

    // ── まんのう公園 ──
    "kg100": [
      { name: "まんのう公園 第1駐車場", type: "permanent", fee: "普通車310円", lat: 34.1690, lng: 133.8530, capacity: "約1700台" },
      { name: "まんのう公園 第2駐車場", type: "permanent", fee: "普通車310円", lat: 34.1670, lng: 133.8500, capacity: "約500台" }
    ]
  });
})();
