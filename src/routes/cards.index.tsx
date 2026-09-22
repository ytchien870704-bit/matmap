import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { KIND_LABEL, NODES, PROFICIENCY_LABEL } from "@/lib/catalog";
import { listTechniqueCards } from "@/lib/server/bjj";

export const Route = createFileRoute("/cards/")({ component: CardsInner });

function CardsInner() {
  const q = useQuery({ queryKey: ["cards"], queryFn: () => listTechniqueCards() });
  const [qtext, setQtext] = useState("");
  const byId = useMemo(
    () => Object.fromEntries((q.data ?? []).map((c) => [c.actionNode, c])),
    [q.data],
  );
  const actions = NODES.filter((n) => n.kind !== "position");
  const filtered = actions.filter((n) => {
    const s = qtext.trim().toLowerCase();
    if (!s) return true;
    return (
      n.zh.includes(qtext.trim()) ||
      n.en.toLowerCase().includes(s) ||
      n.aliases.some((a) => a.toLowerCase().includes(s))
    );
  });

  return (
    <main className="px-5 pt-8">
      <h1 className="page-kicker font-display text-4xl">卡庫</h1>
      <Input
        className="mt-4"
        value={qtext}
        onChange={(e) => setQtext(e.target.value)}
        placeholder="triangle, armbar, closed guard…"
      />
      <ul className="mt-4 space-y-2">
        {filtered.map((n) => {
          const card = byId[n.id];
          const practiced = Boolean(card);
          return (
            <li key={n.id}>
              <Link
                to="/cards/$id"
                params={{ id: n.id }}
                className="flex items-center justify-between rounded-lg border border-border bg-surface px-4 py-3"
              >
                <div>
                  <p className={practiced ? "font-medium" : "text-muted"}>{n.en}</p>
                  <p className="text-xs text-muted">
                    {KIND_LABEL[n.kind]}
                    {card ? ` · ${PROFICIENCY_LABEL[card.proficiency]}` : ""}
                  </p>
                </div>
                <span className="tabular-nums text-sm text-muted">{card ? card.times : "—"}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
