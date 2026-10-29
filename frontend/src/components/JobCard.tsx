import Link from "next/link";
import type { Job } from "@/types";

export default function JobCard({ job }: { job: Job }) {
  const companyName = job.company?.name ?? job.company_name ?? "Company";

  return (
    <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-blue-200 hover:shadow-md">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-blue-50 text-lg font-semibold text-blue-700">
          {job.company?.logo_url ? (
            <img
              src={job.company.logo_url}
              alt={companyName}
              className="h-full w-full object-cover"
            />
          ) : (
            companyName.charAt(0).toUpperCase()
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-base font-semibold text-gray-900">
            <Link href={`/jobs/${job.id}`} className="hover:text-blue-600">
              {job.title}
            </Link>
          </h2>
          <p className="mt-1 text-sm text-gray-600">{companyName}</p>
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
            job.status === "closed"
              ? "bg-gray-100 text-gray-600"
              : "bg-green-50 text-green-700"
          }`}
        >
          {job.status === "closed" ? "Closed" : "Open"}
        </span>
      </div>
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-500">
        <span>{job.location}</span>
        <span>{job.type}</span>
        {job.salary && <span>{job.salary}</span>}
        {!job.salary && (job.salary_min || job.salary_max) && (
          <span>
            {job.salary_min ? `৳${job.salary_min.toLocaleString()}` : ""}
            {job.salary_min && job.salary_max ? " - " : ""}
            {job.salary_max ? `৳${job.salary_max.toLocaleString()}` : ""}
          </span>
        )}
      </div>
      <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
        <p className="text-xs text-gray-500">
          Posted {new Date(job.created_at).toLocaleDateString()}
        </p>
        <Link
          href={`/jobs/${job.id}`}
          className="text-sm font-semibold text-blue-600 hover:text-blue-700"
        >
          View job <span aria-hidden="true">→</span>
        </Link>
      </div>
    </article>
  );
}
