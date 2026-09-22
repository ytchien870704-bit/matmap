import { useEffect, useRef, useState } from "react";
import { Camera, Check, Mic, Square, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Chip } from "@/components/chip";
import {
  FAIL_REASONS,
  NODE_BY_ID,
  actionsFrom,
  failLabel,
  nodeLabel,
  parseUtterance,
  positions,
} from "@/lib/catalog";
import { parseVoice, saveSession, generateReview, transcribeAudio } from "@/lib/server/bjj";
import type { CardResult, CardRole, GiType, ParsedCardDraft, SessionKind } from "@/lib/types";
import { cn, todayISO } from "@/lib/utils";

type Draft = ParsedCardDraft & { id: string };

function rid() {
  return Math.random().toString(36).slice(2);
}

async function compressImage(file: File): Promise<string> {
  const img = document.createElement("img");
  const url = URL.createObjectURL(file);
  img.crossOrigin = "anonymous";
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("image"));
    img.src = url;
  });
  const max = 880;
  const scale = Math.min(1, max / Math.max(img.width, img.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(img.width * scale));
  canvas.height = Math.max(1, Math.round(img.height * scale));
  canvas.getContext("2d")?.drawImage(img, 0, 0, canvas.width, canvas.height);
  URL.revokeObjectURL(url);
  return canvas.toDataURL("image/jpeg", 0.7);
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const r = String(reader.result ?? "");
      resolve(r.includes(",") ? r.slice(r.indexOf(",") + 1) : r);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export function SessionComposer({
  gymDefault,
  isPro,
  onClose,
  onSaved,
}: {
  gymDefault: string | null;
  isPro: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [gym, setGym] = useState(gymDefault ?? "");
  const [giType, setGiType] = useState<GiType>("gi");
  const [kind, setKind] = useState<SessionKind>("mixed");
  const [duration, setDuration] = useState("90");
  const [from, setFrom] = useState<string | null>(null);
  const [action, setAction] = useState<string | null>(null);
  const [result, setResult] = useState<CardResult>("drill");
  const [fail, setFail] = useState<string | null>(null);
  const [role, setRole] = useState<CardRole>("attack");
  const [cards, setCards] = useState<Draft[]>([]);
  const [photos, setPhotos] = useState<string[]>([]);
  const [transcript, setTranscript] = useState("");
  const [listening, setListening] = useState(false);
  const [seconds, setSeconds] = useState(20);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const recognitionRef = useRef<{ stop: () => void } | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      recRef.current?.stop();
      recognitionRef.current?.stop();
    };
  }, []);

  const addCard = (draft?: Partial<Draft>) => {
    const fromNode = draft?.fromNode ?? from;
    const actionNode = draft?.actionNode ?? action;
    if (!fromNode && !actionNode) return;
    const node = actionNode ? NODE_BY_ID[actionNode] : null;
    const next: Draft = {
      id: rid(),
      fromNode,
      actionNode,
      toNode: draft?.toNode ?? node?.to[0] ?? null,
      result: draft?.result ?? result,
      failReason: (draft?.result ?? result) === "failed" ? (draft?.failReason ?? fail) : null,
      count: draft?.count ?? 1,
      details: draft?.details ?? "",
      role: draft?.role ?? role,
    };
    setCards((c) => [...c, next]);
    setAction(null);
    setFail(null);
    // Keep result + role sticky so consecutive chip taps stay in the same mode
    // (log-a-class must stay the fastest free path).
  };

  const startTimer = (onDone: () => void) => {
    setListening(true);
    setSeconds(20);
    timerRef.current = window.setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          onDone();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  };

  const clearTimer = () => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = null;
    setListening(false);
  };

  const startVoice = async () => {
    setError(null);
    if (!isPro) {
      setError("語音是 Pro。先點選位置與動作也能記。");
      return;
    }
    const w = window as unknown as {
      SpeechRecognition?: new () => {
        lang: string;
        interimResults: boolean;
        continuous: boolean;
        onresult: ((ev: {
          resultIndex: number;
          results: ArrayLike<{ isFinal: boolean; 0?: { transcript?: string } }>;
        }) => void) | null;
        onerror: (() => void) | null;
        onend: (() => void) | null;
        start: () => void;
        stop: () => void;
      };
      webkitSpeechRecognition?: new () => {
        lang: string;
        interimResults: boolean;
        continuous: boolean;
        onresult: ((ev: {
          resultIndex: number;
          results: ArrayLike<{ isFinal: boolean; 0?: { transcript?: string } }>;
        }) => void) | null;
        onerror: (() => void) | null;
        onend: (() => void) | null;
        start: () => void;
        stop: () => void;
      };
    };
    const SpeechRecognition = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.lang = "zh-TW";
      rec.interimResults = true;
      rec.continuous = true;
      let finalText = "";
      rec.onresult = (ev) => {
        let interim = "";
        for (let i = ev.resultIndex; i < ev.results.length; i++) {
          const piece = ev.results[i][0]?.transcript ?? "";
          if (ev.results[i].isFinal) finalText += piece;
          else interim += piece;
        }
        setTranscript((finalText + " " + interim).trim());
      };
      rec.onerror = () => {
        /* fall through to typed input */
      };
      rec.onend = () => {
        clearTimer();
        const text = finalText.trim();
        if (text) void runParse(text);
      };
      recognitionRef.current = rec;
      rec.start();
      startTimer(() => rec.stop());
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      chunksRef.current = [];
      rec.ondataavailable = (e) => {
        if (e.data.size) chunksRef.current.push(e.data);
      };
      rec.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        clearTimer();
        const blob = new Blob(chunksRef.current, { type: rec.mimeType || "audio/webm" });
        const b64 = await blobToBase64(blob);
        setBusy(true);
        const tr = await transcribeAudio({ data: { audioBase64: b64, mimeType: blob.type } });
        setBusy(false);
        if (!tr.ok) {
          setError(tr.error);
          return;
        }
        if (tr.text) {
          setTranscript(tr.text);
          await runParse(tr.text);
        }
      };
      recRef.current = rec;
      rec.start();
      startTimer(() => rec.stop());
    } catch {
      setError("沒有麥克風權限。改打字或點選。");
    }
  };

  const stopVoice = () => {
    recognitionRef.current?.stop();
    try {
      recRef.current?.stop();
    } catch {
      /* already stopped */
    }
    clearTimer();
  };

  const runParse = async (text: string) => {
    const local = parseUtterance(text);
    if (local.kindHint) setKind(local.kindHint);
    if (local.cards.length > 0) {
      for (const c of local.cards) addCard({ ...c, id: rid() });
      return;
    }
    setBusy(true);
    try {
      const parsed = await parseVoice({ data: { text } });
      if (!parsed.ok) return;
      if (parsed.kindHint) setKind(parsed.kindHint);
      for (const c of parsed.cards) addCard({ ...c, id: rid() });
    } finally {
      setBusy(false);
    }
  };

  const onPhoto = async (file: File | undefined) => {
    if (!file) return;
    try {
      const dataUrl = await compressImage(file);
      setPhotos((p) => [...p, dataUrl].slice(0, 4));
    } catch {
      setError("照片讀取失敗");
    }
  };

  const save = async () => {
    if (cards.length === 0 && photos.length === 0) {
      setError("先加一張卡，或拍一張白板。");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await saveSession({
        data: {
          trainedOn: todayISO(),
          gymName: gym || null,
          giType,
          durationMin: Number(duration) || null,
          kind,
          notes: transcript || null,
          cards: cards.map(({ id: _id, ...c }) => c),
          photos: photos.map((dataUrl) => ({ dataUrl })),
        },
      });
      if (isPro) {
        try {
          await generateReview({ data: { sessionId: res.id } });
        } catch {
          /* review is optional */
        }
      }
      onSaved();
    } catch {
      setError("儲存失敗，再試一次。");
    } finally {
      setBusy(false);
    }
  };

  const actionChips = actionsFrom(from);

  return (
    <div className="fixed inset-0 z-40 mx-auto flex max-w-lg flex-col bg-bg">
      <header
        className="flex items-center justify-between border-b border-border px-4 py-3"
        style={{ paddingTop: "max(12px, env(safe-area-inset-top))" }}
      >
        <button type="button" onClick={onClose} className="flex size-11 items-center justify-center rounded-lg" aria-label="關閉">
          <X className="size-5" />
        </button>
        <div className="text-center">
          <p className="font-display text-lg">今天的課</p>
          <p className="text-xs text-muted">語音、點選、照片可混用</p>
        </div>
        <Button size="sm" onClick={save} disabled={busy}>
          {busy ? "…" : "儲存"}
        </Button>
      </header>

      <div className="flex-1 space-y-6 overflow-y-auto px-4 py-4">
        <div className="flex flex-wrap gap-2">
          <Input
            value={gym}
            onChange={(e) => setGym(e.target.value)}
            placeholder="館名"
            className="h-10 w-32"
          />
          <Chip selected={giType === "gi"} onClick={() => setGiType("gi")}>
            Gi
          </Chip>
          <Chip selected={giType === "no-gi"} onClick={() => setGiType("no-gi")}>
            No-Gi
          </Chip>
          <Chip selected={kind === "drill"} onClick={() => setKind("drill")}>
            只鑽
          </Chip>
          <Chip selected={kind === "roll"} onClick={() => setKind("roll")}>
            滾輪
          </Chip>
          <Chip selected={kind === "mixed"} onClick={() => setKind("mixed")}>
            鑽＋滾
          </Chip>
          <Input
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            inputMode="numeric"
            className="h-10 w-20"
            aria-label="時長"
          />
          <span className="self-center text-xs text-muted">分鐘</span>
        </div>

        <section className="rounded-lg border border-border bg-surface p-4 scroll-card">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">語音 20 秒</p>
            {!isPro && <span className="text-xs text-muted">Pro</span>}
          </div>
          <button
            type="button"
            onClick={listening ? stopVoice : () => void startVoice()}
            className={cn(
              "mt-3 flex h-20 w-full items-center justify-center gap-3 rounded-md border border-border transition-colors",
              listening ? "bg-primary text-primary-fg" : "bg-bg text-fg",
            )}
          >
            {listening ? <Square className="size-5" /> : <Mic className="size-6" />}
            <span className="font-display text-xl tabular-nums">
              {listening ? `0:${String(seconds).padStart(2, "0")}` : "開始說"}
            </span>
          </button>
          <p className="mt-2 text-xs text-muted">
            「Closed guard triangle, posted and lost; got knee-cut twice」
          </p>
          <Input
            className="mt-3"
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="或把剛才說的打在這"
            onKeyDown={(e) => {
              if (e.key === "Enter" && transcript.trim()) void runParse(transcript);
            }}
          />
          {transcript && (
            <Button
              variant="secondary"
              size="sm"
              className="mt-2"
              onClick={() => void runParse(transcript)}
              disabled={busy}
            >
              拆成卡片
            </Button>
          )}
        </section>

        <section>
          <p className="mb-2 text-sm font-medium">位置</p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {positions().map((n) => (
              <Chip key={n.id} selected={from === n.id} onClick={() => setFrom(from === n.id ? null : n.id)}>
                {n.en}
              </Chip>
            ))}
          </div>
        </section>

        <section>
          <p className="mb-2 text-sm font-medium">動作 · 點一下就入卡（沿用上方結果）</p>
          <div className="flex flex-wrap gap-2">
            {actionChips.map((n) => (
              <Chip
                key={n.id}
                selected={action === n.id}
                onClick={() => {
                  setAction(n.id);
                  addCard({
                    actionNode: n.id,
                    fromNode: from ?? n.from[0] ?? null,
                  });
                }}
              >
                {n.en}
              </Chip>
            ))}
          </div>
        </section>

        <section className="flex flex-wrap gap-2">
          {(["drill", "success", "failed"] as const).map((r) => (
            <Chip key={r} selected={result === r} onClick={() => setResult(r)}>
              {r === "drill" ? "鑽研" : r === "success" ? "成功" : "被破"}
            </Chip>
          ))}
          <Chip selected={role === "defense"} onClick={() => setRole(role === "defense" ? "attack" : "defense")}>
            {role === "defense" ? "我被過／被鎖" : "我進攻"}
          </Chip>
        </section>

        {result === "failed" && (
          <section>
            <p className="mb-2 text-sm font-medium">常見失敗</p>
            <div className="flex flex-wrap gap-2">
              {FAIL_REASONS.map((f) => (
                <Chip key={f} selected={fail === f} onClick={() => setFail(fail === f ? null : f)}>
                  {failLabel(f)}
                </Chip>
              ))}
            </div>
          </section>
        )}

        <Button variant="secondary" className="w-full" onClick={() => addCard()} disabled={!from && !action}>
          <Check className="size-4" />
          加入這張卡
        </Button>

        <section>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-medium">本堂卡片</p>
            <label className="flex size-11 cursor-pointer items-center justify-center rounded-lg border border-border bg-surface">
              <Camera className="size-5" />
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => void onPhoto(e.target.files?.[0])}
              />
            </label>
          </div>
          {cards.length === 0 && photos.length === 0 && (
            <p className="rounded-md border border-dashed border-border px-4 py-6 text-center text-sm text-muted">
              還沒有卡。說一句或點兩個芯片。
            </p>
          )}
          <ul className="space-y-2">
            {cards.map((c) => (
              <li
                key={c.id}
                className="flex items-start justify-between rounded-md border border-border bg-surface px-3 py-3"
              >
                <div>
                  <p className="text-sm font-medium">
                    {c.role === "defense" ? "被 " : ""}
                    {nodeLabel(c.actionNode)}
                    {c.count > 1 ? ` ×${c.count}` : ""}
                  </p>
                  <p className="text-xs text-muted">
                    {nodeLabel(c.fromNode)}
                    {c.toNode ? ` → ${nodeLabel(c.toNode)}` : ""}
                    {c.result === "failed" && c.failReason ? ` · ${failLabel(c.failReason)}` : ""}
                    {c.result === "drill" ? " · 鑽研" : c.result === "success" ? " · 成功" : " · 被破"}
                  </p>
                  {c.details && <p className="mt-1 text-xs text-muted">{c.details}</p>}
                </div>
                <button
                  type="button"
                  className="size-11 text-muted"
                  onClick={() => setCards((list) => list.filter((x) => x.id !== c.id))}
                  aria-label="刪除"
                >
                  <X className="mx-auto size-4" />
                </button>
              </li>
            ))}
          </ul>
          {photos.length > 0 && (
            <div className="mt-3 grid grid-cols-3 gap-2">
              {photos.map((src, i) => (
                <div key={i} className="relative overflow-hidden rounded-lg border border-border">
                  <img src={src} alt="白板" className="h-24 w-full object-cover" />
                  <button
                    type="button"
                    className="absolute right-1 top-1 rounded-full bg-fg/70 p-1 text-bg"
                    onClick={() => setPhotos((p) => p.filter((_, j) => j !== i))}
                  >
                    <X className="size-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
        {error && <p className="text-sm text-danger">{error}</p>}
        <div className="h-8" />
      </div>
    </div>
  );
}
