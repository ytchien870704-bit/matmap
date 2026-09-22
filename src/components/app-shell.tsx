import { Link, useRouterState } from "@tanstack/react-router";
import { BookOpen, CalendarDays, CircleDot, GitFork, User } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { to: "/", label: "今天", icon: CircleDot },
  { to: "/log", label: "日誌", icon: CalendarDays },
  { to: "/map", label: "圖", icon: GitFork },
  { to: "/cards", label: "卡庫", icon: BookOpen },
  { to: "/me", label: "我的", icon: User },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col bg-bg">
      <div className="flex-1 pb-24">{children}</div>
      <nav
        className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-lg border-t-2 border-primary bg-surface/95 print:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <ul className="grid grid-cols-5 px-1 pt-1">
          {TABS.map((tab) => {
            const active = tab.to === "/" ? pathname === "/" : pathname.startsWith(tab.to);
            const Icon = tab.icon;
            return (
              <li key={tab.to}>
                <Link
                  to={tab.to}
                  className={cn(
                    "flex min-h-12 flex-col items-center justify-center gap-0.5 text-xs tracking-nav",
                    active ? "font-medium text-primary" : "text-muted",
                  )}
                >
                  <Icon className="size-5" strokeWidth={active ? 2.2 : 1.6} />
                  {tab.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
