"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import type { Role } from "@/types";

type MenuLink = { label: string; href: string; icon: React.ReactNode; badge?: string };

const menu: Record<Exclude<Role, "candidate">, MenuLink[]> = {
  company_admin: [
    {
      label: "Dashboard",
      href: "/company/dashboard",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
    },
    {
      label: "Jobs",
      href: "/company/jobs",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      label: "Team Members",
      href: "/company/team",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
    {
      label: "Company Profile",
      href: "/company/profile",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
    },
  ],
  screener: [
    {
      label: "Applicants",
      href: "/screener/applicants",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
  ],
  hr: [
    {
      label: "Shortlisted Candidates",
      href: "/hr/candidates",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ],
};

const roleLabels: Record<Exclude<Role, "candidate">, string> = {
  company_admin: "Company Admin",
  screener: "Screener Reviewer",
  hr: "HR Hiring Manager",
};

export default function DashboardShell({
  role,
  children,
}: {
  role: Exclude<Role, "candidate">;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const company = user?.company;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 lg:flex">
      {menuOpen && (
        <button
          aria-label="Close navigation menu"
          className="fixed inset-0 z-30 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Modern Premium Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-slate-200/80 bg-white shadow-xs transition-transform lg:static lg:translate-x-0 ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Company Branding Top Box */}
        <div className="flex h-20 items-center gap-3.5 border-b border-slate-100 px-6">
          <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-500 shadow-sm text-white font-bold text-lg">
            {company?.logo_url ? (
              <img
                src={company.logo_url}
                alt={company?.name ?? "Company"}
                className="h-full w-full object-cover"
              />
            ) : (
              (company?.name?.charAt(0) || user?.name?.charAt(0) || "J").toUpperCase()
            )}
            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-500"></span>
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="truncate text-sm font-semibold tracking-tight text-slate-900">
              {company?.name ?? "JobBoard Workspace"}
            </h2>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-blue-600"></span>
              <span className="truncate">{roleLabels[role]}</span>
            </div>
          </div>
        </div>

        {/* Sidebar Nav */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Main Menu
          </p>
          <nav className="mt-3 space-y-1.5">
            {menu[role].map((item) => {
              const active =
                pathname === item.href ||
                (item.href !== "/company/dashboard" && pathname.startsWith(`${item.href}/`));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={`group flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all ${
                    active
                      ? "bg-blue-600 text-white shadow-sm shadow-blue-500/25"
                      : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`transition-colors ${
                        active ? "text-white" : "text-slate-400 group-hover:text-blue-600"
                      }`}
                    >
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>
                  {active && (
                    <span className="h-1.5 w-1.5 rounded-full bg-white"></span>
                  )}
                </Link>
              );
            })}
          </nav>

          {role === "company_admin" && (
            <div className="mt-8">
              <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                System & Insights
              </p>
              <div className="mt-3 space-y-1">
                <Link
                  href="/company/profile"
                  className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
                >
                  <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Company Settings</span>
                </Link>
                <Link
                  href="/"
                  className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
                >
                  <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  <span>Public Job Board</span>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Footer Widget */}
        {role === "company_admin" && (
          <div className="p-4">
            <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 p-4 text-white shadow-md">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white/10 text-sm font-bold text-white">
                  {company?.logo_url ? (
                    <img src={company.logo_url} alt="Logo" className="h-full w-full object-cover" />
                  ) : (
                    "🏢"
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-slate-100">{company?.name ?? "Company Profile"}</p>
                  <p className="truncate text-[11px] text-slate-400">{company?.location ?? "Verified Workspace"}</p>
                </div>
              </div>
              <Link
                href="/company/profile"
                className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-blue-600/90 hover:bg-blue-600 px-3 py-2 text-xs font-medium text-white transition shadow-sm"
              >
                <span>✏️ Customize Profile & Logo</span>
              </Link>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content Area */}
      <div className="min-w-0 flex-1 flex flex-col">
        {/* Premium Top Navigation Bar */}
        <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-slate-200/80 bg-white/95 backdrop-blur-md px-4 sm:px-8">
          <div className="flex items-center gap-4">
            <button
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
              onClick={() => setMenuOpen(true)}
              aria-label="Open navigation menu"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Current Workspace Pill */}
            <div className="hidden sm:flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50/80 px-3.5 py-1.5 text-xs text-slate-600">
              <span className="text-slate-400 font-medium">Workspace:</span>
              <span className="font-semibold text-slate-900">{company?.name ?? "TechVision"}</span>
              <span className="ml-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-100 text-[10px] text-blue-700">✓</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Post Job Quick Button if company_admin */}
            {role === "company_admin" && (
              <Link
                href="/company/jobs/new"
                className="hidden sm:inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-700 transition"
              >
                <span className="text-lg leading-none">+</span>
                <span>Post a job</span>
              </Link>
            )}

            {/* User Profile Pill */}
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/50 p-1.5 pr-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-slate-800 to-slate-900 text-sm font-semibold text-white">
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="hidden md:block text-left">
                <p className="truncate text-xs font-semibold text-slate-900 max-w-[130px]">{user?.name}</p>
                <p className="truncate text-[11px] text-slate-500 max-w-[130px]">{roleLabels[role]}</p>
              </div>
              <button
                onClick={logout}
                title="Sign out"
                className="ml-1 rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
