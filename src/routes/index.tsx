import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Mic } from "lucide-react";
import { Authenticated } from "@/components/authenticated";
import { Logo } from "@/components/logo";
import { SessionComposer } from "@/components/session-composer";
import { Button } from "@/components/ui/button";
import { RESULT_LABEL, SESSION_KIND_LABEL, nodeLabel } from "@/lib/catalog";
import { getBootstrap, markReviewRead, seedDemo } from "@/lib/server/bjj";
import { formatZhDate } from "@/lib/utils";

export const Route = createFileRoute("/")({ component: TodayPage });

function TodayPage() {
  return (
    <Authenticated>
      <TodayInner />
    </Authenticated>
  );
}

function TodayInner() {
  const q = useQuery({ queryKey: ["bootstrap"], queryFn: () => getBootstrap() });
  const [open, setOpen] = useState(false);
  const data = q.data;

  return (
    <main className="px-5 pt-8">
      <header className="flex items-end justify-between">
        <div>
          <div className="flex items-center gap-2 text-muted">
            <Logo className="size-7" />
            <span className="text-xs tracking-seal">MATMAP</span>
          </div>
          <h1 className="page-kicker mt-4 font-display text-4xl">今天</h1>
          <p className="text-sm text-muted">{data ? formatZhDate(data.today) : " "}</p>
        </div>
      </header>

      {data?.review && !data.review.read && (
        <button
          type="button"
          onClick={() => {
            void markReviewRead({ data: data.review!.id }).then(() => q.refetch());
          }}
          className="mt-6 w-full rounded-lg border border-border bg-surface p-4 text-left scroll-card"
        >
          <p className="text-xs font-medium tracking-wide text-muted">隔日複習</p>
          <p className="mt-1 font-display text-xl leading-snug">{data.review.message}</p>
          <p className="mt-2 text-xs text-muted">點一下收掉</p>
        </button>
      )}

      <button
        type="button"
        onClick={() => setOpen(true)}
        className="stamp-face mt-6 flex h-36 w-full flex-col items-center justify-center gap-2 rounded-lg bg-primary text-primary-fg"
      >
        <Mic className="size-7" />
        <span className="font-display text-2xl">開始記錄</span>
        <span className="text-xs text-primary-fg/70">語音 20 秒 · 或點選 · 或拍白板</span>
      </button>

      {data && data.todaySessions.length > 0 && (
        <section className="mt-8">
          <h2 className="font-display text-xl">本堂</h2>
          <ul className="mt-3 space-y-3">
            {data.todaySessions.map((s) => (
              <li key={s.id}>
                <Link
                  to="/session/$id"
                  params={{ id: s.id }}
                  className="block rounded-lg border border-border bg-surface p-4"
                >
                  <p className="text-sm">
                    {s.gymName ?? "訓練"} · {s.giType === "gi" ? "Gi" : "No-Gi"} · {SESSION_KIND_LABEL[s.kind]}
                  </p>
                  <p className="mt-2 text-sm text-muted">
                    {s.cards
                      .slice(0, 3)
                      .map((c) => `${c.role === "defense" ? "被" : ""}${nodeLabel(c.actionNode)} ${RESULT_LABEL[c.result]}`)
                      .join(" · ")}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {data && !data.hasData && (
        <section className="mt-10 rounded-lg border border-dashed border-primary/35 bg-surface/60 p-5">
          <h2 className="font-display text-xl">墊上還是空白</h2>
          <p className="mt-2 text-sm text-muted">
            記一堂真實的課，圖才會變成你的系統。想先看看長什麼樣子，可以載入一週示範。
          </p>
          <Button
            variant="secondary"
            className="mt-4"
            onClick={async () => {
              await seedDemo();
              await q.refetch();
            }}
          >
            載入示範週
          </Button>
        </section>
      )}

      {data && data.hasData && data.todaySessions.length === 0 && (
        <p className="mt-8 text-sm text-muted">今天還沒記。下課兩分鐘就能寫完。</p>
      )}

      {open && data && (
        <SessionComposer
          gymDefault={data.profile.gymName}
          isPro={data.profile.isPro}
          onClose={() => setOpen(false)}
          onSaved={() => {
            setOpen(false);
            void q.refetch();
          }}
        />
      )}
    </main>
  );
}
