import DashboardShell from "@/components/DashboardShell";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function CompanyLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute role="company_admin">
      <DashboardShell role="company_admin">{children}</DashboardShell>
    </ProtectedRoute>
  );
}
