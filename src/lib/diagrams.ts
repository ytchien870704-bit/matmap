import type { DiagramSpec } from "./types";

type Joint = { x: number; y: number };
type Pose = {
  head: Joint;
  neck: Joint;
  hip: Joint;
  lShoulder: Joint;
  rShoulder: Joint;
  lElbow: Joint;
  rElbow: Joint;
  lHand: Joint;
  rHand: Joint;
  lKnee: Joint;
  rKnee: Joint;
  lFoot: Joint;
  rFoot: Joint;
};

const P: Record<string, Pose> = {
  closed_bottom: {
    head: { x: 118, y: 92 },
    neck: { x: 124, y: 108 },
    hip: { x: 150, y: 148 },
    lShoulder: { x: 112, y: 116 },
    rShoulder: { x: 140, y: 112 },
    lElbow: { x: 98, y: 138 },
    rElbow: { x: 168, y: 128 },
    lHand: { x: 108, y: 156 },
    rHand: { x: 196, y: 132 },
    lKnee: { x: 168, y: 112 },
    rKnee: { x: 176, y: 168 },
    lFoot: { x: 214, y: 104 },
    rFoot: { x: 214, y: 176 },
  },
  closed_top: {
    head: { x: 196, y: 58 },
    neck: { x: 190, y: 74 },
    hip: { x: 176, y: 122 },
    lShoulder: { x: 172, y: 80 },
    rShoulder: { x: 208, y: 84 },
    lElbow: { x: 150, y: 102 },
    rElbow: { x: 232, y: 108 },
    lHand: { x: 132, y: 96 },
    rHand: { x: 248, y: 128 },
    lKnee: { x: 148, y: 148 },
    rKnee: { x: 210, y: 150 },
    lFoot: { x: 126, y: 176 },
    rFoot: { x: 232, y: 178 },
  },
  triangle_lock: {
    head: { x: 108, y: 86 },
    neck: { x: 116, y: 102 },
    hip: { x: 154, y: 144 },
    lShoulder: { x: 104, y: 112 },
    rShoulder: { x: 132, y: 108 },
    lElbow: { x: 92, y: 136 },
    rElbow: { x: 156, y: 120 },
    lHand: { x: 108, y: 152 },
    rHand: { x: 188, y: 116 },
    lKnee: { x: 196, y: 78 },
    rKnee: { x: 210, y: 132 },
    lFoot: { x: 168, y: 64 },
    rFoot: { x: 168, y: 150 },
  },
  elbow_post: {
    head: { x: 210, y: 54 },
    neck: { x: 204, y: 70 },
    hip: { x: 186, y: 126 },
    lShoulder: { x: 186, y: 78 },
    rShoulder: { x: 222, y: 80 },
    lElbow: { x: 164, y: 104 },
    rElbow: { x: 236, y: 118 },
    lHand: { x: 148, y: 92 },
    rHand: { x: 228, y: 150 },
    lKnee: { x: 160, y: 152 },
    rKnee: { x: 220, y: 156 },
    lFoot: { x: 140, y: 180 },
    rFoot: { x: 244, y: 182 },
  },
  armbar_lock: {
    head: { x: 220, y: 78 },
    neck: { x: 208, y: 92 },
    hip: { x: 156, y: 118 },
    lShoulder: { x: 196, y: 98 },
    rShoulder: { x: 218, y: 108 },
    lElbow: { x: 176, y: 112 },
    rElbow: { x: 236, y: 128 },
    lHand: { x: 148, y: 108 },
    rHand: { x: 252, y: 146 },
    lKnee: { x: 128, y: 96 },
    rKnee: { x: 132, y: 146 },
    lFoot: { x: 96, y: 88 },
    rFoot: { x: 102, y: 168 },
  },
  armbar_victim: {
    head: { x: 86, y: 96 },
    neck: { x: 104, y: 104 },
    hip: { x: 168, y: 128 },
    lShoulder: { x: 116, y: 108 },
    rShoulder: { x: 124, y: 96 },
    lElbow: { x: 148, y: 112 },
    rElbow: { x: 156, y: 88 },
    lHand: { x: 176, y: 118 },
    rHand: { x: 196, y: 80 },
    lKnee: { x: 198, y: 148 },
    rKnee: { x: 210, y: 132 },
    lFoot: { x: 232, y: 168 },
    rFoot: { x: 246, y: 146 },
  },
  kimura_lock: {
    head: { x: 132, y: 58 },
    neck: { x: 136, y: 74 },
    hip: { x: 168, y: 128 },
    lShoulder: { x: 122, y: 86 },
    rShoulder: { x: 156, y: 82 },
    lElbow: { x: 108, y: 112 },
    rElbow: { x: 188, y: 96 },
    lHand: { x: 128, y: 132 },
    rHand: { x: 212, y: 88 },
    lKnee: { x: 148, y: 156 },
    rKnee: { x: 204, y: 150 },
    lFoot: { x: 128, y: 186 },
    rFoot: { x: 236, y: 172 },
  },
  kimura_victim: {
    head: { x: 228, y: 96 },
    neck: { x: 214, y: 108 },
    hip: { x: 176, y: 150 },
    lShoulder: { x: 196, y: 112 },
    rShoulder: { x: 224, y: 120 },
    lElbow: { x: 176, y: 96 },
    rElbow: { x: 240, y: 146 },
    lHand: { x: 198, y: 78 },
    rHand: { x: 248, y: 168 },
    lKnee: { x: 154, y: 168 },
    rKnee: { x: 198, y: 176 },
    lFoot: { x: 132, y: 194 },
    rFoot: { x: 220, y: 198 },
  },
  knee_cut_pass: {
    head: { x: 196, y: 48 },
    neck: { x: 190, y: 64 },
    hip: { x: 176, y: 118 },
    lShoulder: { x: 172, y: 72 },
    rShoulder: { x: 210, y: 74 },
    lElbow: { x: 148, y: 94 },
    rElbow: { x: 234, y: 96 },
    lHand: { x: 126, y: 108 },
    rHand: { x: 248, y: 118 },
    lKnee: { x: 150, y: 138 },
    rKnee: { x: 210, y: 132 },
    lFoot: { x: 132, y: 174 },
    rFoot: { x: 236, y: 158 },
  },
  open_bottom: {
    head: { x: 108, y: 88 },
    neck: { x: 116, y: 104 },
    hip: { x: 140, y: 148 },
    lShoulder: { x: 104, y: 114 },
    rShoulder: { x: 132, y: 112 },
    lElbow: { x: 88, y: 136 },
    rElbow: { x: 156, y: 128 },
    lHand: { x: 84, y: 158 },
    rHand: { x: 176, y: 140 },
    lKnee: { x: 176, y: 108 },
    rKnee: { x: 188, y: 164 },
    lFoot: { x: 224, y: 96 },
    rFoot: { x: 232, y: 176 },
  },
  side_top: {
    head: { x: 168, y: 46 },
    neck: { x: 168, y: 62 },
    hip: { x: 176, y: 122 },
    lShoulder: { x: 148, y: 72 },
    rShoulder: { x: 190, y: 72 },
    lElbow: { x: 128, y: 96 },
    rElbow: { x: 214, y: 96 },
    lHand: { x: 116, y: 118 },
    rHand: { x: 228, y: 118 },
    lKnee: { x: 148, y: 154 },
    rKnee: { x: 210, y: 154 },
    lFoot: { x: 132, y: 186 },
    rFoot: { x: 228, y: 186 },
  },
  side_bottom: {
    head: { x: 96, y: 108 },
    neck: { x: 114, y: 116 },
    hip: { x: 176, y: 140 },
    lShoulder: { x: 122, y: 124 },
    rShoulder: { x: 128, y: 108 },
    lElbow: { x: 140, y: 146 },
    rElbow: { x: 148, y: 92 },
    lHand: { x: 158, y: 164 },
    rHand: { x: 170, y: 78 },
    lKnee: { x: 210, y: 156 },
    rKnee: { x: 220, y: 132 },
    lFoot: { x: 248, y: 168 },
    rFoot: { x: 256, y: 138 },
  },
  mount_top: {
    head: { x: 176, y: 40 },
    neck: { x: 176, y: 56 },
    hip: { x: 176, y: 118 },
    lShoulder: { x: 154, y: 68 },
    rShoulder: { x: 198, y: 68 },
    lElbow: { x: 136, y: 92 },
    rElbow: { x: 216, y: 92 },
    lHand: { x: 120, y: 108 },
    rHand: { x: 232, y: 108 },
    lKnee: { x: 142, y: 148 },
    rKnee: { x: 210, y: 148 },
    lFoot: { x: 124, y: 178 },
    rFoot: { x: 228, y: 178 },
  },
  mount_bottom: {
    head: { x: 176, y: 96 },
    neck: { x: 176, y: 112 },
    hip: { x: 176, y: 156 },
    lShoulder: { x: 152, y: 118 },
    rShoulder: { x: 200, y: 118 },
    lElbow: { x: 138, y: 140 },
    rElbow: { x: 214, y: 140 },
    lHand: { x: 148, y: 158 },
    rHand: { x: 204, y: 158 },
    lKnee: { x: 148, y: 184 },
    rKnee: { x: 204, y: 184 },
    lFoot: { x: 132, y: 204 },
    rFoot: { x: 220, y: 204 },
  },
  back_control: {
    head: { x: 132, y: 52 },
    neck: { x: 140, y: 68 },
    hip: { x: 168, y: 128 },
    lShoulder: { x: 128, y: 80 },
    rShoulder: { x: 160, y: 76 },
    lElbow: { x: 148, y: 104 },
    rElbow: { x: 188, y: 96 },
    lHand: { x: 176, y: 118 },
    rHand: { x: 214, y: 108 },
    lKnee: { x: 148, y: 158 },
    rKnee: { x: 200, y: 150 },
    lFoot: { x: 196, y: 168 },
    rFoot: { x: 236, y: 158 },
  },
  back_victim: {
    head: { x: 188, y: 72 },
    neck: { x: 184, y: 88 },
    hip: { x: 176, y: 140 },
    lShoulder: { x: 164, y: 96 },
    rShoulder: { x: 204, y: 96 },
    lElbow: { x: 148, y: 118 },
    rElbow: { x: 220, y: 118 },
    lHand: { x: 156, y: 140 },
    rHand: { x: 212, y: 140 },
    lKnee: { x: 156, y: 168 },
    rKnee: { x: 196, y: 168 },
    lFoot: { x: 148, y: 196 },
    rFoot: { x: 204, y: 196 },
  },
  rnc_lock: {
    head: { x: 128, y: 56 },
    neck: { x: 138, y: 70 },
    hip: { x: 164, y: 126 },
    lShoulder: { x: 126, y: 82 },
    rShoulder: { x: 158, y: 78 },
    lElbow: { x: 168, y: 92 },
    rElbow: { x: 186, y: 86 },
    lHand: { x: 198, y: 78 },
    rHand: { x: 210, y: 72 },
    lKnee: { x: 148, y: 156 },
    rKnee: { x: 198, y: 148 },
    lFoot: { x: 198, y: 166 },
    rFoot: { x: 232, y: 156 },
  },
  flower_me: {
    head: { x: 100, y: 80 },
    neck: { x: 112, y: 94 },
    hip: { x: 148, y: 136 },
    lShoulder: { x: 102, y: 104 },
    rShoulder: { x: 128, y: 100 },
    lElbow: { x: 88, y: 126 },
    rElbow: { x: 156, y: 112 },
    lHand: { x: 96, y: 148 },
    rHand: { x: 192, y: 108 },
    lKnee: { x: 176, y: 96 },
    rKnee: { x: 196, y: 152 },
    lFoot: { x: 220, y: 80 },
    rFoot: { x: 236, y: 168 },
  },
  flower_opp: {
    head: { x: 236, y: 64 },
    neck: { x: 222, y: 78 },
    hip: { x: 186, y: 128 },
    lShoulder: { x: 206, y: 84 },
    rShoulder: { x: 236, y: 90 },
    lElbow: { x: 186, y: 102 },
    rElbow: { x: 252, y: 114 },
    lHand: { x: 168, y: 112 },
    rHand: { x: 260, y: 138 },
    lKnee: { x: 164, y: 148 },
    rKnee: { x: 214, y: 154 },
    lFoot: { x: 148, y: 176 },
    rFoot: { x: 236, y: 180 },
  },
  standing_me: {
    head: { x: 130, y: 40 },
    neck: { x: 130, y: 56 },
    hip: { x: 130, y: 110 },
    lShoulder: { x: 112, y: 64 },
    rShoulder: { x: 148, y: 64 },
    lElbow: { x: 104, y: 88 },
    rElbow: { x: 164, y: 84 },
    lHand: { x: 112, y: 108 },
    rHand: { x: 176, y: 96 },
    lKnee: { x: 118, y: 148 },
    rKnee: { x: 146, y: 148 },
    lFoot: { x: 112, y: 186 },
    rFoot: { x: 152, y: 186 },
  },
  standing_opp: {
    head: { x: 214, y: 40 },
    neck: { x: 214, y: 56 },
    hip: { x: 214, y: 110 },
    lShoulder: { x: 196, y: 64 },
    rShoulder: { x: 232, y: 64 },
    lElbow: { x: 180, y: 84 },
    rElbow: { x: 240, y: 88 },
    lHand: { x: 168, y: 96 },
    rHand: { x: 232, y: 108 },
    lKnee: { x: 202, y: 148 },
    rKnee: { x: 226, y: 148 },
    lFoot: { x: 196, y: 186 },
    rFoot: { x: 232, y: 186 },
  },
};

const TECHNIQUE_DIAGRAMS: Record<string, DiagramSpec[]> = {
  triangle: [
    {
      view: "side",
      mePose: "closed_bottom",
      oppPose: "closed_top",
      caption: "閉鎖：控頭、打開角度",
      arrows: [{ from: "me", to: "opp", label: "控頭" }],
    },
    {
      view: "side",
      mePose: "triangle_lock",
      oppPose: "elbow_post",
      caption: "收腿鎖頸。撐肘就掉——先把那隻手拉過。",
      arrows: [{ from: "me", to: "opp", label: "收腿" }],
    },
  ],
  armbar: [
    {
      view: "side",
      mePose: "armbar_lock",
      oppPose: "armbar_victim",
      caption: "控腕、髖頂肘、夾緊雙腿",
      arrows: [{ from: "me", to: "opp", label: "頂肘" }],
    },
  ],
  kimura: [
    {
      view: "side",
      mePose: "kimura_lock",
      oppPose: "kimura_victim",
      caption: "鎖腕、肩向後轉",
      arrows: [{ from: "me", to: "opp", label: "轉肩" }],
    },
  ],
  knee_cut: [
    {
      view: "side",
      mePose: "knee_cut_pass",
      oppPose: "open_bottom",
      caption: "壓肩、膝切開對方防守",
      arrows: [{ from: "me", to: "opp", label: "切膝" }],
    },
  ],
  flower_sweep: [
    {
      view: "side",
      mePose: "flower_me",
      oppPose: "flower_opp",
      caption: "控袖、收腳、側翻上騎乘",
      arrows: [{ from: "me", to: "opp", label: "側翻" }],
    },
  ],
  rnc: [
    {
      view: "side",
      mePose: "rnc_lock",
      oppPose: "back_victim",
      caption: "掌貼二頭、收肘、藏頭",
      arrows: [{ from: "me", to: "opp", label: "收絞" }],
    },
  ],
  mount: [
    {
      view: "top",
      mePose: "mount_top",
      oppPose: "mount_bottom",
      caption: "膝夾、壓胸、低重心",
      arrows: [{ from: "me", to: "opp", label: "壓" }],
    },
  ],
  side_control: [
    {
      view: "top",
      mePose: "side_top",
      oppPose: "side_bottom",
      caption: "控髖、壓肩、不讓對手蝦",
      arrows: [{ from: "me", to: "opp", label: "壓肩" }],
    },
  ],
  back: [
    {
      view: "side",
      mePose: "back_control",
      oppPose: "back_victim",
      caption: "雙鉤、胸貼背、手控",
      arrows: [{ from: "me", to: "opp", label: "鎖背" }],
    },
  ],
  closed_guard: [
    {
      view: "side",
      mePose: "closed_bottom",
      oppPose: "closed_top",
      caption: "閉鎖：夾髖、控頭或袖",
      arrows: [{ from: "me", to: "opp", label: "夾髖" }],
    },
  ],
  standing: [
    {
      view: "side",
      mePose: "standing_me",
      oppPose: "standing_opp",
      caption: "站立：抓領、準備拉人進防守",
      arrows: [{ from: "me", to: "opp", label: "拉" }],
    },
  ],
};

export function diagramsFor(nodeId: string): DiagramSpec[] {
  return TECHNIQUE_DIAGRAMS[nodeId] ?? defaultDiagram(nodeId);
}

function defaultDiagram(nodeId: string): DiagramSpec[] {
  return [
    {
      view: "side",
      mePose: "closed_bottom",
      oppPose: "closed_top",
      caption: nodeId,
      arrows: [{ from: "me", to: "opp", label: "" }],
    },
  ];
}

function line(a: Joint, b: Joint, color: string, width: number) {
  return `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="${color}" stroke-width="${width}" stroke-linecap="round" />`;
}

function figure(pose: Pose, color: string, fillHead: string, width: number) {
  const limbs: [Joint, Joint][] = [
    [pose.neck, pose.hip],
    [pose.lShoulder, pose.rShoulder],
    [pose.lShoulder, pose.lElbow],
    [pose.lElbow, pose.lHand],
    [pose.rShoulder, pose.rElbow],
    [pose.rElbow, pose.rHand],
    [pose.hip, pose.lKnee],
    [pose.lKnee, pose.lFoot],
    [pose.hip, pose.rKnee],
    [pose.rKnee, pose.rFoot],
  ];
  const body = limbs.map(([a, b]) => line(a, b, color, width)).join("");
  const head = `<circle cx="${pose.head.x}" cy="${pose.head.y}" r="11" fill="${fillHead}" stroke="${color}" stroke-width="${width}" />`;
  return body + head;
}

export function renderDiagramSvg(spec: DiagramSpec): string {
  const me = P[spec.mePose] ?? P.closed_bottom;
  const opp = P[spec.oppPose] ?? P.closed_top;
  const meColor = "#2a3d5c";
  const oppColor = "#5a5248";
  const ink = "#8f2a1b";
  const arrows = spec.arrows
    .map((a) => {
      const from = a.from === "me" ? me.rHand : opp.rHand;
      const to = a.to === "me" ? me.head : opp.head;
      const mx = (from.x + to.x) / 2;
      const my = (from.y + to.y) / 2 - 10;
      const label = a.label
        ? `<text x="${mx}" y="${my}" text-anchor="middle" font-size="11" fill="${ink}" font-family="Zen Kaku Gothic New, sans-serif">${escapeXml(a.label)}</text>`
        : "";
      return `${line(from, to, ink, 1.5)}<polygon points="${to.x},${to.y} ${to.x - 5},${to.y + 8} ${to.x + 5},${to.y + 8}" fill="${ink}" />${label}`;
    })
    .join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 220" role="img">
    <rect width="320" height="220" fill="#f4efe4" />
    <text x="16" y="22" font-size="11" fill="#6e6558" font-family="Zen Kaku Gothic New, sans-serif">${spec.view === "top" ? "俯視" : "側視"} · 藍衣＝我　白衣＝對方</text>
    ${figure(opp, oppColor, "#f7f2e6", 3.5)}
    ${figure(me, meColor, "#d5dce6", 4)}
    ${arrows}
    <text x="160" y="208" text-anchor="middle" font-size="12" fill="#1a1410" font-family="Zen Antique, serif">${escapeXml(spec.caption)}</text>
  </svg>`;
}

function escapeXml(s: string) {
  const amp = String.fromCharCode(38);
  return s
    .replace(/&/g, `${amp}amp;`)
    .replace(/</g, `${amp}lt;`)
    .replace(/>/g, `${amp}gt;`)
    .replace(/"/g, `${amp}quot;`);
}

export function flipHands(spec: DiagramSpec): DiagramSpec {
  const swap = (id: string) => {
    if (id.includes("lock")) return id;
    return id;
  };
  return {
    ...spec,
    mePose: swap(spec.mePose),
    caption: spec.caption + "（對手換邊）",
    arrows: spec.arrows.map((a) => ({ ...a, from: a.from === "me" ? "opp" : "me" })),
  };
}
