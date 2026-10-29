"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import ApplyModal from "@/components/ApplyModal";
import PublicShell from "@/components/PublicShell";
import { Button, EmptyState, ErrorState, Skeleton } from "@/components/ui";
import api from "@/lib/api";
import { apiErrorMessage } from "@/lib/data";
import type { Job } from "@/types";

export default function JobDetailsPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-7xl px-4 py-10"><Skeleton rows={3} /></div>}>
      <JobDetailsContent />
    </Suspense>
  );
}

function JobDetailsContent() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [applyOpen, setApplyOpen] = useState(false);

  const loadJob = useCallback(async () => {
    try {
      const { data } = await api.get<Job>(`/jobs/${params.id}`);
      setJob(data);
      setError(false);
    } catch (requestError) {
      setError(true);
      toast.error(apiErrorMessage(requestError, "Could not load this job."));
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    const timeout = window.setTimeout(() => void loadJob(), 0);
    return () => window.clearTimeout(timeout);
  }, [loadJob]);

  const handleApply = () => {
    if (!user) {
      router.push("/login");
      return;
    }
    if (user.role === "candidate") {
      setApplyOpen(true);
    }
  };

  return (
    <PublicShell>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Link href="/" className="text-sm font-medium text-blue-600 hover:text-blue-700">
          ← All jobs
        </Link>
        {loading ? (
          <div className="mt-6">
            <Skeleton rows={3} />
          </div>
        ) : error ? (
          <div className="mt-6">
            <ErrorState onRetry={() => void loadJob()} />
          </div>
        ) : !job ? (
          <div className="mt-6">
            <EmptyState title="Job not found" description="This role may have been removed." />
          </div>
        ) : (
          <>
            <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
              <article className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-blue-50 text-xl font-bold text-blue-700">
                    {job.company?.logo_url ? (
                      <img
                        src={job.company.logo_url}
                        alt={job.company?.name ?? "Company"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      (job.company?.name ?? job.company_name ?? "C").charAt(0)
                    )}
                  </div>
                  <div>
                    <h1 className="text-2xl font-semibold text-gray-900">{job.title}</h1>
                    <p className="mt-1 text-base text-gray-600">
                      {job.company?.name ?? job.company_name ?? "Company"}
                    </p>
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap gap-2 text-sm text-gray-600">
                  <span className="rounded-full bg-gray-100 px-3 py-1.5">{job.location}</span>
                  <span className="rounded-full bg-gray-100 px-3 py-1.5">{job.type}</span>
                  {job.salary && (
                    <span className="rounded-full bg-gray-100 px-3 py-1.5">{job.salary}</span>
                  )}
                  {job.category && (
                    <span className="rounded-full bg-gray-100 px-3 py-1.5">{job.category}</span>
                  )}
                </div>
                <section className="mt-9">
                  <h2 className="text-lg font-semibold text-gray-900">About the role</h2>
                  <p className="mt-3 whitespace-pre-line text-sm leading-7 text-gray-600">
                    {job.description}
                  </p>
                </section>
                {job.requirements && (
                  <section className="mt-8">
                    <h2 className="text-lg font-semibold text-gray-900">Requirements</h2>
                    <p className="mt-3 whitespace-pre-line text-sm leading-7 text-gray-600">
                      {job.requirements}
                    </p>
                  </section>
                )}
                {job.deadline && (
                  <p className="mt-8 border-t border-gray-100 pt-5 text-sm text-gray-600">
                    Application deadline:{" "}
                    <strong className="font-medium text-gray-900">
                      {new Date(job.deadline).toLocaleDateString()}
                    </strong>
                  </p>
                )}
              </article>
              <aside className="h-fit rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                {user?.role === "candidate" || !user ? (
                  <>
                    <Button
                      className="w-full"
                      disabled={job.status === "closed"}
                      onClick={handleApply}
                    >
                      {job.status === "closed" ? "Applications closed" : "Apply now"}
                    </Button>
                    <p className="mt-4 text-center text-xs text-gray-500">
                      Posted {new Date(job.created_at).toLocaleDateString()}
                    </p>
                  </>
                ) : (
                  <p className="rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
                    Company team accounts can review applicants from their dashboard.
                  </p>
                )}
                <div className="mt-6 border-t border-gray-100 pt-5">
                  <h2 className="font-semibold text-gray-900">About the company</h2>
                  <p className="mt-2 text-sm font-medium text-gray-800">
                    {job.company?.name ?? job.company_name ?? "Company"}
                  </p>
                  {job.company?.location && (
                    <p className="mt-1 text-sm text-gray-500">{job.company.location}</p>
                  )}
                  {job.company?.about && (
                    <p className="mt-3 text-sm leading-6 text-gray-600">{job.company.about}</p>
                  )}
                </div>
              </aside>
            </div>
            <ApplyModal job={job} open={applyOpen} onClose={() => setApplyOpen(false)} />
          </>
        )}
      </div>
    </PublicShell>
  );
}
