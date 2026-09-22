import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Chip } from "@/components/chip";
import { DiagramView } from "@/components/diagram-view";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { KIND_LABEL, NODE_BY_ID, PROFICIENCY_LABEL, failLabel, nodeLabel } from "@/lib/catalog";
import { diagramsFor, flipHands } from "@/lib/diagrams";
import { getBootstrap, listTechniqueCards, updateTechniqueCard } from "@/lib/server/bjj";
import type { Proficiency } from "@/lib/types";
import { formatZhDate } from "@/lib/utils";

export const Route = createFileRoute("/cards/$id")({ component: CardDetailInner });

function CardDetailInner() {
  const { id } = Route.useParams();
  const node = NODE_BY_ID[id];
  const qc = useQueryClient();
  const cardsQ = useQuery({ queryKey: ["cards"], queryFn: () => listTechniqueCards() });
  const boot = useQuery({ queryKey: ["bootstrap"], queryFn: () => getBootstrap() });
  const card = cardsQ.data?.find((c) => c.actionNode === id);
  const [custom, setCustom] = useState<string | null>(null);
  const [details, setDetails] = useState<string | null>(null);
  const [handFlip, setHandFlip] = useState(0);
  const isPro = boot.data?.profile.isPro ?? false;

  const save = useMutation({
    mutationFn: () =>
      updateTechniqueCard({
        data: {
          actionNode: id,
          customName: custom ?? card?.customName,
          details: details ?? card?.details,
        },
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["cards"] });
    },
  });

  const setProf = async (p: Proficiency) => {
    await updateTechniqueCard({ data: { actionNode: id, proficiency: p } });
    void qc.invalidateQueries({ queryKey: ["cards"] });
  };

  if (!node) {
    return (
      <main className="px-5 pt-8">
        <p>找不到這張卡。</p>
        <Link to="/cards" className="mt-4 inline-block text-sm text-primary">
          回卡庫
        </Link>
      </main>
    );
  }

  const specs = (card?.diagrams ?? diagramsFor(id)).map((s, i) =>
    i === 0 && handFlip % 2 === 1 ? flipHands(s) : s,
  );
  const failNotes = card?.failNotes ? Object.entries(card.failNotes) : [];

  return (
    <main className="px-5 pt-8">
      <Link to="/cards" className="text-sm text-muted">
        卡庫
      </Link>
      <p className="mt-4 text-xs uppercase tracking-wide text-muted">{KIND_LABEL[node.kind]}</p>
      <h1 className="font-display text-4xl">{node.en}</h1>

      <label className="mt-5 block text-xs text-muted">我的叫法</label>
      <Input
        className="mt-1"
        defaultValue={card?.customName ?? ""}
        placeholder="例如：老三角、館內叫法"
        onChange={(e) => setCustom(e.target.value)}
        onBlur={() => save.mutate()}
      />

      <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-md border border-border bg-surface p-3">
          <dt className="text-xs text-muted">從</dt>
          <dd>{node.from.map(nodeLabel).join(" · ") || "—"}</dd>
        </div>
        <div className="rounded-md border border-border bg-surface p-3">
          <dt className="text-xs text-muted">到</dt>
          <dd>{node.to.map(nodeLabel).join(" · ") || (node.kind === "finish" ? "Submission" : "—")}</dd>
        </div>
      </dl>

      <p className="mt-5 text-sm">
        控制：{node.control || "—"}
        <br />
        常見失敗：{node.fail || "—"}
      </p>
      {failNotes.length > 0 && (
        <p className="mt-2 text-sm text-muted">
          你的失敗：{failNotes.map(([k, v]) => `${failLabel(k)} ${v} 次`).join(" · ")}
        </p>
      )}

      <label className="mt-5 block text-xs text-muted">細節（最多三句）</label>
      <Textarea
        className="mt-1"
        defaultValue={card?.details ?? ""}
        maxLength={180}
        onChange={(e) => setDetails(e.target.value)}
        onBlur={() => save.mutate()}
      />

      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-medium">示意圖</p>
          {isPro && (
            <button type="button" className="text-xs text-primary" onClick={() => setHandFlip((n) => n + 1)}>
              這隻手反了，重畫
            </button>
          )}
        </div>
        <DiagramView nodeId={id} specs={specs} />
        {!isPro && <p className="mt-2 text-xs text-muted">示意圖重畫是 Pro。</p>}
      </div>

      <p className="mt-6 text-sm font-medium">熟練</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {(["seen", "drill", "roll"] as const).map((p) => (
          <Chip key={p} selected={(card?.proficiency ?? "seen") === p} onClick={() => void setProf(p)}>
            {PROFICIENCY_LABEL[p]}
          </Chip>
        ))}
      </div>
      <p className="mt-4 text-sm text-muted">
        {card ? (
          <>
            <span className="tabular-nums">{card.times}</span> 次
            {card.lastDate ? ` · 最近 ${formatZhDate(card.lastDate)}` : ""}
          </>
        ) : (
          "還沒記過這招"
        )}
      </p>
      <Button className="mt-6 w-full" variant="secondary" onClick={() => save.mutate()} disabled={save.isPending}>
        儲存卡片
      </Button>
    </main>
  );
}
