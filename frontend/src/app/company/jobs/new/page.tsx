import Link from "next/link";
import JobForm from "@/components/JobForm";

export default function NewJobPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/company/jobs" className="text-sm font-medium text-blue-600 hover:text-blue-700">
        ← Back to jobs
      </Link>
      <h1 className="mb-6 mt-4 text-2xl font-semibold text-gray-900">Post a new job</h1>
      <JobForm />
    </div>
  );
}
