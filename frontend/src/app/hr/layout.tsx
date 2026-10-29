import DashboardShell from "@/components/DashboardShell";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function HrLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute role="hr">
      <DashboardShell role="hr">{children}</DashboardShell>
    </ProtectedRoute>
  );
}
