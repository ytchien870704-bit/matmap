import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Authenticated } from "@/components/authenticated";
import { Button } from "@/components/ui/button";
import { RESULT_LABEL, SESSION_KIND_LABEL, failLabel, nodeLabel } from "@/lib/catalog";
import { deleteSession, getBootstrap } from "@/lib/server/bjj";
import { formatZhFullDate } from "@/lib/utils";

export const Route = createFileRoute("/session/$id")({ component: SessionPage });

function SessionPage() {
  return (
    <Authenticated>
      <SessionInner />
    </Authenticated>
  );
}

function SessionInner() {
  const { id } = Route.useParams();
  const nav = useNavigate();
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["bootstrap"], queryFn: () => getBootstrap() });
  const s = q.data?.sessions.find((x) => x.id === id);

  if (q.isPending) return <main className="px-5 pt-8 text-muted">讀取中</main>;
  if (!s) {
    return (
      <main className="px-5 pt-8">
        <p>找不到這堂課。</p>
        <Link to="/log" className="mt-3 inline-block text-sm text-primary">
          回日誌
        </Link>
      </main>
    );
  }

  return (
    <main className="px-5 pt-8">
      <Link to="/log" className="text-sm text-muted">
        日誌
      </Link>
      <h1 className="mt-3 font-display text-3xl">{s.gymName ?? "訓練"}</h1>
      <p className="text-sm text-muted">
        {formatZhFullDate(s.trainedOn)} · {s.giType === "gi" ? "Gi" : "No-Gi"} · {SESSION_KIND_LABEL[s.kind]}
        {s.durationMin ? ` · ${s.durationMin} 分` : ""}
      </p>
      {s.notes && <p className="mt-4 text-sm">{s.notes}</p>}
      <ul className="mt-6 space-y-3">
        {s.cards.map((c) => (
          <li key={c.id} className="rounded-lg border border-border bg-surface p-4">
            <p className="font-medium">
              {c.role === "defense" ? "被 " : ""}
              {nodeLabel(c.actionNode)}
              {c.count > 1 ? ` ×${c.count}` : ""}
            </p>
            <p className="text-sm text-muted">
              {nodeLabel(c.fromNode)}
              {c.toNode ? ` → ${nodeLabel(c.toNode)}` : ""} · {RESULT_LABEL[c.result]}
              {c.failReason ? ` · ${failLabel(c.failReason)}` : ""}
            </p>
            {c.details && <p className="mt-2 text-sm">{c.details}</p>}
            {c.actionNode && (
              <Link to="/cards/$id" params={{ id: c.actionNode }} className="mt-2 inline-block text-xs text-primary">
                看招式卡
              </Link>
            )}
          </li>
        ))}
      </ul>
      {s.photos.length > 0 && (
        <div className="mt-6 grid grid-cols-2 gap-2">
          {s.photos.map((p) => (
            <img key={p.id} src={p.dataUrl} alt="白板" className="h-40 w-full rounded-xl object-cover" />
          ))}
        </div>
      )}
      <Button
        variant="ghost"
        className="mt-8 text-danger"
        onClick={async () => {
          await deleteSession({ data: id });
          await qc.invalidateQueries({ queryKey: ["bootstrap"] });
          await qc.invalidateQueries({ queryKey: ["graph"] });
          await qc.invalidateQueries({ queryKey: ["cards"] });
          nav({ to: "/log" });
        }}
      >
        刪除這堂
      </Button>
    </main>
  );
}
