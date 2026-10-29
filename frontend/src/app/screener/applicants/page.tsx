"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "@/lib/api";
import { apiErrorMessage, listFromResponse } from "@/lib/data";
import type { Application, ApplicationStatus, Job, PaginatedResponse } from "@/types";
import DataTable, { type Column } from "@/components/DataTable";
import { Button, EmptyState, ErrorState, Modal, Select, Skeleton } from "@/components/ui";
import StatusBadge from "@/components/StatusBadge";

type RejectTarget = Application | null;

export default function ScreenerApplicantsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobId, setJobId] = useState("");
  const [status, setStatus] = useState<"applied" | "shortlisted" | "screening_rejected">("applied");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [rejectTarget, setRejectTarget] = useState<RejectTarget>(null);
  const [saving, setSaving] = useState(false);

  const loadApplicants = useCallback(async () => {
    try {
      const [applicationsResponse, jobsResponse] = await Promise.all([
        api.get<Application[] | PaginatedResponse<Application>>("/screener/applicants", {
          params: { job_id: jobId || undefined, status, search: search || undefined },
        }),
        api.get<Job[] | PaginatedResponse<Job>>("/screener/jobs"),
      ]);
      setApplications(listFromResponse(applicationsResponse.data));
      setJobs(listFromResponse(jobsResponse.data));
      setError(false);
    } catch (requestError) {
      setError(true);
      toast.error(apiErrorMessage(requestError, "Could not load applicants."));
    } finally {
      setLoading(false);
    }
  }, [jobId, status, search]);

  useEffect(() => {
    const timeout = window.setTimeout(() => void loadApplicants(), 0);
    return () => window.clearTimeout(timeout);
  }, [loadApplicants]);

  const updateApplication = async (
    application: Application,
    nextStatus: Extract<ApplicationStatus, "shortlisted" | "screening_rejected">,
  ) => {
    setSaving(true);
    try {
      await api.patch(`/screener/applications/${application.id}`, { status: nextStatus });
      toast.success(nextStatus === "shortlisted" ? "Candidate shortlisted." : "Candidate rejected.");
      setRejectTarget(null);
      await loadApplicants();
    } catch (requestError) {
      toast.error(apiErrorMessage(requestError, "Could not update this application."));
    } finally {
      setSaving(false);
    }
  };

  const columns: Column<Application>[] = [
    { key: "candidate", header: "Candidate", render: (application) => <span className="font-medium text-gray-900">{application.candidate?.name ?? "Candidate"}</span> },
    { key: "job", header: "Job", render: (application) => application.job?.title ?? "Job" },
    { key: "applied", header: "Applied", render: (application) => new Date(application.created_at).toLocaleDateString() },
    {
      key: "cv",
      header: "CV",
      render: (application) => application.cv_preview_url ? (
        <a href={application.cv_preview_url} target="_blank" rel="noreferrer" onClick={(event) => event.stopPropagation()} className="font-medium text-blue-600 hover:text-blue-700">View CV</a>
      ) : <span className="text-gray-400">Not available</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (application) => <StatusBadge status={application.status} />,
    },
    {
      key: "actions",
      header: "Action",
      render: (application) => application.status === "applied" ? (
        <div className="flex items-center gap-2">
          <Button className="min-h-8 px-2.5 py-1 text-xs" onClick={() => void updateApplication(application, "shortlisted")}>✓ Shortlist</Button>
          <Button variant="danger" className="min-h-8 px-2.5 py-1 text-xs" onClick={() => setRejectTarget(application)}>Reject</Button>
        </div>
      ) : <span className="text-xs text-gray-500">Reviewed</span>,
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Applicants</h1>
        <p className="mt-1 text-sm text-gray-500">Review CVs and send shortlisted candidates to HR.</p>
      </div>
      <div className="mb-5 grid gap-3 rounded-xl border border-gray-200 bg-white p-4 sm:grid-cols-3">
        <Select label="Job" value={jobId} onChange={(event) => setJobId(event.target.value)}>
          <option value="">All jobs</option>
          {jobs.map((job) => <option key={job.id} value={job.id}>{job.title}</option>)}
        </Select>
        <Select label="Status" value={status} onChange={(event) => setStatus(event.target.value as typeof status)}>
          <option value="applied">Applied</option>
          <option value="shortlisted">Shortlisted</option>
          <option value="screening_rejected">Screening rejected</option>
        </Select>
        <div>
          <label htmlFor="candidate-search" className="mb-1.5 block text-sm font-medium text-gray-700">Search name</label>
          <input id="candidate-search" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Candidate name" className="min-h-11 w-full rounded-lg border border-gray-300 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
        </div>
      </div>
      {loading ? <Skeleton rows={4} /> : error ? <ErrorState onRetry={() => void loadApplicants()} /> : applications.length === 0 ? (
        <EmptyState title="No applicants found" description="New applications matching these filters will appear here." />
      ) : (
        <DataTable rows={applications} columns={columns} />
      )}
      <Modal open={Boolean(rejectTarget)} onClose={() => setRejectTarget(null)} title="Reject this candidate?">
        <p className="text-sm text-gray-600">
          Are you sure you want to reject {rejectTarget?.candidate?.name ?? "this candidate"}? This will remove the application from the Applied queue.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setRejectTarget(null)}>Cancel</Button>
          <Button variant="danger" onClick={() => rejectTarget && void updateApplication(rejectTarget, "screening_rejected")} disabled={saving}>
            {saving ? "Rejecting..." : "Reject"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
