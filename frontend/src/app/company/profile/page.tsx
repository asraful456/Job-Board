"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "@/lib/api";
import { apiErrorMessage } from "@/lib/data";
import type { Company } from "@/types";
import { Button, ErrorState, Input, Skeleton, Textarea } from "@/components/ui";

export default function CompanyProfilePage() {
  const [profile, setProfile] = useState<Company>({ id: 0, name: "" });
  const [logo, setLogo] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadProfile = useCallback(async () => {
    try {
      const { data } = await api.get<Company>("/company/profile");
      setProfile(data);
      setError(false);
    } catch (requestError) {
      setError(true);
      toast.error(apiErrorMessage(requestError, "Could not load the company profile."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => void loadProfile(), 0);
    return () => window.clearTimeout(timeout);
  }, [loadProfile]);

  const save = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("_method", "PATCH");
      formData.append("name", profile.name);
      formData.append("website", profile.website ?? "");
      formData.append("location", profile.location ?? "");
      formData.append("about", profile.about ?? "");
      if (logo) formData.append("logo", logo);
      await api.post("/company/profile", formData);
      toast.success("Company profile saved.");
      setLogo(null);
      await loadProfile();
    } catch (requestError) {
      toast.error(apiErrorMessage(requestError, "Could not save your company profile."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Company Profile</h1>
        <p className="mt-1 text-sm text-gray-500">Help candidates get to know your company.</p>
      </div>
      {loading ? <Skeleton rows={3} /> : error ? <ErrorState onRetry={() => void loadProfile()} /> : (
        <form onSubmit={(event) => void save(event)} className="space-y-5 rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
          <div>
            <label htmlFor="company-logo" className="mb-1.5 block text-sm font-medium text-gray-700">Company logo</label>
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl bg-blue-50 font-semibold text-blue-700">
                {profile.logo_url ? <span role="img" aria-label="Company logo" className="h-full w-full bg-cover bg-center" style={{ backgroundImage: `url("${profile.logo_url}")` }} /> : profile.name.charAt(0).toUpperCase() || "C"}
              </div>
              <input id="company-logo" type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => setLogo(event.target.files?.[0] ?? null)} className="text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:font-medium file:text-blue-700" />
            </div>
          </div>
          <Input label="Company name" required value={profile.name} onChange={(event) => setProfile({ ...profile, name: event.target.value })} />
          <Input label="Website" type="url" placeholder="https://example.com" value={profile.website ?? ""} onChange={(event) => setProfile({ ...profile, website: event.target.value })} />
          <Input label="Location" placeholder="Dhaka, Bangladesh" value={profile.location ?? ""} onChange={(event) => setProfile({ ...profile, location: event.target.value })} />
          <Textarea label="About" rows={6} placeholder="Tell candidates about your company." value={profile.about ?? ""} onChange={(event) => setProfile({ ...profile, about: event.target.value })} />
          <div className="flex justify-end border-t border-gray-100 pt-4">
            <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save profile"}</Button>
          </div>
        </form>
      )}
    </div>
  );
}
