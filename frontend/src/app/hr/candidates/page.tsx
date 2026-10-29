"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import api from "@/lib/api";
import { apiErrorMessage, listFromResponse } from "@/lib/data";
import type { Application, ApplicationStatus, PaginatedResponse } from "@/types";
import DataTable, { type Column } from "@/components/DataTable";
import StatusBadge from "@/components/StatusBadge";
import { Button, EmptyState, ErrorState, Modal, Skeleton, Textarea } from "@/components/ui";

type DecisionStatus = Extract<ApplicationStatus, "accepted" | "rejected">;
type Decision = { application: Application; status: DecisionStatus } | null;
type TabStatus = "shortlisted" | "accepted" | "rejected";

const tabs: { value: TabStatus; label: string }[] = [
  { value: "shortlisted", label: "Pending decision" },
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" },
];

export default function HrCandidatesPage() {
  const [activeTab, setActiveTab] = useState<TabStatus>("shortlisted");
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [decision, setDecision] = useState<Decision>(null);
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);

  const loadCandidates = useCallback(async () => {
    try {
      const { data } = await api.get<Application[] | PaginatedResponse<Application>>("/hr/candidates", {
        params: { status: activeTab },
      });
      setApplications(listFromResponse(data));
      setError(false);
    } catch (requestError) {
      setError(true);
      toast.error(apiErrorMessage(requestError, "Could not load candidates."));
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    const timeout = window.setTimeout(() => void loadCandidates(), 0);
    return () => window.clearTimeout(timeout);
  }, [loadCandidates]);

  const submitDecision = async () => {
    if (!decision) return;
    setSaving(true);
    try {
      await api.patch(`/hr/applications/${decision.application.id}`, {
        status: decision.status,
        ...(decision.status === "rejected" && reason.trim() ? { rejection_reason: reason.trim() } : {}),
      });
      toast.success(decision.status === "accepted" ? "Candidate accepted." : "Candidate rejected.");
      setDecision(null);
      setReason("");
      await loadCandidates();
    } catch (requestError) {
      toast.error(apiErrorMessage(requestError, "Could not update this candidate."));
    } finally {
      setSaving(false);
    }
  };

  const columns: Column<Application>[] = [
    {
      key: "candidate",
      header: "Candidate",
      render: (application) => (
        <Link href={`/hr/candidates/${application.id}`} className="font-medium text-blue-600 hover:text-blue-700">
          {application.candidate?.name ?? "Candidate"}
        </Link>
      ),
    },
    { key: "job", header: "Job", render: (application) => application.job?.title ?? "Job" },
    {
      key: "screened-by",
      header: "Shortlisted by",
      render: (application) => application.shortlisted_by?.name ?? "—",
    },
    {
      key: "cv",
      header: "CV",
      render: (application) => application.cv_preview_url ? (
        <a href={application.cv_preview_url} target="_blank" rel="noreferrer" onClick={(event) => event.stopPropagation()} className="font-medium text-blue-600 hover:text-blue-700">
          View CV
        </a>
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
      render: (application) => activeTab === "shortlisted" ? (
        <div className="flex items-center gap-2">
          <Button className="min-h-8 px-2.5 py-1 text-xs" onClick={() => setDecision({ application, status: "accepted" })}>Accept</Button>
          <Button variant="danger" className="min-h-8 px-2.5 py-1 text-xs" onClick={() => setDecision({ application, status: "rejected" })}>Reject</Button>
        </div>
      ) : <span className="text-sm text-gray-500">—</span>,
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Shortlisted Candidates</h1>
        <p className="mt-1 text-sm text-gray-500">Review candidates passed forward by your screening team.</p>
      </div>
      <div className="mb-5 flex gap-1 overflow-x-auto border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium ${
              activeTab === tab.value
                ? "border-blue-600 text-blue-700"
                : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            {tab.label}
            {tab.value === activeTab && !loading && <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs">{applications.length}</span>}
          </button>
        ))}
      </div>
      {loading ? <Skeleton rows={4} /> : error ? <ErrorState onRetry={() => void loadCandidates()} /> : applications.length === 0 ? (
        <EmptyState
          title={activeTab === "shortlisted" ? "No candidates awaiting a decision" : `No ${activeTab} candidates`}
          description="Candidates in this status will appear here."
        />
      ) : (
        <DataTable rows={applications} columns={columns} />
      )}
      <Modal
        open={Boolean(decision)}
        onClose={() => {
          setDecision(null);
          setReason("");
        }}
        title={decision?.status === "accepted" ? "Accept this candidate?" : "Reject this candidate?"}
      >
        <p className="text-sm text-gray-600">
          Are you sure you want to {decision?.status} {decision?.application.candidate?.name ?? "this candidate"}?
        </p>
        {decision?.status === "rejected" && (
          <Textarea
            className="mt-4"
            label="Reason (optional)"
            rows={3}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Share a brief reason."
          />
        )}
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => { setDecision(null); setReason(""); }}>Cancel</Button>
          <Button variant={decision?.status === "rejected" ? "danger" : "primary"} onClick={() => void submitDecision()} disabled={saving}>
            {saving ? "Saving..." : decision?.status === "accepted" ? "Accept" : "Reject"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
