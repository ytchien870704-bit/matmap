import type { CatalogNode, SuggestedEdge } from "./types";

const pos = (
  id: string,
  zh: string,
  en: string,
  x: number,
  y: number,
  aliases: string[],
): CatalogNode => ({
  id,
  kind: "position",
  zh,
  en,
  x,
  y,
  aliases,
  from: [],
  to: [],
  control: "",
  fail: "",
});

const act = (
  id: string,
  kind: CatalogNode["kind"],
  zh: string,
  en: string,
  x: number,
  y: number,
  from: string[],
  to: string[],
  control: string,
  fail: string,
  aliases: string[],
): CatalogNode => ({
  id,
  kind,
  zh,
  en,
  x,
  y,
  aliases,
  from,
  to,
  control,
  fail,
});

export const NODES: CatalogNode[] = [
  // ── Positions ──────────────────────────────────────────────
  pos("standing", "站立", "Standing", 360, 48, [
    "站立", "站著", "standing", "stand", "pull", "拉人", "拉進防守", "站技",
  ]),
  pos("spider", "蜘蛛", "Spider", 88, 168, ["蜘蛛", "蜘蛛防守", "spider", "spider guard"]),
  pos("lasso", "套索", "Lasso", 188, 168, ["套索", "lasso", "lasso guard"]),
  pos("open_guard", "開放防守", "Open guard", 300, 168, [
    "開放", "開放防守", "open", "open guard", "開防守", "開守",
  ]),
  pos("de_la_riva", "De La Riva", "De La Riva", 430, 168, [
    "dlr", "de la riva", "delariva", "迪拉瑞瓦", "鉤腳",
  ]),
  pos("reverse_dlr", "反 DLR", "Reverse DLR", 548, 168, [
    "rdlr", "reverse dlr", "reverse de la riva", "反dlr", "反 dlr",
  ]),
  pos("single_x", "單鉤", "X-guard", 648, 168, [
    "單鉤", "單鈎", "x-guard", "x guard", "xguard", "single x",
  ]),
  pos("closed_guard", "閉鎖防守", "Closed guard", 150, 312, [
    "閉鎖", "閉鎖防守", "閉門", "closed", "closed guard", "close guard",
    "クローズド", "閉守", "closedg",
  ]),
  pos("half_guard", "半閉鎖", "Half guard", 310, 312, [
    "半閉鎖", "半守", "half", "half guard", "halfguard", "ハーフ",
  ]),
  pos("deep_half", "深半閉鎖", "Deep half", 460, 312, [
    "深半", "深半閉鎖", "deep half", "deephalf",
  ]),
  pos("butterfly", "蝴蝶", "Butterfly", 590, 312, [
    "蝴蝶", "蝴蝶防守", "butterfly", "butterfly guard", "バタフライ",
  ]),
  pos("fifty_fifty", "五十／五十", "50/50", 360, 420, [
    "5050", "50/50", "五十", "fifty", "fifty fifty",
  ]),
  pos("turtle", "龜式", "Turtle", 220, 700, ["龜", "龜式", "turtle", "タートル", "烏龜"]),
  pos("knee_cut_mid", "膝切過腿中", "Knee-cut passing", 500, 700, [
    "膝切過腿中", "過腿中", "passing", "pass mid",
  ]),
  pos("side_control", "側控", "Side control", 120, 880, [
    "側控", "側壓", "side", "side control", "サイド", "kesa", "scarf",
  ]),
  pos("north_south", "北南", "North-south", 250, 880, [
    "北南", "南北", "north south", "north-south", "ns",
  ]),
  pos("knee_on_belly", "膝騎", "Knee on belly", 380, 880, [
    "膝騎", "knee on belly", "kob", "knee ride",
  ]),
  pos("mount", "騎乘", "Mount", 510, 880, ["騎乘", "騎坐", "mount", "mounted", "マウント"]),
  pos("back", "後背", "Back", 630, 880, [
    "後背", "背後", "back", "back control", "rear", "バック",
  ]),

  // ── Sweeps ─────────────────────────────────────────────────
  act(
    "flower_sweep",
    "sweep",
    "花掃",
    "Flower sweep",
    70,
    500,
    ["closed_guard"],
    ["mount"],
    "控袖、收腳、側翻",
    "沒控住對手的手，被撐回來",
    ["花掃", "flower", "flower sweep", "pendulum", "鐘擺掃"],
  ),
  act(
    "scissor_sweep",
    "sweep",
    "剪刀掃",
    "Scissor sweep",
    180,
    500,
    ["closed_guard", "open_guard"],
    ["mount"],
    "膝切對手腰、腳剪底盤",
    "對手壓肩，剪不開",
    ["剪刀", "剪刀掃", "scissor", "scissor sweep"],
  ),
  act(
    "hip_bump",
    "sweep",
    "坐起掃",
    "Hip bump",
    290,
    500,
    ["closed_guard"],
    ["mount"],
    "坐起、手撐、頂髖",
    "對手後坐，被壓回去",
    ["坐起掃", "坐起", "hip bump", "hipbump", "bump"],
  ),
  act(
    "butterfly_sweep",
    "sweep",
    "蝴蝶掃",
    "Butterfly sweep",
    520,
    500,
    ["butterfly"],
    ["mount", "knee_on_belly"],
    "抬鉤、倒對手、跟進騎乘",
    "對手壓鉤腳，掃不起來",
    ["蝴蝶掃", "butterfly sweep", "バタフライスイープ"],
  ),
  act(
    "bridge_sweep",
    "sweep",
    "橋掃",
    "Bridge sweep",
    400,
    500,
    ["half_guard", "mount"],
    ["closed_guard", "open_guard"],
    "橋起、翻轉底盤",
    "對手壓死重心，橋不起來",
    ["橋掃", "bridge sweep", "upa sweep"],
  ),

  // ── Passes ─────────────────────────────────────────────────
  act(
    "knee_cut",
    "pass",
    "膝切",
    "Knee cut",
    430,
    780,
    ["half_guard", "open_guard", "knee_cut_mid"],
    ["side_control"],
    "壓肩、膝切開對方防守",
    "被單鉤撈回、或對手蝦行逃走",
    ["膝切", "knee cut", "kneecut", "knee slice", "knee slice pass", "膝蓋切割"],
  ),
  act(
    "toreando",
    "pass",
    "Toreando",
    "Toreando",
    540,
    780,
    ["open_guard", "spider"],
    ["side_control"],
    "抓褲腳、繞過腿",
    "被對手重新套上開放防守",
    ["toreando", "bullfight", "鬥牛", "繞腿過"],
  ),
  act(
    "stack_pass",
    "pass",
    "堆疊",
    "Stack pass",
    640,
    780,
    ["closed_guard", "open_guard"],
    ["side_control", "mount"],
    "堆疊對手、壓過髖",
    "被三角反鎖，或對手蝦出",
    ["堆疊", "stack", "stack pass", "double under", "雙下"],
  ),
  act(
    "smash_pass",
    "pass",
    "壓過",
    "Smash pass",
    320,
    780,
    ["half_guard", "butterfly"],
    ["side_control"],
    "壓死半守、清腿",
    "被深半撈走",
    ["壓過", "smash", "smash pass", "pressure pass"],
  ),

  // ── Escapes ────────────────────────────────────────────────
  act(
    "elbow_escape",
    "escape",
    "肘逃",
    "Elbow escape",
    90,
    1040,
    ["mount", "side_control"],
    ["half_guard", "closed_guard"],
    "框架、收肘、蝦進半守",
    "對手跟髖，逃不出空間",
    ["肘逃", "elbow escape", "elbow escape mount", "蝦肘"],
  ),
  act(
    "bridge_escape",
    "escape",
    "橋逃",
    "Bridge escape",
    210,
    1040,
    ["mount", "side_control"],
    ["closed_guard", "open_guard"],
    "控手、橋起、翻轉",
    "沒控住手，被騎回去",
    ["橋", "橋逃", "upa", "bridge", "bridge escape"],
  ),
  act(
    "shrimp",
    "escape",
    "蝦行",
    "Shrimp",
    330,
    1040,
    ["side_control", "knee_on_belly", "mount"],
    ["closed_guard", "open_guard", "half_guard"],
    "框架推開、髖逃",
    "對手壓肩，髖動不了",
    ["蝦", "蝦行", "shrimp", "hip escape", "髖逃"],
  ),
  act(
    "recover_guard",
    "escape",
    "回到防守",
    "Recover guard",
    450,
    1040,
    ["knee_cut_mid", "side_control", "turtle"],
    ["closed_guard", "open_guard", "half_guard"],
    "套腿、建立框架、收守",
    "對手抽膝完成過腿",
    ["回守", "回到防守", "recover", "recover guard", "guard recovery"],
  ),

  // ── Finishes ───────────────────────────────────────────────
  act(
    "triangle",
    "finish",
    "三角",
    "Triangle",
    90,
    600,
    ["closed_guard", "open_guard", "mount"],
    [],
    "控頭、鎖頸、抬臀收腿",
    "撐肘",
    ["三角", "三角絞", "triangle", "triangle choke", "トライアングル"],
  ),
  act(
    "armbar",
    "finish",
    "十字固定",
    "Armbar",
    200,
    600,
    ["closed_guard", "mount", "back"],
    [],
    "控腕、髖頂肘、夾緊",
    "對手握拳藏肘，或轉肩逃走",
    ["十字", "十字固定", "手臂十字", "armbar", "arm bar", "juji", "腕十字"],
  ),
  act(
    "kimura",
    "finish",
    "木村",
    "Kimura",
    310,
    600,
    ["closed_guard", "side_control", "north_south"],
    ["north_south"],
    "鎖腕、肩向後轉",
    "對手直臂或滾走",
    ["木村", "kimura", "キムラ", "double wrist lock"],
  ),
  act(
    "omoplata",
    "finish",
    "肩鎖",
    "Omoplata",
    420,
    600,
    ["closed_guard", "open_guard"],
    ["side_control"],
    "腿鎖肩、坐起壓",
    "對手前滾解脫",
    ["肩鎖", "omoplata", "オモプラッタ"],
  ),
  act(
    "guillotine",
    "finish",
    "斷頭",
    "Guillotine",
    540,
    600,
    ["standing", "closed_guard", "butterfly", "half_guard"],
    [],
    "鎖頸、收肘、抬髖",
    "對手藏頭、或撐起解脫",
    ["斷頭", "斷頭台", "guillotine", "ギロチン"],
  ),
  act(
    "americana",
    "finish",
    "美國鎖",
    "Americana",
    90,
    1160,
    ["side_control", "mount"],
    [],
    "控腕、折肩",
    "對手收肘貼身",
    ["美國鎖", "americana", "keylock", "ude garami"],
  ),
  act(
    "arm_triangle",
    "finish",
    "手臂三角",
    "Arm triangle",
    230,
    1160,
    ["side_control", "mount"],
    [],
    "把頭鎖在對手腋下、側壓",
    "對手轉臉逃走",
    ["手臂三角", "arm triangle", "head and arm", "kata gatame", "肩固"],
  ),
  act(
    "ezekiel",
    "finish",
    "以西結",
    "Ezekiel",
    370,
    1160,
    ["mount", "side_control"],
    [],
    "袖或手刃鎖喉",
    "對手收下巴、框架",
    ["以西結", "ezekiel", "エゼキエル"],
  ),
  act(
    "rnc",
    "finish",
    "後裸絞",
    "Rear naked choke",
    510,
    1160,
    ["back"],
    [],
    "掌貼二頭、收肘、藏頭",
    "對手拔手、或下巴卡住",
    ["後裸絞", "裸絞", "rnc", "rear naked", "rear naked choke", "mata leão", "後ろ裸絞"],
  ),
  act(
    "bow_and_arrow",
    "finish",
    "弓箭絞",
    "Bow and arrow",
    640,
    1160,
    ["back"],
    [],
    "控領、拉腿成弓",
    "對手轉身解領",
    ["弓箭", "弓箭絞", "bow and arrow", "bow and arrow choke"],
  ),
];

export const NODE_BY_ID: Record<string, CatalogNode> = Object.fromEntries(
  NODES.map((n) => [n.id, n]),
);

export const SUGGESTED_EDGES: SuggestedEdge[] = [
  { from: "standing", to: "closed_guard", label: "拉人進防守" },
  { from: "standing", to: "guillotine" },
  { from: "closed_guard", to: "triangle" },
  { from: "closed_guard", to: "armbar" },
  { from: "closed_guard", to: "flower_sweep" },
  { from: "closed_guard", to: "kimura" },
  { from: "closed_guard", to: "hip_bump" },
  { from: "closed_guard", to: "scissor_sweep" },
  { from: "closed_guard", to: "omoplata" },
  { from: "half_guard", to: "knee_cut" },
  { from: "half_guard", to: "deep_half" },
  { from: "half_guard", to: "recover_guard" },
  { from: "half_guard", to: "bridge_sweep" },
  { from: "open_guard", to: "toreando" },
  { from: "open_guard", to: "de_la_riva" },
  { from: "open_guard", to: "spider" },
  { from: "butterfly", to: "butterfly_sweep" },
  { from: "butterfly", to: "guillotine" },
  { from: "de_la_riva", to: "single_x" },
  { from: "turtle", to: "back" },
  { from: "turtle", to: "side_control" },
  { from: "knee_cut", to: "side_control" },
  { from: "toreando", to: "side_control" },
  { from: "stack_pass", to: "side_control" },
  { from: "smash_pass", to: "side_control" },
  { from: "side_control", to: "mount" },
  { from: "side_control", to: "kimura" },
  { from: "side_control", to: "americana" },
  { from: "side_control", to: "north_south" },
  { from: "side_control", to: "knee_on_belly" },
  { from: "side_control", to: "arm_triangle" },
  { from: "mount", to: "armbar" },
  { from: "mount", to: "ezekiel" },
  { from: "mount", to: "back" },
  { from: "mount", to: "elbow_escape" },
  { from: "back", to: "rnc" },
  { from: "back", to: "bow_and_arrow" },
  { from: "back", to: "armbar" },
  { from: "knee_on_belly", to: "mount" },
  { from: "north_south", to: "kimura" },
  { from: "flower_sweep", to: "mount" },
  { from: "scissor_sweep", to: "mount" },
  { from: "hip_bump", to: "mount" },
  { from: "butterfly_sweep", to: "mount" },
  { from: "elbow_escape", to: "half_guard" },
  { from: "bridge_escape", to: "closed_guard" },
  { from: "shrimp", to: "open_guard" },
  { from: "recover_guard", to: "closed_guard" },
];

export const FAIL_REASONS = [
  "撐肘",
  "沒控頭",
  "被架住",
  "時機太慢",
  "重心不夠",
  "對手滾走",
  "藏肘",
  "被單鉤撈回",
] as const;

export const FAIL_LABEL: Record<string, string> = {
  撐肘: "Posted elbow",
  沒控頭: "Lost the head",
  被架住: "Framed off",
  時機太慢: "Too slow",
  重心不夠: "No base",
  對手滾走: "They rolled out",
  藏肘: "Tucked elbow",
  被單鉤撈回: "Reaped back to X",
};

export function failLabel(raw: string | null | undefined): string {
  if (!raw) return "";
  return FAIL_LABEL[raw] ?? raw;
}

export const RESULT_LABEL: Record<string, string> = {
  drill: "鑽研",
  success: "成功",
  failed: "被破",
};

export const PROFICIENCY_LABEL: Record<string, string> = {
  seen: "見過",
  drill: "能鑽",
  roll: "滾輪用過",
};

export const KIND_LABEL: Record<string, string> = {
  position: "Position",
  sweep: "Sweep",
  pass: "Pass",
  escape: "Escape",
  finish: "Submission",
};

export const SESSION_KIND_LABEL: Record<string, string> = {
  roll: "滾輪",
  drill: "只鑽",
  mixed: "鑽＋滾",
};

function norm(s: string): string {
  return s
    .toLowerCase()
    .replace(/[／/]/g, "")
    .replace(/[\s\-_.]+/g, "")
    .replace(/[台臺]/g, "台")
    .trim();
}

const ALIAS_INDEX: { key: string; id: string; len: number }[] = NODES.flatMap((n) =>
  [n.zh, n.en, n.id, ...n.aliases].map((a) => ({
    key: norm(a),
    id: n.id,
    len: norm(a).length,
  })),
).sort((a, b) => b.len - a.len);

export function resolveNode(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const k = norm(raw);
  if (!k) return null;
  if (NODE_BY_ID[k]) return k;
  const exact = ALIAS_INDEX.find((a) => a.key === k);
  if (exact) return exact.id;
  const contained = ALIAS_INDEX.find((a) => k.includes(a.key) && a.len >= 2);
  return contained?.id ?? null;
}

export function nodeLabel(id: string | null | undefined): string {
  if (!id) return "—";
  return NODE_BY_ID[id]?.en ?? id;
}

export function nodeEn(id: string | null | undefined): string {
  if (!id) return "";
  return NODE_BY_ID[id]?.en ?? "";
}

/** Compact labels for the system map. */
export const NODE_SHORT: Record<string, string> = {
  standing: "Stand",
  spider: "Spider",
  lasso: "Lasso",
  open_guard: "Open",
  de_la_riva: "DLR",
  reverse_dlr: "rDLR",
  single_x: "X",
  closed_guard: "Closed",
  half_guard: "Half",
  deep_half: "Deep",
  butterfly: "Fly",
  fifty_fifty: "50/50",
  turtle: "Turtle",
  knee_cut_mid: "Passing",
  side_control: "Side",
  north_south: "N-S",
  knee_on_belly: "KoB",
  mount: "Mount",
  back: "Back",
  flower_sweep: "Flower",
  scissor_sweep: "Scissor",
  hip_bump: "Hip",
  butterfly_sweep: "B-swp",
  bridge_sweep: "Bridge",
  knee_cut: "Knee",
  toreando: "Tore",
  stack_pass: "Stack",
  smash_pass: "Smash",
  elbow_escape: "Elbow",
  bridge_escape: "Upa",
  shrimp: "Shrimp",
  recover_guard: "Recover",
  triangle: "Tri",
  armbar: "Armbar",
  kimura: "Kimura",
  omoplata: "Omo",
  guillotine: "Guill",
  americana: "Amer",
  arm_triangle: "Arm-tri",
  ezekiel: "Ezekiel",
  rnc: "RNC",
  bow_and_arrow: "Bow",
};

export function nodeShort(id: string): string {
  return NODE_SHORT[id] ?? NODE_BY_ID[id]?.en ?? id;
}

export function actionsFrom(positionId: string | null): CatalogNode[] {
  if (!positionId) return NODES.filter((n) => n.kind !== "position");
  const direct = NODES.filter(
    (n) => n.kind !== "position" && (n.from.includes(positionId) || n.to.includes(positionId)),
  );
  if (direct.length > 0) return direct;
  return NODES.filter((n) => n.kind !== "position");
}

export function positions(): CatalogNode[] {
  return NODES.filter((n) => n.kind === "position");
}

export const GRAPH_VIEWBOX = { w: 720, h: 1240 };

/** Local, glossary-first parse so a 20s utterance becomes cards even without the model. */
export function parseUtterance(text: string): {
  cards: {
    fromNode: string | null;
    actionNode: string | null;
    toNode: string | null;
    result: "drill" | "success" | "failed";
    failReason: string | null;
    count: number;
    details: string;
    role: "attack" | "defense";
  }[];
  kindHint: "roll" | "drill" | "mixed" | null;
} {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (!cleaned) return { cards: [], kindHint: null };

  let kindHint: "roll" | "drill" | "mixed" | null = null;
  if (/滾輪|spar|roll/.test(cleaned) && /鑽|drill/.test(cleaned)) kindHint = "mixed";
  else if (/滾輪|spar|roll/.test(cleaned)) kindHint = "roll";
  else if (/鑽|drill/.test(cleaned)) kindHint = "drill";

  const clauses = cleaned
    .split(/[；;。！？!\n]+/)
    .map((c) => c.trim())
    .filter(Boolean);

  const cards = clauses.map((clause) => {
    const role: "attack" | "defense" =
      /被|挨|遭|過我|過了兩|過兩|got passed|passed me|got knee|got swept|\bon me\b/.test(clause)
        ? "defense"
        : "attack";
    let result: "drill" | "success" | "failed" = "drill";
    if (
      /成功|鎖到|掃到|過了|過到|絞到|swept|submitted|finished|locked|hit it/.test(clause) &&
      !/沒|不|掉|破|fail|lost|post/.test(clause)
    ) {
      result = "success";
    } else if (
      /掉|破|失敗|沒成|撐肘就|逃掉|被過|過兩|過了兩|fail|posted|escaped|lost it|didn't hit/.test(clause)
    ) {
      result = "failed";
    } else if (/鑽|練|練習|drill/.test(clause)) {
      result = "drill";
    }
    if (role === "defense" && result === "drill" && !/鑽|drill/.test(clause)) {
      result = "failed";
    }

    let failReason: string | null = null;
    const clauseNorm = clause.toLowerCase();
    for (const f of FAIL_REASONS) {
      if (clause.includes(f) || clauseNorm.includes(FAIL_LABEL[f].toLowerCase())) {
        failReason = f;
        break;
      }
    }
    if (!failReason && /撐肘|post/.test(clause)) failReason = "撐肘";
    if (!failReason && /tuck|hidden elbow|藏肘/.test(clauseNorm)) failReason = "藏肘";
    if (!failReason && /head control|lost the head|沒控頭/.test(clauseNorm)) failReason = "沒控頭";

    const countMatch = clause.match(
      /(\d+)\s*次|×\s*(\d+)|x\s*(\d+)|过([两兩二三四五六七八九十\d]+)|(\d+)\s*times?/i,
    );
    let count = 1;
    if (countMatch) {
      const raw = countMatch[1] || countMatch[2] || countMatch[3] || countMatch[4] || countMatch[5];
      const map: Record<string, number> = { 兩: 2, 两: 2, 二: 2, 三: 3, 四: 4, 五: 5 };
      count = map[raw] ?? (parseInt(raw, 10) || 1);
    } else if (/兩次|两次|兩遍|twice/.test(clause)) count = 2;

    const hits = ALIAS_INDEX.filter((a) => a.len >= 2 && norm(clause).includes(a.key));
    const seen = new Set<string>();
    const ordered: CatalogNode[] = [];
    for (const h of hits) {
      if (seen.has(h.id)) continue;
      seen.add(h.id);
      const n = NODE_BY_ID[h.id];
      if (n) ordered.push(n);
    }
    const posHit = ordered.find((n) => n.kind === "position") ?? null;
    const actHit = ordered.find((n) => n.kind !== "position") ?? null;
    const toHit =
      actHit && posHit
        ? (ordered.find((n) => n.kind === "position" && n.id !== posHit.id) ?? null)
        : (ordered.filter((n) => n.kind === "position")[1] ?? null);

    const toNode =
      toHit?.id ??
      (actHit && result === "success" ? (actHit.to[0] ?? null) : null) ??
      (actHit?.kind === "finish" ? null : (actHit?.to[0] ?? null));

    const fromNode =
      posHit?.id ??
      (actHit?.from[0] ?? null);

    return {
      fromNode,
      actionNode: actHit?.id ?? null,
      toNode,
      result,
      failReason,
      count,
      details: clause,
      role,
    };
  });

  return { cards: cards.filter((c) => c.actionNode || c.fromNode), kindHint };
}
