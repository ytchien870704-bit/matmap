import { useState } from "react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GROK_PROVIDERS, authClient, authEnabled, signIn } from "@/lib/auth/client";

export function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"in" | "up">("in");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submitEmail = async () => {
    setBusy(true);
    setError(null);
    try {
      if (mode === "up") {
        const { error: err } = await authClient.signUp.email({
          email,
          password,
          name: email.split("@")[0],
        });
        if (err) throw new Error(err.message);
      } else {
        const { error: err } = await authClient.signIn.email({ email, password });
        if (err) throw new Error(err.message);
      }
      window.location.assign("/");
    } catch (e) {
      setError(e instanceof Error ? e.message : "登入失敗");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="relative mx-auto flex min-h-dvh max-w-lg flex-col justify-center bg-bg px-6 py-12">
      <p className="vertical-seal pointer-events-none absolute right-5 top-16 font-display text-sm text-primary/45">
        柔術目録
      </p>
      <div className="mb-10">
        <Logo className="size-14" />
        <p className="mt-6 text-xs tracking-seal text-muted">MATMAP</p>
        <h1 className="mt-2 font-display text-4xl">MatMap</h1>
        <p className="mt-3 max-w-xs text-muted">
          記下今天練過的招，串成你的系統。不是世界地圖，是你的 A-game。
        </p>
      </div>

      {authEnabled ? (
        <div className="space-y-3">
          {GROK_PROVIDERS.map((p) => (
            <Button
              key={p.providerId}
              variant="secondary"
              className="w-full"
              onClick={() => signIn(p.providerId, { callbackURL: "/" })}
            >
              使用 {p.label} 繼續
            </Button>
          ))}
          <div className="relative py-3 text-center text-xs tracking-widest text-muted">
            <span className="bg-bg px-2">或電子郵件</span>
          </div>
          <Input
            type="email"
            autoComplete="email"
            placeholder="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            type="password"
            autoComplete={mode === "up" ? "new-password" : "current-password"}
            placeholder="密碼（至少 8 碼）"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p className="text-sm text-danger">{error}</p>}
          <Button
            className="w-full"
            disabled={busy || !email || password.length < 8}
            onClick={() => void submitEmail()}
          >
            {mode === "in" ? "登入" : "建立帳號"}
          </Button>
          <button
            type="button"
            className="w-full text-center text-sm text-muted"
            onClick={() => setMode(mode === "in" ? "up" : "in")}
          >
            {mode === "in" ? "還沒有帳號？建立一個" : "已有帳號？登入"}
          </button>
        </div>
      ) : (
        <p className="text-sm text-muted">登入尚未開啟。</p>
      )}
    </main>
  );
}

export function Splash() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col justify-center bg-bg px-6 py-12">
      <Logo className="size-14" />
      <p className="mt-6 text-xs tracking-seal text-muted">MATMAP</p>
      <h1 className="mt-2 font-display text-4xl">MatMap</h1>
      <p className="mt-2 text-muted">墊上系統 · 載入中</p>
    </main>
  );
}
