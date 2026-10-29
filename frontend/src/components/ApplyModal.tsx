"use client";

import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { apiErrorMessage } from "@/lib/data";
import { Button, Input, Modal, Textarea } from "@/components/ui";
import type { Job } from "@/types";

const MAX_FILE_SIZE = 2 * 1024 * 1024;
const allowedTypes = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);
const allowedExtensions = /\.(pdf|doc|docx)$/i;

export default function ApplyModal({
  job,
  open,
  onClose,
}: {
  job: Job;
  open: boolean;
  onClose: () => void;
}) {
  const { user } = useAuth();
  const fileInput = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [coverLetter, setCoverLetter] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const selectFile = (selected?: File) => {
    if (!selected) return;
    if (!allowedTypes.has(selected.type) && !allowedExtensions.test(selected.name)) {
      toast.error("Upload your CV as a PDF, DOC, or DOCX file.");
      return;
    }
    if (selected.size > MAX_FILE_SIZE) {
      toast.error("Your CV must be 2 MB or smaller.");
      return;
    }
    setFile(selected);
  };

  const submitApplication = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file) {
      toast.error("Please attach your CV before submitting.");
      return;
    }
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("cv", file);
      formData.append("phone", phone);
      formData.append("cover_letter", coverLetter);
      await api.post(`/v1/jobs/${job.id}/apply`, formData);
      toast.success("Your application has been submitted.");
      setFile(null);
      setCoverLetter("");
      onClose();
    } catch (error) {
      toast.error(apiErrorMessage(error, "Unable to submit your application."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={`Apply for ${job.title}`}>
      <form className="space-y-5" onSubmit={submitApplication}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Name" value={user?.name ?? ""} readOnly />
          <Input label="Email" type="email" value={user?.email ?? ""} readOnly />
        </div>
        <Input
          label="Phone"
          type="tel"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          placeholder="Your phone number"
        />
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700" htmlFor="cv-upload">
            CV <span className="text-red-600">*</span>
          </label>
          {file ? (
            <div className="flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50 px-3 py-3">
              <span className="truncate text-sm text-blue-900">{file.name}</span>
              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  if (fileInput.current) fileInput.current.value = "";
                }}
                aria-label="Remove selected CV"
                className="ml-3 rounded px-2 py-1 text-red-600 hover:bg-red-50"
              >
                ×
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                selectFile(event.dataTransfer.files[0]);
              }}
              className="flex min-h-28 w-full flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 text-sm text-gray-600 hover:border-blue-400 hover:bg-blue-50/40"
            >
              <span className="font-medium">Choose a file or drag it here</span>
              <span className="mt-1 text-xs text-gray-500">PDF, DOC, or DOCX · up to 2 MB</span>
            </button>
          )}
          <input
            ref={fileInput}
            id="cv-upload"
            type="file"
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="sr-only"
            onChange={(event) => selectFile(event.target.files?.[0])}
          />
        </div>
        <Textarea
          label="Cover letter (optional)"
          rows={4}
          value={coverLetter}
          onChange={(event) => setCoverLetter(event.target.value)}
          placeholder="Tell the company why you're a good fit."
        />
        <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting && <span className="animate-spin">◌</span>}
            {submitting ? "Submitting..." : "Submit application"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
