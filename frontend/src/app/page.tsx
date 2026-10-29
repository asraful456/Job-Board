"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import api from "@/lib/api";
import { apiErrorMessage, listFromResponse } from "@/lib/data";
import JobCard from "@/components/JobCard";
import PublicShell from "@/components/PublicShell";
import { Button, EmptyState, ErrorState, Input, Select, Skeleton } from "@/components/ui";
import type { Job, PaginatedResponse } from "@/types";

export default function HomePage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [searchText, setSearchText] = useState("");
  const [location, setLocation] = useState("");
  const [locationText, setLocationText] = useState("");
  const [jobType, setJobType] = useState("");
  const [category, setCategory] = useState("");
  const [salaryMin, setSalaryMin] = useState("");
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  const loadJobs = useCallback(async () => {
    try {
      const { data } = await api.get<Job[] | PaginatedResponse<Job>>("/jobs", {
        params: {
          search: keyword,
          location,
          type: jobType,
          category,
          salary_min: salaryMin || undefined,
          remote: remoteOnly || undefined,
          page,
        },
      });
      setJobs(listFromResponse(data));
      setError(false);
      setLastPage(Array.isArray(data) ? 1 : data.last_page ?? 1);
      setTotal(Array.isArray(data) ? data.length : data.total ?? data.data.length);
    } catch (requestError) {
      setError(true);
      toast.error(apiErrorMessage(requestError, "Could not load jobs."));
    } finally {
      setLoading(false);
    }
  }, [keyword, location, jobType, category, salaryMin, remoteOnly, page]);

  useEffect(() => {
    const timeout = window.setTimeout(() => void loadJobs(), 0);
    return () => window.clearTimeout(timeout);
  }, [loadJobs]);

  const search = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setKeyword(searchText);
    setLocation(locationText);
    setPage(1);
  };

  const content = error ? (
    <ErrorState onRetry={() => void loadJobs()} />
  ) : loading ? (
    <Skeleton rows={4} />
  ) : jobs.length === 0 ? (
    <EmptyState
      title="No jobs found"
      description="Try changing your search or filters to find more opportunities."
    />
  ) : (
    <>
      <div className="space-y-4">
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>
      {lastPage > 1 && (
        <nav className="mt-7 flex items-center justify-center gap-3" aria-label="Pagination">
          <Button
            variant="outline"
            disabled={page <= 1}
            onClick={() => setPage((current) => current - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600">
            Page {page} of {lastPage}
          </span>
          <Button
            variant="outline"
            disabled={page >= lastPage}
            onClick={() => setPage((current) => current + 1)}
          >
            Next
          </Button>
        </nav>
      )}
    </>
  );

  return (
    <PublicShell>
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 text-center sm:px-6 sm:py-20 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-blue-600">
            Find work that moves you forward
          </p>
          <h1 className="mx-auto mt-3 max-w-3xl text-3xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
            Find your next job
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-gray-600">
            Discover roles from teams that are ready to meet you.
          </p>
          <form
            onSubmit={search}
            className="mx-auto mt-8 grid max-w-5xl gap-3 rounded-xl border border-gray-200 bg-white p-3 shadow-lg shadow-gray-200/50 sm:grid-cols-[1.4fr_1fr_auto]"
          >
            <Input
              label="Job title or keyword"
              aria-label="Job title or keyword"
              placeholder="e.g. Frontend Developer"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              className="text-left"
            />
            <Input
              label="Location"
              aria-label="Location"
              placeholder="e.g. Dhaka or Remote"
              value={locationText}
              onChange={(event) => setLocationText(event.target.value)}
              className="text-left"
            />
            <Button className="self-end sm:min-h-11">Search jobs</Button>
          </form>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[240px_minmax(0,1fr)]">
          <aside className="h-fit rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-gray-900">Filters</h2>
            <div className="mt-5 space-y-5">
              <Select
                label="Job type"
                value={jobType}
                onChange={(event) => {
                  setJobType(event.target.value);
                  setPage(1);
                }}
              >
                <option value="">All types</option>
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
              </Select>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={remoteOnly}
                  onChange={(event) => {
                    setRemoteOnly(event.target.checked);
                    setPage(1);
                  }}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                Remote only
              </label>
              <Select
                label="Category"
                value={category}
                onChange={(event) => {
                  setCategory(event.target.value);
                  setPage(1);
                }}
              >
                <option value="">All categories</option>
                <option value="engineering">Engineering</option>
                <option value="design">Design</option>
                <option value="marketing">Marketing</option>
                <option value="sales">Sales</option>
                <option value="operations">Operations</option>
              </Select>
              <Select
                label="Minimum salary"
                value={salaryMin}
                onChange={(event) => {
                  setSalaryMin(event.target.value);
                  setPage(1);
                }}
              >
                <option value="">Any salary</option>
                <option value="20000">৳20,000+</option>
                <option value="40000">৳40,000+</option>
                <option value="60000">৳60,000+</option>
                <option value="100000">৳100,000+</option>
              </Select>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setKeyword("");
                  setSearchText("");
                  setLocation("");
                  setLocationText("");
                  setJobType("");
                  setCategory("");
                  setSalaryMin("");
                  setRemoteOnly(false);
                  setPage(1);
                }}
              >
                Clear filters
              </Button>
            </div>
          </aside>
          <div>
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Explore jobs</h2>
                <p className="mt-1 text-sm text-gray-500">
                  {loading ? "Finding opportunities..." : `${total} jobs found`}
                </p>
              </div>
              <Link href="/register" className="text-sm font-medium text-blue-600 hover:text-blue-700" id="companies">
                Hiring? Create a company account
              </Link>
            </div>
            {content}
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
