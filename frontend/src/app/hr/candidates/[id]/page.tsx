"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";
import api from "@/lib/api";
import { apiErrorMessage } from "@/lib/data";
import type { Application } from "@/types";
import StatusBadge from "@/components/StatusBadge";
import { Button, ErrorState, Modal, Skeleton, Textarea } from "@/components/ui";

type Decision = "accepted" | "rejected" | null;

export default function HrCandidateDetailPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-4xl"><Skeleton rows={3} /></div>}>
      <HrCandidateDetailContent />
    </Suspense>
  );
}

function HrCandidateDetailContent() {
  const { id } = useParams<{ id: string }>();
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [decision, setDecision] = useState<Decision>(null);
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);

  const loadApplication = useCallback(async () => {
    try {
      const { data } = await api.get<Application>(`/hr/candidates/${id}`);
      setApplication(data);
      setError(false);
    } catch (requestError) {
      setError(true);
      toast.error(apiErrorMessage(requestError, "Could not load candidate details."));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    const timeout = window.setTimeout(() => void loadApplication(), 0);
    return () => window.clearTimeout(timeout);
  }, [loadApplication]);

  const submitDecision = async () => {
    if (!application || !decision) return;
    setSaving(true);
    try {
      await api.patch(`/hr/applications/${application.id}`, {
        status: decision,
        ...(decision === "rejected" && reason.trim() ? { rejection_reason: reason.trim() } : {}),
      });
      toast.success(decision === "accepted" ? "Candidate accepted." : "Candidate rejected.");
      setDecision(null);
      await loadApplication();
    } catch (requestError) {
      toast.error(apiErrorMessage(requestError, "Could not update this candidate."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/hr/candidates" className="text-sm font-medium text-blue-600 hover:text-blue-700">← Back to candidates</Link>
      {loading ? <div className="mt-5"><Skeleton rows={3} /></div> : error ? (
        <div className="mt-5"><ErrorState onRetry={() => void loadApplication()} /></div>
      ) : application ? (
        <>
          <section className="mt-5 rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">{application.candidate?.name ?? "Candidate"}</h1>
                <p className="mt-2 text-sm text-gray-600">
                  {application.candidate?.email}
                  {application.phone && ` · ${application.phone}`}
                </p>
              </div>
              <StatusBadge status={application.status} />
            </div>
            <div className="mt-7 grid gap-6 border-t border-gray-100 pt-6 sm:grid-cols-2">
              <div>
                <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Applied for</h2>
                <p className="mt-1 font-medium text-gray-900">{application.job?.title ?? "Job"}</p>
              </div>
              <div>
                <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Shortlisted by</h2>
                <p className="mt-1 text-gray-900">
                  {application.shortlisted_by?.name ?? "Screening team"}
                  {application.shortlisted_at && ` · ${new Date(application.shortlisted_at).toLocaleDateString()}`}
                </p>
              </div>
              <div>
                <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Applied on</h2>
                <p className="mt-1 text-gray-900">{new Date(application.created_at).toLocaleDateString()}</p>
              </div>
            </div>
            {application.cover_letter && (
              <div className="mt-7 border-t border-gray-100 pt-6">
                <h2 className="font-semibold text-gray-900">Cover letter</h2>
                <p className="mt-2 whitespace-pre-line text-sm leading-7 text-gray-600">{application.cover_letter}</p>
              </div>
            )}
            <div className="mt-7 border-t border-gray-100 pt-6">
              <h2 className="font-semibold text-gray-900">CV</h2>
              {application.cv_preview_url ? (
                <div className="mt-3 flex flex-wrap gap-3">
                  <a href={application.cv_preview_url} target="_blank" rel="noreferrer">
                    <span className="inline-flex min-h-10 items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Preview CV</span>
                  </a>
                  <a href={application.cv_url} download>
                    <span className="inline-flex min-h-10 items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Download CV</span>
                  </a>
                </div>
              ) : <p className="mt-2 text-sm text-gray-500">No CV was submitted.</p>}
            </div>
            {application.status === "shortlisted" && (
              <div className="mt-8 flex justify-end gap-3 border-t border-gray-100 pt-6">
                <Button variant="danger" onClick={() => setDecision("rejected")}>Reject</Button>
                <Button onClick={() => setDecision("accepted")}>Accept</Button>
              </div>
            )}
          </section>
          <Modal
            open={Boolean(decision)}
            onClose={() => { setDecision(null); setReason(""); }}
            title={decision === "accepted" ? "Accept this candidate?" : "Reject this candidate?"}
          >
            <p className="text-sm text-gray-600">
              Are you sure you want to {decision} {application.candidate?.name ?? "this candidate"}?
            </p>
            {decision === "rejected" && (
              <Textarea className="mt-4" label="Reason (optional)" rows={3} value={reason} onChange={(event) => setReason(event.target.value)} />
            )}
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" onClick={() => { setDecision(null); setReason(""); }}>Cancel</Button>
              <Button variant={decision === "rejected" ? "danger" : "primary"} onClick={() => void submitDecision()} disabled={saving}>
                {saving ? "Saving..." : decision === "accepted" ? "Accept" : "Reject"}
              </Button>
            </div>
          </Modal>
        </>
      ) : null}
    </div>
  );
}
