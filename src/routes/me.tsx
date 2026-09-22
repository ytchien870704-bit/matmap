import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { UserButton } from "@/lib/auth/gates";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { Authenticated } from "@/components/authenticated";
import { Chip } from "@/components/chip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getBootstrap, updateProfile } from "@/lib/server/bjj";
import type { GiPreference } from "@/lib/types";

export const Route = createFileRoute("/me")({ component: MePage });

function MePage() {
  return (
    <Authenticated>
      <MeInner />
    </Authenticated>
  );
}

function MeInner() {
  const user = useCurrentUser();
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["bootstrap"], queryFn: () => getBootstrap() });
  const p = q.data?.profile;

  const save = async (patch: Parameters<typeof updateProfile>[0]["data"]) => {
    await updateProfile({ data: patch });
    await qc.invalidateQueries({ queryKey: ["bootstrap"] });
  };

  return (
    <main className="px-5 pt-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="page-kicker font-display text-4xl">我的</h1>
          <p className="mt-1 text-sm text-muted">{user?.primaryEmail ?? user?.displayName ?? ""}</p>
        </div>
        <UserButton />
      </div>

      <section className="mt-8">
        <label className="text-xs text-muted">館</label>
        <Input
          className="mt-1"
          defaultValue={p?.gymName ?? ""}
          placeholder="例如：仁愛館"
          onBlur={(e) => void save({ gymName: e.target.value })}
        />
      </section>

      <section className="mt-6">
        <p className="text-xs text-muted">Gi / No-Gi</p>
        <div className="mt-2 flex gap-2">
          {(["gi", "no-gi", "both"] as GiPreference[]).map((g) => (
            <Chip key={g} selected={p?.giPreference === g} onClick={() => void save({ giPreference: g })}>
              {g === "gi" ? "Gi" : g === "no-gi" ? "No-Gi" : "都練"}
            </Chip>
          ))}
        </div>
      </section>

      <section className="mt-10 rounded-lg bg-surface p-5 scroll-card">
        <p className="text-xs tracking-wide text-muted">訂閱</p>
        <h2 className="mt-1 font-display text-2xl">{p?.isPro ? "Pro 試用中" : "免費"}</h2>
        <p className="mt-2 text-sm text-muted">
          免費：點選記錄、圖、卡。Pro：語音、示意圖重畫、隔日複習、匯出 PDF。NT$149–199／月，測完再收費。
        </p>
        <Button
          className="mt-4 w-full"
          variant={p?.isPro ? "secondary" : "primary"}
          onClick={() => void save({ isPro: !p?.isPro })}
        >
          {p?.isPro ? "改回免費" : "開啟 Pro 試用"}
        </Button>
      </section>

      <section className="mt-8">
        <h2 className="font-display text-xl">匯出</h2>
        <p className="mt-1 text-sm text-muted">把卡庫印成給自己的一頁紙。</p>
        <Button
          className="mt-3"
          variant="secondary"
          disabled={!p?.isPro}
          onClick={() => window.print()}
        >
          {p?.isPro ? "列印／存 PDF" : "Pro 才能匯出"}
        </Button>
      </section>
      <p className="mt-12 text-xs text-muted">MatMap · 墊上系統。沒有動態牆，沒有排行榜。</p>
    </main>
  );
}
