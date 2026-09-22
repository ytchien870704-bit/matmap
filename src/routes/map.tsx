import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Authenticated } from "@/components/authenticated";
import { SystemGraph } from "@/components/system-graph";
import { getGraph } from "@/lib/server/bjj";

export const Route = createFileRoute("/map")({ component: MapPage });

function MapPage() {
  return (
    <Authenticated>
      <MapInner />
    </Authenticated>
  );
}

function MapInner() {
  const q = useQuery({ queryKey: ["graph"], queryFn: () => getGraph() });
  return (
    <main className="px-4 pt-8">
      <h1 className="page-kicker px-1 font-display text-4xl">我的系統</h1>
      <p className="mt-2 px-1 text-sm text-muted">實線是你練過的銜接。虛線是底圖建議，點一下才收進來。</p>
      <div className="ink-rule mx-1 mt-4" />
      <div className="mt-4 flex gap-3 px-1 text-xs text-muted">
        <span className="flex items-center gap-1">
          <i className="inline-block size-2.5 rounded-full bg-fg" /> 練過
        </span>
        <span className="flex items-center gap-1">
          <i className="inline-block size-2.5 rounded-full border border-muted bg-surface" /> 還沒
        </span>
        <span>實線＝你的 · 虛線＝建議</span>
      </div>
      {q.data && <SystemGraph data={q.data} onChanged={() => void q.refetch()} />}
    </main>
  );
}
