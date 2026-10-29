"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";
import api from "@/lib/api";
import { apiErrorMessage } from "@/lib/data";
import type { Job } from "@/types";
import JobForm from "@/components/JobForm";
import { ErrorState, Skeleton } from "@/components/ui";

export default function EditJobPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-4xl"><Skeleton rows={3} /></div>}>
      <EditJobContent />
    </Suspense>
  );
}

function EditJobContent() {
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadJob = useCallback(async () => {
    try {
      const { data } = await api.get<Job>(`/v1/company/jobs/${id}`);
      setJob(data);
      setError(false);
    } catch (requestError) {
      setError(true);
      toast.error(apiErrorMessage(requestError, "Could not load this job."));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    const timeout = window.setTimeout(() => void loadJob(), 0);
    return () => window.clearTimeout(timeout);
  }, [loadJob]);

  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/company/jobs" className="text-sm font-medium text-blue-600 hover:text-blue-700">
        ← Back to jobs
      </Link>
      <h1 className="mb-6 mt-4 text-2xl font-semibold text-gray-900">Edit job</h1>
      {loading ? <Skeleton rows={3} /> : error ? <ErrorState onRetry={() => void loadJob()} /> : job ? <JobForm job={job} /> : null}
    </div>
  );
}
