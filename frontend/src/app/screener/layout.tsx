import DashboardShell from "@/components/DashboardShell";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function ScreenerLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute role="screener">
      <DashboardShell role="screener">{children}</DashboardShell>
    </ProtectedRoute>
  );
}
