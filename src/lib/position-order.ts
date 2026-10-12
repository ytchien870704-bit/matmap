/**
 * Order the composer's position chips so the athlete's likely starting position
 * is already on screen (only ~4 chips fit at 402px before a sideways swipe).
 *
 * Pure + dependency-free so it runs under `node --test` without the app bundle.
 */

/** Fallback for new athletes: the positions most classes start from. */
export const DEFAULT_POSITION_ORDER = [
  "closed_guard",
  "half_guard",
  "side_control",
  "mount",
  "back",
  "open_guard",
  "butterfly",
  "de_la_riva",
  "turtle",
  "knee_on_belly",
  "north_south",
  "standing",
  "deep_half",
  "spider",
  "lasso",
  "single_x",
  "reverse_dlr",
  "fifty_fifty",
  "knee_cut_mid",
] as const;

/** Usage from ~a month ago counts half as much as today's. */
const HALF_LIFE_DAYS = 30;

export type PositionHistory = {
  trainedOn: string;
  cards: { fromNode: string | null }[];
}[];

function dayNumber(iso: string): number {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  return Math.floor(Date.UTC(y, (m || 1) - 1, d || 1) / 86_400_000);
}

/**
 * Most-used (recency-weighted) positions first; ties and never-used positions
 * fall back to DEFAULT_POSITION_ORDER, then to the catalog order.
 */
export function orderPositions<T extends { id: string }>(
  nodes: readonly T[],
  history: PositionHistory,
  today: string,
  defaults: readonly string[] = DEFAULT_POSITION_ORDER,
): T[] {
  const now = dayNumber(today);
  const score = new Map<string, number>();
  const last = new Map<string, number>();
  for (const session of history) {
    const day = dayNumber(session.trainedOn);
    const weight = Math.pow(0.5, Math.max(0, now - day) / HALF_LIFE_DAYS);
    for (const card of session.cards) {
      if (!card.fromNode) continue;
      score.set(card.fromNode, (score.get(card.fromNode) ?? 0) + weight);
      last.set(card.fromNode, Math.max(last.get(card.fromNode) ?? -Infinity, day));
    }
  }
  const fallback = (id: string, i: number) => {
    const d = defaults.indexOf(id);
    return d === -1 ? defaults.length + i : d;
  };
  return nodes
    .map((node, i) => ({ node, s: score.get(node.id) ?? 0, l: last.get(node.id) ?? -Infinity, f: fallback(node.id, i) }))
    .sort((a, b) => b.s - a.s || b.l - a.l || a.f - b.f)
    .map((x) => x.node);
}
