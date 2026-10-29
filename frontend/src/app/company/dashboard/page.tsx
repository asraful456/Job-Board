"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import api from "@/lib/api";
import { apiErrorMessage } from "@/lib/data";
import type { Application, Company } from "@/types";
import StatusBadge from "@/components/StatusBadge";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui";

interface DashboardStats {
  company?: Company;
  total_jobs: number;
  total_applicants: number;
  shortlisted: number;
  accepted: number;
  recent_applications: Application[];
}

export default function CompanyDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get<DashboardStats>("/company/dashboard");
      setStats(data);
      setError(false);
    } catch (requestError) {
      setError(true);
      toast.error(apiErrorMessage(requestError, "Could not load the dashboard."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timeout);
  }, [load]);

  const company = stats?.company;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Workspace Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="flex h-16 w-16 sm:h-20 sm:w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 shadow-md text-white font-extrabold text-2xl sm:text-3xl">
              {company?.logo_url ? (
                <img
                  src={company.logo_url}
                  alt={company.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                (company?.name?.charAt(0) || "C").toUpperCase()
              )}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                  {company?.name ?? "Company Workspace"}
                </h1>
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 border border-blue-100">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-600"></span>
                  Verified Workspace
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-500 max-w-2xl line-clamp-1">
                {company?.about || "Manage your job listings, recruitment team, and applicant review pipeline."}
              </p>
              <div className="mt-2.5 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                {company?.location && (
                  <span className="flex items-center gap-1">
                    <svg className="h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {company.location}
                  </span>
                )}
                {company?.website && (
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-blue-600 hover:underline"
                  >
                    <svg className="h-3.5 w-3.5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    {company.website.replace(/^https?:\/\//, '')}
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Link
              href="/company/jobs/new"
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-500/25 hover:bg-blue-700 transition"
            >
              <span>+ Post a job</span>
            </Link>
            <Link
              href="/company/profile"
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
            >
              Edit Profile
            </Link>
          </div>
        </div>
      </div>

      {error ? (
        <ErrorState onRetry={() => void load()} />
      ) : loading ? (
        <Skeleton rows={4} />
      ) : (
        <>
          {/* 4 Beautiful KPI Stat Cards (Matching Modern Target Design) */}
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {/* 1. Total Jobs */}
            <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Total Active Jobs
                </span>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition group-hover:scale-105">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <p className="text-3xl font-extrabold tracking-tight text-slate-900">{stats?.total_jobs ?? 0}</p>
              </div>
              <p className="mt-2 text-xs font-medium text-emerald-600 flex items-center gap-1">
                <span>↗ Active listings in portal</span>
              </p>
            </div>

            {/* 2. Total Applicants */}
            <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Total Applicants
                </span>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600 transition group-hover:scale-105">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <p className="text-3xl font-extrabold tracking-tight text-slate-900">{stats?.total_applicants ?? 0}</p>
              </div>
              <p className="mt-2 text-xs font-medium text-indigo-600 flex items-center gap-1">
                <span>↗ Candidate submissions</span>
              </p>
            </div>

            {/* 3. Shortlisted */}
            <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Shortlisted
                </span>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-sky-600 transition group-hover:scale-105">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <p className="text-3xl font-extrabold tracking-tight text-slate-900">{stats?.shortlisted ?? 0}</p>
              </div>
              <p className="mt-2 text-xs font-medium text-sky-600 flex items-center gap-1">
                <span>✓ Screener approved pipeline</span>
              </p>
            </div>

            {/* 4. Accepted / Hired */}
            <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Accepted / Hired
                </span>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition group-hover:scale-105">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <p className="text-3xl font-extrabold tracking-tight text-slate-900">{stats?.accepted ?? 0}</p>
              </div>
              <p className="mt-2 text-xs font-medium text-emerald-600 flex items-center gap-1">
                <span>★ HR final acceptance</span>
              </p>
            </div>
          </div>

          {/* Main 2-column Grid */}
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
            {/* Recent Applications Feed */}
            <section className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-xs">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Recent Applications</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Candidates who recently applied to your company jobs</p>
                </div>
                <Link
                  href="/company/jobs"
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <span>View all jobs</span>
                  <span>→</span>
                </Link>
              </div>

              {stats?.recent_applications.length ? (
                <div className="divide-y divide-slate-100">
                  {stats.recent_applications.map((app) => (
                    <div
                      key={app.id}
                      className="flex items-center justify-between py-4 first:pt-0 last:pb-0 hover:bg-slate-50/70 rounded-2xl px-3 transition"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-slate-800 to-indigo-900 text-sm font-bold text-white shadow-xs">
                          {(app.candidate?.name?.charAt(0) || "C").toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-900">
                            {app.candidate?.name ?? "Candidate"}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-slate-500 truncate">
                            <span className="font-medium text-slate-700 truncate">{app.job?.title}</span>
                            <span>•</span>
                            <span>{new Date(app.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <StatusBadge status={app.status} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No applications yet"
                  description="When candidates apply for your open job listings, their details will appear here."
                />
              )}
            </section>

            {/* Quick Actions & Workspace Team Panel */}
            <aside className="space-y-6">
              {/* Quick Actions */}
              <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                  Quick Actions
                </h3>
                <div className="mt-4 space-y-2.5">
                  <Link
                    href="/company/jobs/new"
                    className="group flex w-full items-center justify-between rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-xs shadow-blue-500/20 hover:bg-blue-700 transition"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-base leading-none">＋</span>
                      <span>Post a New Job</span>
                    </div>
                    <span className="text-white/70 group-hover:translate-x-0.5 transition">›</span>
                  </Link>

                  <Link
                    href="/company/team"
                    className="group flex w-full items-center justify-between rounded-2xl border border-slate-200/90 bg-white px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition"
                  >
                    <div className="flex items-center gap-3">
                      <svg className="h-4 w-4 text-slate-400 group-hover:text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                      <span>Add Screener / HR Team</span>
                    </div>
                    <span className="text-slate-400 group-hover:translate-x-0.5 transition">›</span>
                  </Link>

                  <Link
                    href="/company/profile"
                    className="group flex w-full items-center justify-between rounded-2xl border border-slate-200/90 bg-white px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition"
                  >
                    <div className="flex items-center gap-3">
                      <svg className="h-4 w-4 text-slate-400 group-hover:text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <span>Update Company Branding</span>
                    </div>
                    <span className="text-slate-400 group-hover:translate-x-0.5 transition">›</span>
                  </Link>
                </div>
              </div>

              {/* Recruitment Hierarchy Info Card */}
              <div className="rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50/50 to-indigo-50/30 p-6 text-slate-800">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs text-white font-bold">i</span>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-blue-900">
                    Team Role Permissions
                  </h4>
                </div>
                <div className="mt-3.5 space-y-2.5 text-xs text-slate-600">
                  <div className="rounded-xl bg-white/80 p-2.5 border border-blue-100/60">
                    <p className="font-semibold text-slate-900">🔍 Screener</p>
                    <p className="mt-0.5 text-slate-500">Reviews new candidate CVs and shortlists them.</p>
                  </div>
                  <div className="rounded-xl bg-white/80 p-2.5 border border-blue-100/60">
                    <p className="font-semibold text-slate-900">👔 HR Manager</p>
                    <p className="mt-0.5 text-slate-500">Makes the final hiring decision (Accept or Reject).</p>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </>
      )}
    </div>
  );
}
