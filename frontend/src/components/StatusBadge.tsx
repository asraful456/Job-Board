import {
  getCandidateApplicationLabel,
  type ApplicationStatus,
} from "@/types";

const colors: Record<ApplicationStatus, string> = {
  applied: "bg-gray-100 text-gray-700",
  shortlisted: "bg-blue-100 text-blue-700",
  screening_rejected: "bg-red-100 text-red-700",
  accepted: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

const labels: Record<ApplicationStatus, string> = {
  applied: "Applied",
  shortlisted: "Shortlisted",
  screening_rejected: "Screening Rejected",
  accepted: "Accepted",
  rejected: "Rejected",
};

export default function StatusBadge({
  status,
  audience = "team",
}: {
  status: ApplicationStatus;
  audience?: "team" | "candidate";
}) {
  const label =
    audience === "candidate" ? getCandidateApplicationLabel(status) : labels[status];
  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${colors[status]}`}
    >
      {label}
    </span>
  );
}
