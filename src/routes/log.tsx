import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Authenticated } from "@/components/authenticated";
import { RESULT_LABEL, SESSION_KIND_LABEL, failLabel, nodeLabel } from "@/lib/catalog";
import { getBootstrap } from "@/lib/server/bjj";
import { formatZhFullDate } from "@/lib/utils";

export const Route = createFileRoute("/log")({ component: LogPage });

function LogPage() {
  return (
    <Authenticated>
      <LogInner />
    </Authenticated>
  );
}

function LogInner() {
  const q = useQuery({ queryKey: ["bootstrap"], queryFn: () => getBootstrap() });
  const sessions = q.data?.sessions ?? [];
  const groups = new Map<string, typeof sessions>();
  for (const s of sessions) {
    const list = groups.get(s.trainedOn) ?? [];
    list.push(s);
    groups.set(s.trainedOn, list);
  }

  return (
    <main className="px-5 pt-8">
      <h1 className="page-kicker font-display text-4xl">日誌</h1>
      <p className="mt-1 text-sm text-muted">按日期</p>
      {sessions.length === 0 && (
        <p className="mt-10 text-sm text-muted">還沒有課。回今天記第一堂。</p>
      )}
      <div className="mt-6 space-y-8">
        {[...groups.entries()].map(([date, list]) => (
          <section key={date}>
            <h2 className="text-sm font-medium text-muted">{formatZhFullDate(date)}</h2>
            <ul className="mt-2 space-y-2">
              {list.map((s) => (
                <li key={s.id}>
                  <Link
                    to="/session/$id"
                    params={{ id: s.id }}
                    className="block rounded-lg border border-border bg-surface p-4"
                  >
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="font-medium">
                        {s.gymName ?? "訓練"} · {s.giType === "gi" ? "Gi" : "No-Gi"}
                      </p>
                      <p className="text-xs tabular-nums text-muted">
                        {s.durationMin ? `${s.durationMin} 分` : ""} {SESSION_KIND_LABEL[s.kind]}
                      </p>
                    </div>
                    <ul className="mt-2 space-y-1">
                      {s.cards.map((c) => (
                        <li key={c.id} className="text-sm text-muted">
                          {c.role === "defense" ? "被 " : ""}
                          {nodeLabel(c.actionNode)} · {nodeLabel(c.fromNode)} · {RESULT_LABEL[c.result]}
                          {c.failReason ? ` · ${failLabel(c.failReason)}` : ""}
                          {c.count > 1 ? ` ×${c.count}` : ""}
                        </li>
                      ))}
                    </ul>
                    {s.photos.length > 0 && (
                      <p className="mt-2 text-xs text-muted">白板 {s.photos.length} 張</p>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </main>
  );
}
