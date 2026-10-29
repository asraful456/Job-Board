"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import api from "@/lib/api";
import { apiErrorMessage, listFromResponse } from "@/lib/data";
import type { Job, PaginatedResponse } from "@/types";
import DataTable, { type Column } from "@/components/DataTable";
import { Button, EmptyState, ErrorState, Modal, Skeleton } from "@/components/ui";

type JobAction = { job: Job; action: "close" | "delete" };

export default function CompanyJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [confirmAction, setConfirmAction] = useState<JobAction | null>(null);
  const [saving, setSaving] = useState(false);

  const loadJobs = useCallback(async () => {
    try {
      const { data } = await api.get<Job[] | PaginatedResponse<Job>>("/v1/company/jobs");
      setJobs(listFromResponse(data));
      setError(false);
    } catch (requestError) {
      setError(true);
      toast.error(apiErrorMessage(requestError, "Could not load your jobs."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => void loadJobs(), 0);
    return () => window.clearTimeout(timeout);
  }, [loadJobs]);

  const runAction = async () => {
    if (!confirmAction) return;
    setSaving(true);
    try {
      if (confirmAction.action === "close") {
        await api.patch(`/v1/company/jobs/${confirmAction.job.id}`, { status: "closed" });
        toast.success("Job closed.");
      } else {
        await api.delete(`/v1/company/jobs/${confirmAction.job.id}`);
        toast.success("Job deleted.");
      }
      setConfirmAction(null);
      await loadJobs();
    } catch (requestError) {
      toast.error(apiErrorMessage(requestError, "Unable to update this job."));
    } finally {
      setSaving(false);
    }
  };

  const columns: Column<Job>[] = [
    { key: "title", header: "Title", render: (job) => <span className="font-medium text-gray-900">{job.title}</span> },
    { key: "applicants", header: "Applicants", render: (job) => job.applicant_count ?? 0 },
    {
      key: "status",
      header: "Status",
      render: (job) => (
        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${job.status === "closed" ? "bg-gray-100 text-gray-600" : "bg-green-50 text-green-700"}`}>
          {job.status ?? "open"}
        </span>
      ),
    },
    { key: "created", header: "Created", render: (job) => new Date(job.created_at).toLocaleDateString() },
    {
      key: "actions",
      header: "Actions",
      render: (job) => (
        <div className="flex items-center gap-1">
          <Link href={`/company/jobs/${job.id}/edit`} className="rounded px-2 py-1 font-medium text-blue-600 hover:bg-blue-50">Edit</Link>
          {job.status !== "closed" && (
            <button onClick={() => setConfirmAction({ job, action: "close" })} className="rounded px-2 py-1 text-gray-600 hover:bg-gray-100">
              Close
            </button>
          )}
          <button onClick={() => setConfirmAction({ job, action: "delete" })} className="rounded px-2 py-1 text-red-600 hover:bg-red-50">
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Jobs</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your job posts and applicants.</p>
        </div>
        <Link href="/company/jobs/new" className="inline-flex min-h-10 items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          + Post new job
        </Link>
      </div>
      {loading ? (
        <Skeleton rows={4} />
      ) : error ? (
        <ErrorState onRetry={() => void loadJobs()} />
      ) : jobs.length === 0 ? (
        <EmptyState
          title="No jobs posted yet"
          description="Create your first job post to start receiving applications."
          action={<Link href="/company/jobs/new" className="inline-flex min-h-10 items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">Post a job</Link>}
        />
      ) : (
        <DataTable rows={jobs} columns={columns} />
      )}
      <Modal
        open={Boolean(confirmAction)}
        onClose={() => setConfirmAction(null)}
        title={confirmAction?.action === "delete" ? "Delete job?" : "Close job?"}
      >
        <p className="text-sm text-gray-600">
          {confirmAction?.action === "delete"
            ? `Are you sure you want to delete “${confirmAction.job.title}”? This cannot be undone.`
            : `Close “${confirmAction?.job.title}”? Candidates will no longer be able to apply.`}
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setConfirmAction(null)}>Cancel</Button>
          <Button variant={confirmAction?.action === "delete" ? "danger" : "primary"} onClick={() => void runAction()} disabled={saving}>
            {saving ? "Please wait..." : confirmAction?.action === "delete" ? "Delete job" : "Close job"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
