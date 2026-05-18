#!/usr/bin/env node
/**
 * MatsuriNavi 自動データ収集スクリプト
 * ─────────────────────────────────────────────
 * GitHub Actions から定期実行（1日5回）されます。
 *
 * 処理フロー:
 *  1. ローカル JS ファイル (events-data.js など) を vm で読み込み → ベースデータ
 *  2. 既存の matsuri-data.json があれば読み込み → 蓄積データ
 *  3. Wikidata SPARQL で日本の祭りを追加取得（無料・API キー不要）
 *  4. 重複排除 → ソート → matsuri-data.json に上書き保存
 * ─────────────────────────────────────────────
 */

'use strict';

const fs   = require('fs');
const path = require('path');
const vm   = require('vm');
const https = require('https');

// ── パス設定（このファイルがリポジトリルートにある前提）──────────────
const ROOT        = __dirname;
const OUTPUT_PATH = path.join(ROOT, 'matsuri-data.json');

// ローカル JS データファイル（読み込み順序が重要）
const LOCAL_JS_FILES = [
  'public/events-data.js',
  'public/events-extra.js',
  'public/events-yatai.js',
  'matsuri_data.js',
].map(f => path.join(ROOT, f));

// Unsplash フォールバック画像
const FALLBACK_IMGS = [
  'https://images.unsplash.com/photo-1570141657321-7299a910f545?w=800&q=80',
  'https://images.unsplash.com/photo-1529686342540-1b43aec0df75?w=800&q=80',
  'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=80',
  'https://images.unsplash.com/photo-1516912481808-3406841bd33c?w=800&q=80',
  'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800&q=80',
];

// ════════════════════════════════════════════════════════════════
//  Step 1: ローカル JS ファイルから既存データを読み込む
// ════════════════════════════════════════════════════════════════
function loadLocalEvents() {
  // ブラウザの window オブジェクトをモック
  const context = { window: { allEvents: [] } };
  vm.createContext(context);

  let loaded = 0;
  for (const filePath of LOCAL_JS_FILES) {
    if (!fs.existsSync(filePath)) {
      console.log(`  スキップ (ファイルなし): ${path.relative(ROOT, filePath)}`);
      continue;
    }
    try {
      const code = fs.readFileSync(filePath, 'utf8');
      vm.runInContext(code, context);
      loaded++;
      console.log(`  ✓ ${path.relative(ROOT, filePath)}`);
    } catch (e) {
      console.warn(`  ⚠ 読み込みエラー ${path.relative(ROOT, filePath)}: ${e.message}`);
    }
  }
  console.log(`  → ローカルJS: ${loaded} ファイル / ${context.window.allEvents.length} 件\n`);
  return context.window.allEvents || [];
}

// ════════════════════════════════════════════════════════════════
//  Step 2: 既存の matsuri-data.json を読み込む
// ════════════════════════════════════════════════════════════════
function loadExistingJson() {
  if (!fs.existsSync(OUTPUT_PATH)) return [];
  try {
    const data = JSON.parse(fs.readFileSync(OUTPUT_PATH, 'utf8'));
    console.log(`  ✓ 既存 matsuri-data.json: ${data.length} 件\n`);
    return Array.isArray(data) ? data : [];
  } catch (e) {
    console.warn(`  ⚠ JSON 読み込みエラー: ${e.message}\n`);
    return [];
  }
}

// ════════════════════════════════════════════════════════════════
//  Step 3: Wikidata SPARQL から日本の祭りデータを取得
//  (無料・API キー不要・ User-Agent を必ず付ける)
// ════════════════════════════════════════════════════════════════
function fetchWikidata() {
  // 日本の祭り (Q132241 = festival) を座標付きで取得
  const sparql = `
    SELECT DISTINCT ?item ?itemLabel ?coord ?month ?site ?desc WHERE {
      ?item wdt:P31/wdt:P279* wd:Q132241 .
      ?item wdt:P17 wd:Q17 .
      ?item wdt:P625 ?coord .
      OPTIONAL { ?item wdt:P837 ?month }
      OPTIONAL { ?item wdt:P856 ?site }
      OPTIONAL {
        ?item schema:description ?desc .
        FILTER(LANG(?desc) = "ja")
      }
      SERVICE wikibase:label {
        bd:serviceParam wikibase:language "ja,en"
      }
    }
    ORDER BY ?itemLabel
    LIMIT 80
  `;

  const endpoint = 'https://query.wikidata.org/sparql?query='
    + encodeURIComponent(sparql)
    + '&format=json';

  return new Promise((resolve) => {
    const options = {
      headers: {
        'User-Agent': 'MatsuriNavi/1.0 (GitHub Actions; contact via GitHub Issues)',
        'Accept': 'application/sparql-results+json',
      },
      timeout: 25000,
    };

    const req = https.get(endpoint, options, (res) => {
      if (res.statusCode !== 200) {
        console.warn(`  ⚠ Wikidata HTTP ${res.statusCode}`);
        resolve([]);
        return;
      }
      let body = '';
      res.setEncoding('utf8');
      res.on('data', chunk => { body += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          resolve(json.results?.bindings || []);
        } catch (e) {
          console.warn(`  ⚠ Wikidata JSON パースエラー: ${e.message}`);
          resolve([]);
        }
      });
    });

    req.on('error', (e) => {
      console.warn(`  ⚠ Wikidata 接続エラー: ${e.message}`);
      resolve([]);
    });
    req.on('timeout', () => {
      req.destroy();
      console.warn('  ⚠ Wikidata タイムアウト');
      resolve([]);
    });
  });
}

// ════════════════════════════════════════════════════════════════
//  Wikidata バインディング → allEvents 形式に変換
// ════════════════════════════════════════════════════════════════
function regionFromCoord(lat, lng) {
  if (lat >= 40)        return '北海道・東北';
  if (lat >= 37)        return '関東';
  if (lat >= 35.5)      return '中部';
  if (lat >= 34)        return '近畿';
  if (lat >= 32)        return '中国・四国';
  return '九州・沖縄';
}

function wikidataToEvent(binding, index) {
  const name = (binding.itemLabel?.value || '').trim();
  if (!name || /^Q\d+$/.test(name)) return null;       // ラベル未設定
  if (name.length < 2) return null;

  // "Point(lng lat)" パース
  const coordStr = binding.coord?.value || '';
  const m = coordStr.match(/Point\(([0-9.\-]+)\s+([0-9.\-]+)\)/);
  if (!m) return null;
  const lng = parseFloat(m[1]);
  const lat  = parseFloat(m[2]);

  // 日本の座標範囲チェック
  if (lat < 24 || lat > 46 || lng < 122 || lng > 154) return null;

  const desc = binding.desc?.value
    || `${name}は日本各地で受け継がれてきた伝統行事です。地域の文化と歴史を今に伝え、毎年多くの参加者が集います。`;
  const officialSite = binding.site?.value || '';
  const itemId = (binding.item?.value || '').replace('http://www.wikidata.org/entity/', '');
  const monthVal = binding.month?.value || '';
  const dateStr = monthVal
    ? `毎年 ${String(parseInt(monthVal, 10))} 月頃`
    : '日程はお問い合わせください';

  return {
    id:          `wd_${itemId || index}`,
    name,
    category:   '祭り',
    date:        dateStr,
    description: desc.length >= 30 ? desc : `${name}。${desc}`,
    imageUrl:    FALLBACK_IMGS[index % FALLBACK_IMGS.length],
    lat,
    lng,
    region:      regionFromCoord(lat, lng),
    heatScore:   4000 + Math.floor(Math.random() * 3000),
    eventUrl:    officialSite
                  || `https://www.wikidata.org/wiki/${itemId}`
                  || `https://www.google.com/search?q=${encodeURIComponent(name)}`,
  };
}

// ════════════════════════════════════════════════════════════════
//  メイン処理
// ════════════════════════════════════════════════════════════════
async function main() {
  console.log('═══════════════════════════════════════════');
  console.log(' 🎆 MatsuriNavi データ収集スクリプト起動');
  console.log(`    ${new Date().toISOString()}`);
  console.log('═══════════════════════════════════════════\n');

  // ① ローカル JS からベースデータ読み込み
  console.log('📂 [Step 1] ローカル JS ファイル読み込み...');
  const localEvents = loadLocalEvents();

  // ② 既存 JSON 読み込み
  console.log('📦 [Step 2] 既存 matsuri-data.json 読み込み...');
  const existingEvents = loadExistingJson();

  // ③ Wikidata 取得
  console.log('🌐 [Step 3] Wikidata SPARQL 問い合わせ中...');
  const wikidataRaw = await fetchWikidata();
  const wikidataEvents = wikidataRaw
    .map((b, i) => wikidataToEvent(b, i))
    .filter(Boolean);
  console.log(`  → Wikidata: ${wikidataEvents.length} 件 変換成功\n`);

  // ④ マージ（名前ベースで重複排除）
  console.log('🔀 [Step 4] データ統合＆重複排除...');
  const seenNames = new Set(localEvents.map(e => e.name));

  // 既存JSONのうちローカルに無いものだけ追加（蓄積分）
  const accumulatedEvents = existingEvents.filter(e => !seenNames.has(e.name));
  accumulatedEvents.forEach(e => seenNames.add(e.name));

  // Wikidata のうち重複しないものだけ追加
  const newWikiEvents = wikidataEvents.filter(e => !seenNames.has(e.name));

  const allEvents = [
    ...localEvents,
    ...accumulatedEvents,
    ...newWikiEvents,
  ].sort((a, b) => b.heatScore - a.heatScore);

  console.log(`  ローカルJS   : ${localEvents.length} 件`);
  console.log(`  蓄積データ   : ${accumulatedEvents.length} 件（新規）`);
  console.log(`  Wikidata新規 : ${newWikiEvents.length} 件`);
  console.log(`  ────────────────`);
  console.log(`  合計         : ${allEvents.length} 件\n`);

  // ⑤ JSON 出力
  console.log(`💾 [Step 5] ${OUTPUT_PATH} に書き込み...`);
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(allEvents, null, 2), 'utf8');

  console.log('\n═══════════════════════════════════════════');
  console.log(` ✅ 完了！合計 ${allEvents.length} 件 → matsuri-data.json`);
  console.log('═══════════════════════════════════════════');
}

main().catch(err => {
  console.error('\n❌ スクリプトエラー:', err);
  process.exit(1);
});
