import { AppShell } from "@/components/app-shell";
import { LoginScreen, Splash } from "@/components/login-screen";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

export function Authenticated({ children }: { children: React.ReactNode }) {
  const { user, isPending } = useCurrentUserState();
  if (isPending) return <Splash />;
  if (!user) return <LoginScreen />;
  return <AppShell>{children}</AppShell>;
}
