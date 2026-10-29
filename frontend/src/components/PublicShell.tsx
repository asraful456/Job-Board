"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function PublicShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold text-gray-900">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-sm text-white">
              J
            </span>
            JobBoard
          </Link>
          <nav className="hidden items-center gap-7 md:flex">
            <Link href="/" className="text-sm text-gray-600 hover:text-blue-600">
              Jobs
            </Link>
            <Link href="/#companies" className="text-sm text-gray-600 hover:text-blue-600">
              Companies
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            {user ? (
              <>
                {user.role === "candidate" && (
                  <Link
                    href="/candidate/applications"
                    className="hidden text-sm font-medium text-gray-600 hover:text-blue-600 sm:inline"
                  >
                    My applications
                  </Link>
                )}
                {user.role !== "candidate" && (
                  <Link
                    href={
                      user.role === "company_admin"
                        ? "/company/dashboard"
                        : user.role === "screener"
                          ? "/screener/applicants"
                          : "/hr/candidates"
                    }
                    className="hidden text-sm font-medium text-gray-600 hover:text-blue-600 sm:inline"
                  >
                    Dashboard
                  </Link>
                )}
                <button
                  onClick={logout}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="hidden text-sm font-medium text-gray-700 hover:text-blue-600 sm:block"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <Link href="/" className="font-semibold text-gray-700">
            JobBoard
          </Link>
          <p>Find work that moves you forward.</p>
        </div>
      </footer>
    </div>
  );
}
