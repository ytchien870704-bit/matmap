export type NodeKind = "position" | "sweep" | "pass" | "escape" | "finish";
export type SessionKind = "roll" | "drill" | "mixed";
export type GiType = "gi" | "no-gi";
export type GiPreference = "gi" | "no-gi" | "both";
export type CardResult = "drill" | "success" | "failed";
export type CardRole = "attack" | "defense";
export type Proficiency = "seen" | "drill" | "roll";
export type EdgeSource = "practiced" | "accepted";

export interface CatalogNode {
  id: string;
  kind: NodeKind;
  zh: string;
  en: string;
  aliases: string[];
  x: number;
  y: number;
  /** Typical origins for actions; empty for positions. */
  from: string[];
  /** Typical destinations. */
  to: string[];
  control: string;
  fail: string;
}

export interface SuggestedEdge {
  from: string;
  to: string;
  label?: string;
}

export interface Profile {
  userId: string;
  displayName: string | null;
  gymName: string | null;
  giPreference: GiPreference;
  isPro: boolean;
}

export interface SessionCard {
  id: string;
  sessionId: string;
  fromNode: string | null;
  actionNode: string | null;
  toNode: string | null;
  result: CardResult;
  failReason: string | null;
  count: number;
  details: string | null;
  role: CardRole;
}

export interface SessionPhoto {
  id: string;
  dataUrl: string;
}

export interface TrainingSession {
  id: string;
  trainedOn: string;
  gymName: string | null;
  giType: GiType;
  durationMin: number | null;
  kind: SessionKind;
  notes: string | null;
  cards: SessionCard[];
  photos: SessionPhoto[];
  createdAt: string;
}

export interface TechniqueCard {
  actionNode: string;
  customName: string | null;
  details: string | null;
  proficiency: Proficiency;
  times: number;
  lastDate: string | null;
  diagrams: DiagramSpec[] | null;
  failNotes: Record<string, number> | null;
}

export interface UserEdge {
  fromNode: string;
  toNode: string;
  source: EdgeSource;
  times: number;
  lastDate: string | null;
}

export interface Review {
  id: string;
  sessionId: string | null;
  forDate: string;
  message: string;
  read: boolean;
}

export interface DiagramSpec {
  view: "side" | "top";
  mePose: string;
  oppPose: string;
  caption: string;
  arrows: { from: "me" | "opp"; to: "me" | "opp"; label: string }[];
}

export interface ParsedCardDraft {
  fromNode: string | null;
  actionNode: string | null;
  toNode: string | null;
  result: CardResult;
  failReason: string | null;
  count: number;
  details: string;
  role: CardRole;
}

export interface GraphPayload {
  practicedNodeIds: string[];
  edges: UserEdge[];
  nodeStats: Record<
    string,
    {
      times: number;
      lastDate: string | null;
      actions: { id: string; times: number; failed: number; failReasons: Record<string, number> }[];
      passedBy: { id: string; times: number }[];
    }
  >;
}
