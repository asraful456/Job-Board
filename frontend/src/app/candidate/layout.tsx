import ProtectedRoute from "@/components/ProtectedRoute";
import PublicShell from "@/components/PublicShell";

export default function CandidateLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute role="candidate">
      <PublicShell>{children}</PublicShell>
    </ProtectedRoute>
  );
}
