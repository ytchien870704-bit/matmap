import { createFileRoute, Navigate } from "@tanstack/react-router";
import { LoginScreen, Splash } from "@/components/login-screen";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  const { user, isPending } = useCurrentUserState();
  if (isPending) return <Splash />;
  if (user) return <Navigate to="/" />;
  return <LoginScreen />;
}
