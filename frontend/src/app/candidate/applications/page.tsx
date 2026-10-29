"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "@/lib/api";
import { apiErrorMessage } from "@/lib/data";
import type { Application } from "@/types";
import StatusBadge from "@/components/StatusBadge";
import DataTable, { type Column } from "@/components/DataTable";
import { EmptyState, ErrorState, Modal, Skeleton } from "@/components/ui";

export default function CandidateApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [selected, setSelected] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadApplications = useCallback(async () => {
    try {
      const { data } = await api.get<Application[]>("/v1/candidate/applications");
      setApplications(data);
      setError(false);
    } catch (requestError) {
      setError(true);
      toast.error(apiErrorMessage(requestError, "Could not load your applications."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => void loadApplications(), 0);
    return () => window.clearTimeout(timeout);
  }, [loadApplications]);

  const columns: Column<Application>[] = [
    {
      key: "job",
      header: "Job",
      render: (application) => (
        <span className="font-medium text-gray-900">
          {application.job?.title ?? "Job"}
        </span>
      ),
    },
    {
      key: "company",
      header: "Company",
      render: (application) =>
        application.job?.company?.name ?? application.job?.company_name ?? "—",
    },
    {
      key: "applied",
      header: "Applied on",
      render: (application) => new Date(application.created_at).toLocaleDateString(),
    },
    {
      key: "status",
      header: "Status",
      render: (application) => (
        <StatusBadge status={application.status} audience="candidate" />
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">My Applications</h1>
        <p className="mt-1 text-sm text-gray-500">
          Track the latest status of your job applications.
        </p>
      </div>
      {loading ? (
        <Skeleton rows={4} />
      ) : error ? (
        <ErrorState onRetry={() => void loadApplications()} />
      ) : applications.length === 0 ? (
        <EmptyState
          title="No applications yet"
          description="When you apply for a role, it will appear here."
        />
      ) : (
        <DataTable
          rows={applications}
          columns={columns}
          onRowClick={setSelected}
        />
      )}
      <Modal
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title="Application details"
      >
        {selected && (
          <div className="space-y-4 text-sm">
            <div>
              <p className="text-gray-500">Job</p>
              <p className="font-medium text-gray-900">{selected.job?.title ?? "Job"}</p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-gray-500">Status</p>
              <StatusBadge status={selected.status} audience="candidate" />
            </div>
            <div>
              <p className="text-gray-500">Applied on</p>
              <p className="text-gray-900">
                {new Date(selected.created_at).toLocaleString()}
              </p>
            </div>
            {selected.cover_letter && (
              <div>
                <p className="text-gray-500">Cover letter</p>
                <p className="whitespace-pre-line text-gray-900">{selected.cover_letter}</p>
              </div>
            )}
            {selected.cv_preview_url && (
              <a
                href={selected.cv_preview_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex font-medium text-blue-600 hover:text-blue-700"
              >
                View submitted CV
              </a>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
