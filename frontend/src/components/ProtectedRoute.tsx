"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getRoleHome, useAuth } from "@/context/AuthContext";
import type { Role } from "@/types";
import { Skeleton } from "@/components/ui";

export default function ProtectedRoute({
  role,
  children,
}: {
  role: Role;
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (user.role !== role) {
      router.replace(getRoleHome(user.role));
    }
  }, [loading, user, role, router]);

  if (loading || !user || user.role !== role) {
    return (
      <main className="mx-auto w-full max-w-5xl px-4 py-10">
        <Skeleton rows={2} />
      </main>
    );
  }

  return children;
}
