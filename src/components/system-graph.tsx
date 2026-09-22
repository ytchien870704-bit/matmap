import { useMemo, useState } from "react";
import { GRAPH_VIEWBOX, KIND_LABEL, NODE_BY_ID, NODES, SUGGESTED_EDGES, failLabel, nodeLabel, nodeShort } from "@/lib/catalog";
import { acceptSuggestedEdge } from "@/lib/server/bjj";
import type { GraphPayload } from "@/lib/types";
import { cn } from "@/lib/utils";

const SCALE_Y = 0.8;

export function SystemGraph({
  data,
  onChanged,
}: {
  data: GraphPayload;
  onChanged: () => void;
}) {
  const [focus, setFocus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const practiced = useMemo(() => new Set(data.practicedNodeIds), [data.practicedNodeIds]);
  const solid = useMemo(() => {
    const s = new Set<string>();
    for (const e of data.edges) s.add(`${e.fromNode}->${e.toNode}`);
    return s;
  }, [data.edges]);

  const dashed = SUGGESTED_EDGES.filter((e) => !solid.has(`${e.from}->${e.to}`));
  const stats = focus ? data.nodeStats[focus] : null;
  const node = focus ? NODE_BY_ID[focus] : null;
  const h = Math.round(GRAPH_VIEWBOX.h * SCALE_Y);

  const accept = async (from: string, to: string) => {
    setBusy(true);
    await acceptSuggestedEdge({ data: { from, to } });
    setBusy(false);
    onChanged();
  };

  const ny = (y: number) => Math.round(y * SCALE_Y);

  return (
    <div>
      <div className="-mx-4 overflow-x-auto overscroll-x-contain px-4">
        <svg
        viewBox={`0 0 ${GRAPH_VIEWBOX.w} ${h}`}
        className="block w-[820px] max-w-none"
        role="img"
        aria-label="我的系統"
      >
        <rect width={GRAPH_VIEWBOX.w} height={h} fill="transparent" />
        {dashed.map((e) => {
          const a = NODE_BY_ID[e.from];
          const b = NODE_BY_ID[e.to];
          if (!a || !b) return null;
          const dim = focus && focus !== e.from && focus !== e.to;
          return (
            <line
              key={`d-${e.from}-${e.to}`}
              x1={a.x}
              y1={ny(a.y)}
              x2={b.x}
              y2={ny(b.y)}
              stroke="var(--color-primary)"
              strokeWidth={1.2}
              strokeDasharray="5 5"
              opacity={dim ? 0.1 : 0.4}
            />
          );
        })}
        {data.edges.map((e) => {
          const a = NODE_BY_ID[e.fromNode];
          const b = NODE_BY_ID[e.toNode];
          if (!a || !b) return null;
          const dim = focus && focus !== e.fromNode && focus !== e.toNode;
          return (
            <line
              key={`${e.source}-${e.fromNode}-${e.toNode}`}
              x1={a.x}
              y1={ny(a.y)}
              x2={b.x}
              y2={ny(b.y)}
              stroke="var(--color-fg)"
              strokeWidth={Math.min(5, 1.8 + e.times * 0.45)}
              opacity={dim ? 0.12 : 0.88}
            />
          );
        })}
        {NODES.map((n) => {
          const on = practiced.has(n.id);
          const dim = focus && focus !== n.id && !isNeighbor(focus, n.id, data, dashed);
          const r = n.kind === "position" ? 30 : 20;
          const label = nodeShort(n.id);
          return (
            <g
              key={n.id}
              transform={`translate(${n.x}, ${ny(n.y)})`}
              opacity={dim ? 0.22 : 1}
              className="cursor-pointer"
              onClick={() => setFocus(focus === n.id ? null : n.id)}
            >
              <circle
                r={r}
                fill={on ? "var(--color-fg)" : "var(--color-surface)"}
                stroke={on ? "var(--color-fg)" : "var(--color-muted)"}
                strokeWidth={on ? 0 : 1.5}
              />
              <text
                textAnchor="middle"
                y={4}
                fontSize={label.length > 5 ? 8 : label.length > 3 ? 10 : 11}
                fill={on ? "var(--color-primary-fg)" : "var(--color-fg)"}
                fontFamily="Zen Kaku Gothic New, sans-serif"
                fontWeight={600}
              >
                {label}
              </text>
            </g>
          );
        })}
      </svg>
      </div>

      {node && (
        <div className="mt-4 rounded-lg bg-surface p-4 scroll-card">
          <p className="text-xs uppercase tracking-wide text-muted">{KIND_LABEL[node.kind]}</p>
          <h2 className="font-display text-2xl">{node.en}</h2>
          {stats ? (
            <div className="mt-3 space-y-2 text-sm">
              {stats.actions.map((a) => {
                const reasons = Object.entries(a.failReasons)
                  .sort((x, y) => y[1] - x[1])
                  .map(([k, v]) => `${v} lost to ${failLabel(k)}`)
                  .join(" · ");
                return (
                  <p key={a.id}>
                    <span className="font-medium">{nodeLabel(a.id)}</span>
                    <span className="tabular-nums text-muted">
                      {" "}
                      {a.times} 次{reasons ? `（${reasons}）` : ""}
                    </span>
                  </p>
                );
              })}
              {stats.passedBy.map((p) => (
                <p key={p.id}>
                  被 {nodeLabel(p.id)}
                  <span className="tabular-nums text-muted"> {p.times} 次</span>
                </p>
              ))}
              {stats.actions.length === 0 && stats.passedBy.length === 0 && (
                <p className="text-muted">有經過這個位置，但還沒記下具體動作。</p>
              )}
            </div>
          ) : (
            <p className="mt-3 text-sm text-muted">還沒練過。淡的節點是底圖。</p>
          )}
          {node.control && (
            <p className="mt-3 text-sm">
              控制：{node.control}
              {node.fail ? `　常見失敗：${node.fail}` : ""}
            </p>
          )}
          <div className="mt-3 space-y-2">
            {dashed
              .filter((e) => e.from === focus)
              .map((e) => (
                <button
                  key={`${e.from}-${e.to}`}
                  type="button"
                  disabled={busy}
                  onClick={() => void accept(e.from, e.to)}
                  className={cn(
                    "flex h-11 w-full items-center justify-between rounded-md border border-dashed border-primary/50 px-3 text-sm",
                  )}
                >
                  <span>下一步常接 {nodeLabel(e.to)}</span>
                  <span className="text-primary">收進系統</span>
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

function isNeighbor(
  focus: string,
  id: string,
  data: GraphPayload,
  dashed: { from: string; to: string }[],
) {
  return (
    data.edges.some((e) => (e.fromNode === focus && e.toNode === id) || (e.toNode === focus && e.fromNode === id)) ||
    dashed.some((e) => (e.from === focus && e.to === id) || (e.to === focus && e.from === id))
  );
}
