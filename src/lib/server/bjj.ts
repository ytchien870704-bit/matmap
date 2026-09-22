import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import { NODE_BY_ID, NODES, parseUtterance } from "@/lib/catalog";
import { diagramsFor } from "@/lib/diagrams";
import { todayISO, uid, yesterdayISO } from "@/lib/utils";
import type {
  CardResult,
  CardRole,
  DiagramSpec,
  GiPreference,
  GiType,
  GraphPayload,
  ParsedCardDraft,
  Profile,
  SessionKind,
  TechniqueCard,
  TrainingSession,
} from "@/lib/types";

type SessionRow = {
  id: string;
  trained_on: string;
  gym_name: string | null;
  gi_type: string;
  duration_min: number | null;
  kind: string;
  notes: string | null;
  created_at: string;
};

type CardRow = {
  id: string;
  session_id: string;
  from_node: string | null;
  action_node: string | null;
  to_node: string | null;
  result: string;
  fail_reason: string | null;
  count: number;
  details: string | null;
  role: string;
};

type PhotoRow = { id: string; session_id: string; data_url: string };

async function ensureProfile(userId: string, displayName?: string | null) {
  const sql = await getSql();
  await sql`
    insert into profiles (user_id, display_name)
    values (${userId}, ${displayName ?? null})
    on conflict (user_id) do nothing
  `;
}

function mapSession(
  s: SessionRow,
  cards: CardRow[],
  photos: PhotoRow[],
): TrainingSession {
  return {
    id: s.id,
    trainedOn: s.trained_on,
    gymName: s.gym_name,
    giType: (s.gi_type as GiType) ?? "gi",
    durationMin: s.duration_min,
    kind: (s.kind as SessionKind) ?? "mixed",
    notes: s.notes,
    createdAt: typeof s.created_at === "string" ? s.created_at : String(s.created_at),
    cards: cards
      .filter((c) => c.session_id === s.id)
      .map((c) => ({
        id: c.id,
        sessionId: c.session_id,
        fromNode: c.from_node,
        actionNode: c.action_node,
        toNode: c.to_node,
        result: c.result as CardResult,
        failReason: c.fail_reason,
        count: Number(c.count) || 1,
        details: c.details,
        role: (c.role as CardRole) ?? "attack",
      })),
    photos: photos
      .filter((p) => p.session_id === s.id)
      .map((p) => ({ id: p.id, dataUrl: p.data_url })),
  };
}

export const getBootstrap = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    await ensureProfile(context.userId);
    const today = todayISO();
    const yest = yesterdayISO();

    const profiles = await sql<{
      user_id: string;
      display_name: string | null;
      gym_name: string | null;
      gi_preference: string;
      is_pro: boolean;
    }>`select user_id, display_name, gym_name, gi_preference, is_pro from profiles where user_id = ${context.userId}`;

    const p = profiles[0];
    const profile: Profile = {
      userId: context.userId,
      displayName: p?.display_name ?? null,
      gymName: p?.gym_name ?? null,
      giPreference: (p?.gi_preference as GiPreference) ?? "both",
      isPro: p?.is_pro !== false,
    };

    const sessions = await sql<SessionRow>`
      select id, trained_on, gym_name, gi_type, duration_min, kind, notes, created_at::text as created_at
      from sessions where user_id = ${context.userId}
      order by trained_on desc, created_at desc
      limit 40
    `;
    const ids = sessions.map((s) => s.id);
    const cards =
      ids.length === 0
        ? []
        : await sql<CardRow>`
            select id, session_id, from_node, action_node, to_node, result, fail_reason, count, details, role
            from session_cards where user_id = ${context.userId}
          `;
    const photos =
      ids.length === 0
        ? []
        : await sql<PhotoRow>`
            select id, session_id, data_url from session_photos where user_id = ${context.userId}
          `;

    const mapped = sessions.map((s) => mapSession(s, cards, photos));
    const reviews = await sql<{
      id: string;
      session_id: string | null;
      for_date: string;
      message: string;
      read: boolean;
    }>`
      select id, session_id, for_date, message, read
      from reviews
      where user_id = ${context.userId} and for_date <= ${today}
      order by for_date desc
      limit 5
    `;

    const sessionCount = await sql<{ n: number }>`
      select count(*)::int as n from sessions where user_id = ${context.userId}
    `;

    return {
      profile,
      today,
      yesterday: yest,
      sessions: mapped,
      todaySessions: mapped.filter((s) => s.trainedOn === today),
      review: reviews.find((r) => !r.read) ?? reviews[0] ?? null,
      hasData: (sessionCount[0]?.n ?? 0) > 0,
    };
  });

export const updateProfile = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    (input: {
      gymName?: string;
      giPreference?: GiPreference;
      displayName?: string;
      isPro?: boolean;
    }) => input,
  )
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await ensureProfile(context.userId, data.displayName);
    await sql`
      update profiles set
        gym_name = coalesce(${data.gymName ?? null}, gym_name),
        gi_preference = coalesce(${data.giPreference ?? null}, gi_preference),
        display_name = coalesce(${data.displayName ?? null}, display_name),
        is_pro = coalesce(${data.isPro ?? null}, is_pro)
      where user_id = ${context.userId}
    `;
    return { ok: true as const };
  });

type SaveInput = {
  id?: string;
  trainedOn: string;
  gymName: string | null;
  giType: GiType;
  durationMin: number | null;
  kind: SessionKind;
  notes: string | null;
  cards: {
    fromNode: string | null;
    actionNode: string | null;
    toNode: string | null;
    result: CardResult;
    failReason: string | null;
    count: number;
    details: string | null;
    role: CardRole;
  }[];
  photos: { dataUrl: string }[];
};

export const saveSession = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: SaveInput) => input)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await ensureProfile(context.userId);
    const id = data.id || uid();
    await sql`
      insert into sessions (id, user_id, trained_on, gym_name, gi_type, duration_min, kind, notes)
      values (
        ${id}, ${context.userId}, ${data.trainedOn}, ${data.gymName},
        ${data.giType}, ${data.durationMin}, ${data.kind}, ${data.notes}
      )
      on conflict (id) do update set
        gym_name = excluded.gym_name,
        gi_type = excluded.gi_type,
        duration_min = excluded.duration_min,
        kind = excluded.kind,
        notes = excluded.notes
      where sessions.user_id = ${context.userId}
    `;

    await sql`delete from session_cards where session_id = ${id} and user_id = ${context.userId}`;
    await sql`delete from session_photos where session_id = ${id} and user_id = ${context.userId}`;

    for (const c of data.cards) {
      const cid = uid();
      await sql`
        insert into session_cards (
          id, session_id, user_id, from_node, action_node, to_node,
          result, fail_reason, count, details, role
        ) values (
          ${cid}, ${id}, ${context.userId}, ${c.fromNode}, ${c.actionNode}, ${c.toNode},
          ${c.result}, ${c.failReason}, ${c.count || 1}, ${c.details}, ${c.role}
        )
      `;
      await bumpTechnique(context.userId, c, data.trainedOn, data.kind);
      await bumpEdges(context.userId, c, data.trainedOn);
    }

    for (const p of data.photos.slice(0, 4)) {
      if (!p.dataUrl || p.dataUrl.length > 350_000) continue;
      await sql`
        insert into session_photos (id, session_id, user_id, data_url)
        values (${uid()}, ${id}, ${context.userId}, ${p.dataUrl})
      `;
    }

    return { id };
  });

async function bumpTechnique(
  userId: string,
  c: SaveInput["cards"][number],
  date: string,
  kind: SessionKind,
) {
  if (!c.actionNode) return;
  const sql = await getSql();
  const node = NODE_BY_ID[c.actionNode];
  const add = c.count || 1;
  let proficiency = "seen";
  if (kind === "roll" || c.result === "success" || c.result === "failed") proficiency = "roll";
  else if (c.result === "drill") proficiency = "drill";

  const existing = await sql<{
    times: number;
    proficiency: string;
    fail_notes: Record<string, number> | null;
    details: string | null;
  }>`
    select times, proficiency, fail_notes, details from technique_cards
    where user_id = ${userId} and action_node = ${c.actionNode}
  `;
  const prev = existing[0];
  const failNotes = { ...(prev?.fail_notes ?? {}) };
  if (c.failReason) failNotes[c.failReason] = (failNotes[c.failReason] ?? 0) + add;
  const details = [prev?.details, c.details].filter(Boolean).slice(-3).join("\n") || node?.control || null;
  const rank = (p: string) => (p === "roll" ? 3 : p === "drill" ? 2 : 1);
  const nextProf =
    rank(proficiency) > rank(prev?.proficiency ?? "seen") ? proficiency : (prev?.proficiency ?? proficiency);

  await sql`
    insert into technique_cards (
      user_id, action_node, details, proficiency, times, last_date, fail_notes, diagrams
    ) values (
      ${userId}, ${c.actionNode}, ${details}, ${nextProf}, ${add}, ${date},
      ${JSON.stringify(failNotes)}::jsonb, ${JSON.stringify(diagramsFor(c.actionNode))}::jsonb
    )
    on conflict (user_id, action_node) do update set
      times = technique_cards.times + ${add},
      last_date = ${date},
      proficiency = ${nextProf},
      fail_notes = ${JSON.stringify(failNotes)}::jsonb,
      details = coalesce(${details}, technique_cards.details),
      diagrams = coalesce(technique_cards.diagrams, ${JSON.stringify(diagramsFor(c.actionNode))}::jsonb)
  `;
}

async function bumpEdges(userId: string, c: SaveInput["cards"][number], date: string) {
  const sql = await getSql();
  const pairs: [string, string][] = [];
  if (c.fromNode && c.actionNode) pairs.push([c.fromNode, c.actionNode]);
  if (c.actionNode && c.toNode) pairs.push([c.actionNode, c.toNode]);
  if (c.fromNode && c.toNode && !c.actionNode) pairs.push([c.fromNode, c.toNode]);
  for (const [from, to] of pairs) {
    await sql`
      insert into user_edges (user_id, from_node, to_node, source, times, last_date)
      values (${userId}, ${from}, ${to}, 'practiced', ${c.count || 1}, ${date})
      on conflict (user_id, from_node, to_node, source) do update set
        times = user_edges.times + ${c.count || 1},
        last_date = ${date}
    `;
  }
}

export const deleteSession = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((id: string) => id)
  .handler(async ({ context, data: id }) => {
    const sql = await getSql();
    await sql`delete from session_cards where session_id = ${id} and user_id = ${context.userId}`;
    await sql`delete from session_photos where session_id = ${id} and user_id = ${context.userId}`;
    await sql`delete from sessions where id = ${id} and user_id = ${context.userId}`;
    return { ok: true as const };
  });

export const getGraph = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const edges = await sql<{
      from_node: string;
      to_node: string;
      source: string;
      times: number;
      last_date: string | null;
    }>`
      select from_node, to_node, source, times, last_date
      from user_edges where user_id = ${context.userId}
    `;
    const cards = await sql<{
      from_node: string | null;
      action_node: string | null;
      to_node: string | null;
      result: string;
      fail_reason: string | null;
      count: number;
      role: string;
      last: string;
    }>`
      select c.from_node, c.action_node, c.to_node, c.result, c.fail_reason, c.count, c.role,
             s.trained_on as last
      from session_cards c
      join sessions s on s.id = c.session_id
      where c.user_id = ${context.userId}
    `;

    const practiced = new Set<string>();
    const nodeStats: GraphPayload["nodeStats"] = {};
    const ensure = (id: string) => {
      if (!nodeStats[id]) nodeStats[id] = { times: 0, lastDate: null, actions: [], passedBy: [] };
      return nodeStats[id];
    };

    for (const c of cards) {
      const add = Number(c.count) || 1;
      if (c.from_node) {
        practiced.add(c.from_node);
        const st = ensure(c.from_node);
        st.times += add;
        st.lastDate = c.last > (st.lastDate ?? "") ? c.last : st.lastDate;
        if (c.action_node) {
          if (c.role === "defense") {
            const row = st.passedBy.find((p) => p.id === c.action_node);
            if (row) row.times += add;
            else st.passedBy.push({ id: c.action_node, times: add });
          } else {
            let row = st.actions.find((a) => a.id === c.action_node);
            if (!row) {
              row = { id: c.action_node, times: 0, failed: 0, failReasons: {} };
              st.actions.push(row);
            }
            row.times += add;
            if (c.result === "failed") {
              row.failed += add;
              if (c.fail_reason) {
                row.failReasons[c.fail_reason] = (row.failReasons[c.fail_reason] ?? 0) + add;
              }
            }
          }
        }
      }
      if (c.action_node) {
        practiced.add(c.action_node);
        const st = ensure(c.action_node);
        st.times += add;
        st.lastDate = c.last > (st.lastDate ?? "") ? c.last : st.lastDate;
      }
      if (c.to_node) practiced.add(c.to_node);
    }

    const payload: GraphPayload = {
      practicedNodeIds: [...practiced],
      edges: edges.map((e) => ({
        fromNode: e.from_node,
        toNode: e.to_node,
        source: e.source as "practiced" | "accepted",
        times: Number(e.times) || 0,
        lastDate: e.last_date,
      })),
      nodeStats,
    };
    return payload;
  });

export const acceptSuggestedEdge = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { from: string; to: string }) => input)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await sql`
      insert into user_edges (user_id, from_node, to_node, source, times, last_date)
      values (${context.userId}, ${data.from}, ${data.to}, 'accepted', 0, ${todayISO()})
      on conflict (user_id, from_node, to_node, source) do nothing
    `;
    return { ok: true as const };
  });

export const listTechniqueCards = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const rows = await sql<{
      action_node: string;
      custom_name: string | null;
      details: string | null;
      proficiency: string;
      times: number;
      last_date: string | null;
      diagrams: DiagramSpec[] | null;
      fail_notes: Record<string, number> | null;
    }>`
      select action_node, custom_name, details, proficiency, times, last_date, diagrams, fail_notes
      from technique_cards where user_id = ${context.userId}
      order by times desc, last_date desc
    `;
    return rows.map(
      (r): TechniqueCard => ({
        actionNode: r.action_node,
        customName: r.custom_name,
        details: r.details,
        proficiency: r.proficiency as TechniqueCard["proficiency"],
        times: Number(r.times) || 0,
        lastDate: r.last_date,
        diagrams: r.diagrams,
        failNotes: r.fail_notes,
      }),
    );
  });

export const updateTechniqueCard = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    (input: {
      actionNode: string;
      customName?: string | null;
      details?: string | null;
      proficiency?: TechniqueCard["proficiency"];
      diagrams?: DiagramSpec[] | null;
    }) => input,
  )
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await sql`
      insert into technique_cards (user_id, action_node, custom_name, details, proficiency, diagrams)
      values (
        ${context.userId}, ${data.actionNode}, ${data.customName ?? null},
        ${data.details ?? null}, ${data.proficiency ?? "seen"},
        ${data.diagrams ? JSON.stringify(data.diagrams) : null}::jsonb
      )
      on conflict (user_id, action_node) do update set
        custom_name = coalesce(${data.customName ?? null}, technique_cards.custom_name),
        details = coalesce(${data.details ?? null}, technique_cards.details),
        proficiency = coalesce(${data.proficiency ?? null}, technique_cards.proficiency),
        diagrams = coalesce(${data.diagrams ? JSON.stringify(data.diagrams) : null}::jsonb, technique_cards.diagrams)
    `;
    return { ok: true as const };
  });

export const parseVoice = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { text: string }) => input)
  .handler(async ({ data }) => {
    const local = parseUtterance(data.text);
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) {
      return { ok: true as const, source: "glossary" as const, ...local };
    }
    try {
      const catalog = NODES.map((n) => `${n.id}|${n.zh}|${n.en}|${n.aliases.slice(0, 4).join(",")}`).join("\n");
      const res = await fetch("https://api.x.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        signal: AbortSignal.timeout(6000),
        body: JSON.stringify({
          model: "grok-4.5",
          max_tokens: 700,
          temperature: 0,
          messages: [
            {
              role: "system",
              content:
                "You extract Brazilian Jiu-Jitsu training notes into JSON. Use ONLY these node ids. Map synonyms (閉鎖/closed/closed guard → closed_guard). Output JSON only: {\"kindHint\":\"roll|drill|mixed|null\",\"cards\":[{\"fromNode\":\"id|null\",\"actionNode\":\"id|null\",\"toNode\":\"id|null\",\"result\":\"drill|success|failed\",\"failReason\":\"string|null\",\"count\":1,\"details\":\"clause\",\"role\":\"attack|defense\"}]}. role=defense when the speaker was passed or submitted. 被破/掉/撐肘 → failed.",
            },
            {
              role: "user",
              content: `NODES:\n${catalog}\n\nUTTERANCE:\n${data.text}`,
            },
          ],
        }),
      });
      if (!res.ok) return { ok: true as const, source: "glossary" as const, ...local };
      const body = (await res.json()) as { choices?: { message?: { content?: string } }[] };
      const raw = body.choices?.[0]?.message?.content ?? "";
      const jsonStr = raw.match(/\{[\s\S]*\}/)?.[0];
      if (!jsonStr) return { ok: true as const, source: "glossary" as const, ...local };
      const parsed = JSON.parse(jsonStr) as { kindHint?: string | null; cards?: ParsedCardDraft[] };
      const cards = (parsed.cards ?? []).map((c) => ({
        fromNode: c.fromNode && NODE_BY_ID[c.fromNode] ? c.fromNode : (local.cards[0]?.fromNode ?? null),
        actionNode: c.actionNode && NODE_BY_ID[c.actionNode] ? c.actionNode : null,
        toNode: c.toNode && NODE_BY_ID[c.toNode] ? c.toNode : null,
        result: (["drill", "success", "failed"].includes(c.result) ? c.result : "drill") as CardResult,
        failReason: c.failReason || null,
        count: Number(c.count) || 1,
        details: c.details || data.text,
        role: c.role === "defense" ? ("defense" as const) : ("attack" as const),
      }));
      return {
        ok: true as const,
        source: "ai" as const,
        cards: cards.length ? cards : local.cards,
        kindHint: (parsed.kindHint as SessionKind | null) ?? local.kindHint,
      };
    } catch {
      return { ok: true as const, source: "glossary" as const, ...local };
    }
  });

export const transcribeAudio = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { audioBase64: string; mimeType: string }) => input)
  .handler(async ({ data }) => {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) return { ok: false as const, error: "語音辨識目前無法使用，請改打字或點選。" };
    try {
      const bin = Buffer.from(data.audioBase64, "base64");
      const form = new FormData();
      form.append("model", "grok-voice-transcribe-2.0");
      form.append(
        "file",
        new Blob([bin], { type: data.mimeType || "audio/webm" }),
        "clip.webm",
      );
      form.append("language", "zh");
      const res = await fetch("https://api.x.ai/v1/stt", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}` },
        signal: AbortSignal.timeout(12000),
        body: form,
      });
      if (!res.ok) {
        return { ok: false as const, error: "聽不懂這一輪，改打字或點選也行。" };
      }
      const body = (await res.json()) as { text?: string };
      return { ok: true as const, text: body.text ?? "" };
    } catch {
      return { ok: false as const, error: "語音上傳失敗。" };
    }
  });

export const generateReview = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { sessionId: string }) => input)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const sessions = await sql<SessionRow>`
      select id, trained_on, gym_name, gi_type, duration_min, kind, notes, created_at::text as created_at
      from sessions where id = ${data.sessionId} and user_id = ${context.userId}
    `;
    const s = sessions[0];
    if (!s) return { ok: false as const };
    const cards = await sql<CardRow>`
      select id, session_id, from_node, action_node, to_node, result, fail_reason, count, details, role
      from session_cards where session_id = ${data.sessionId} and user_id = ${context.userId}
    `;
    const summary = cards
      .map((c) => {
        const a = c.action_node ? NODE_BY_ID[c.action_node]?.en : "";
        const f = c.from_node ? NODE_BY_ID[c.from_node]?.en : "";
        return `${f} ${a} ${c.result} ${c.fail_reason ?? ""} ×${c.count} ${c.details ?? ""}`;
      })
      .join("；");

    let message = fallbackReview(cards);
    const apiKey = process.env.XAI_API_KEY;
    if (apiKey && summary) {
      try {
        const res = await fetch("https://api.x.ai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          signal: AbortSignal.timeout(6000),
          body: JSON.stringify({
            model: "grok-4.5",
            max_tokens: 120,
            temperature: 0.4,
            messages: [
              {
                role: "system",
                content:
                  "你是巴西柔術陪練筆記。用繁體中文寫一句隔日複習，像：「昨天三角掉在撐肘。下次先控頭再收腿。」不要emoji，不要超過兩句。",
              },
              { role: "user", content: summary },
            ],
          }),
        });
        if (res.ok) {
          const body = (await res.json()) as { choices?: { message?: { content?: string } }[] };
          const text = body.choices?.[0]?.message?.content?.trim();
          if (text) message = text.replace(/^["「]|["」]$/g, "");
        }
      } catch {
        /* keep fallback */
      }
    }

    const forDate = nextDate(s.trained_on);
    await sql`delete from reviews where user_id = ${context.userId} and session_id = ${s.id}`;
    await sql`
      insert into reviews (id, user_id, session_id, for_date, message, read)
      values (${uid()}, ${context.userId}, ${s.id}, ${forDate}, ${message}, false)
    `;
    return { ok: true as const, message, forDate };
  });

function nextDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + 1);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
}

function fallbackReview(cards: CardRow[]): string {
  const fail = cards.find((c) => c.result === "failed" && c.action_node);
  if (fail) {
    const name = NODE_BY_ID[fail.action_node!]?.en ?? "that move";
    const reason = fail.fail_reason ?? NODE_BY_ID[fail.action_node!]?.fail ?? "細節";
    const control = NODE_BY_ID[fail.action_node!]?.control ?? "把控制先做好";
    return `昨天${name}掉在${reason}。下次${control}。`;
  }
  const hit = cards.find((c) => c.action_node);
  if (hit) {
    const name = NODE_BY_ID[hit.action_node!]?.en ?? "that move";
    return `昨天練了${name}。下次滾輪時主動找一次。`;
  }
  return "昨天有上課。下次選一個位置，把同一條銜接再走一遍。";
}

export const markReviewRead = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((id: string) => id)
  .handler(async ({ context, data: id }) => {
    const sql = await getSql();
    await sql`update reviews set read = true where id = ${id} and user_id = ${context.userId}`;
    return { ok: true as const };
  });

export const seedDemo = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    await ensureProfile(context.userId);
    const existing = await sql<{ n: number }>`
      select count(*)::int as n from sessions where user_id = ${context.userId}
    `;
    if ((existing[0]?.n ?? 0) > 0) return { ok: true as const, seeded: false };

    const today = todayISO();
    const d = (offset: number) => {
      const [y, m, day] = today.split("-").map(Number);
      const dt = new Date(y, m - 1, day);
      dt.setDate(dt.getDate() - offset);
      const pad = (n: number) => String(n).padStart(2, "0");
      return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
    };

    const demos: SaveInput[] = [
      {
        trainedOn: d(1),
        gymName: "仁愛館",
        giType: "gi",
        durationMin: 90,
        kind: "mixed",
        notes: "閉鎖練三角，撐肘就掉；滾輪被膝切過兩次",
        photos: [],
        cards: [
          {
            fromNode: "closed_guard",
            actionNode: "triangle",
            toNode: null,
            result: "failed",
            failReason: "撐肘",
            count: 3,
            details: "閉鎖練三角，撐肘就掉",
            role: "attack",
          },
          {
            fromNode: "closed_guard",
            actionNode: "knee_cut",
            toNode: "side_control",
            result: "failed",
            failReason: "被單鉤撈回",
            count: 2,
            details: "滾輪被膝切過兩次",
            role: "defense",
          },
        ],
      },
      {
        trainedOn: d(4),
        gymName: "仁愛館",
        giType: "gi",
        durationMin: 75,
        kind: "drill",
        notes: "花掃成功一次；側控木村鑽研",
        photos: [],
        cards: [
          {
            fromNode: "closed_guard",
            actionNode: "flower_sweep",
            toNode: "mount",
            result: "success",
            failReason: null,
            count: 1,
            details: "控袖收腳，側翻上騎乘",
            role: "attack",
          },
          {
            fromNode: "side_control",
            actionNode: "kimura",
            toNode: null,
            result: "drill",
            failReason: null,
            count: 6,
            details: "側控近側木村，先把肘從地上拔起來",
            role: "attack",
          },
        ],
      },
      {
        trainedOn: d(8),
        gymName: "仁愛館",
        giType: "no-gi",
        durationMin: 60,
        kind: "roll",
        notes: "後背後裸絞成功；騎乘十字被藏肘",
        photos: [],
        cards: [
          {
            fromNode: "back",
            actionNode: "rnc",
            toNode: null,
            result: "success",
            failReason: null,
            count: 1,
            details: "雙鉤鎖背，掌貼二頭收肘",
            role: "attack",
          },
          {
            fromNode: "mount",
            actionNode: "armbar",
            toNode: null,
            result: "failed",
            failReason: "藏肘",
            count: 2,
            details: "騎乘十字被藏肘",
            role: "attack",
          },
        ],
      },
    ];

    for (const demo of demos) {
      const id = uid();
      await sql`
        insert into sessions (id, user_id, trained_on, gym_name, gi_type, duration_min, kind, notes)
        values (${id}, ${context.userId}, ${demo.trainedOn}, ${demo.gymName}, ${demo.giType}, ${demo.durationMin}, ${demo.kind}, ${demo.notes})
      `;
      for (const c of demo.cards) {
        await sql`
          insert into session_cards (
            id, session_id, user_id, from_node, action_node, to_node,
            result, fail_reason, count, details, role
          ) values (
            ${uid()}, ${id}, ${context.userId}, ${c.fromNode}, ${c.actionNode}, ${c.toNode},
            ${c.result}, ${c.failReason}, ${c.count}, ${c.details}, ${c.role}
          )
        `;
        await bumpTechnique(context.userId, c, demo.trainedOn, demo.kind);
        await bumpEdges(context.userId, c, demo.trainedOn);
      }
    }

    await sql`
      insert into reviews (id, user_id, session_id, for_date, message, read)
      values (
        ${uid()}, ${context.userId}, null, ${today},
        ${"Yesterday's Triangle failed on the posted elbow. Next time control the head before closing the legs."},
        false
      )
    `;

    // Accept none of the dashed edges — they stay as suggestions.
    return { ok: true as const, seeded: true };
  });
