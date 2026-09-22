import { diagramsFor, renderDiagramSvg } from "@/lib/diagrams";
import type { DiagramSpec } from "@/lib/types";
import { cn } from "@/lib/utils";

export function DiagramView({
  nodeId,
  specs,
  className,
}: {
  nodeId?: string;
  specs?: DiagramSpec[] | null;
  className?: string;
}) {
  const list = (specs && specs.length > 0 ? specs : nodeId ? diagramsFor(nodeId) : []).slice(0, 3);
  if (list.length === 0) return null;
  return (
    <div className={cn("grid gap-3", list.length > 1 ? "sm:grid-cols-2" : "", className)}>
      {list.map((spec, i) => (
        <div
          key={`${spec.mePose}-${i}`}
          className="overflow-hidden rounded-md border border-border bg-opp"
          dangerouslySetInnerHTML={{ __html: renderDiagramSvg(spec) }}
        />
      ))}
    </div>
  );
}
