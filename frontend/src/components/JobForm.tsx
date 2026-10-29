"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { apiErrorMessage } from "@/lib/data";
import type { Job } from "@/types";
import { Button, Input, Select, Textarea } from "@/components/ui";

const schema = z.object({
  title: z.string().trim().min(2, "Enter a job title."),
  category: z.string().min(1, "Choose a category."),
  type: z.string().min(1, "Choose an employment type."),
  location: z.string().trim().min(2, "Enter a location."),
  salary_min: z.coerce.number().min(0, "Enter a valid minimum salary."),
  salary_max: z.coerce.number().min(0, "Enter a valid maximum salary."),
  deadline: z.string().min(1, "Choose an application deadline."),
  description: z.string().trim().min(20, "Add at least 20 characters."),
  requirements: z.string().trim().min(10, "Add at least 10 characters."),
});

type FormInput = z.input<typeof schema>;
type FormValues = z.output<typeof schema>;

export default function JobForm({ job }: { job?: Job }) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormInput, undefined, FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: job?.title ?? "",
      category: job?.category ?? "",
      type: job?.type ?? "",
      location: job?.location ?? "",
      salary_min: job?.salary_min ?? 0,
      salary_max: job?.salary_max ?? 0,
      deadline: job?.deadline?.slice(0, 10) ?? "",
      description: job?.description ?? "",
      requirements: job?.requirements ?? "",
    },
  });

  const submit = handleSubmit(async (values) => {
    if (values.salary_max && values.salary_min > values.salary_max) {
      toast.error("Maximum salary must be greater than minimum salary.");
      return;
    }
    try {
      const method = job ? "put" : "post";
      const url = job ? `/v1/company/jobs/${job.id}` : "/v1/company/jobs";
      await api[method](url, values);
      toast.success(job ? "Job updated." : "Job posted successfully.");
      router.push("/company/jobs");
      router.refresh();
    } catch (error) {
      toast.error(apiErrorMessage(error, "Unable to save this job."));
    }
  });

  return (
    <form onSubmit={submit} className="space-y-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
      <div className="grid gap-5 sm:grid-cols-2">
        <Input label="Job title" placeholder="Frontend Developer" error={errors.title?.message} {...register("title")} />
        <Select label="Category" error={errors.category?.message} {...register("category")}>
          <option value="">Select category</option>
          <option value="engineering">Engineering</option>
          <option value="design">Design</option>
          <option value="marketing">Marketing</option>
          <option value="sales">Sales</option>
          <option value="operations">Operations</option>
        </Select>
        <Select label="Employment type" error={errors.type?.message} {...register("type")}>
          <option value="">Select type</option>
          <option value="full-time">Full-time</option>
          <option value="part-time">Part-time</option>
          <option value="contract">Contract</option>
          <option value="internship">Internship</option>
        </Select>
        <Input label="Location" placeholder="Dhaka / Remote" error={errors.location?.message} {...register("location")} />
        <Input label="Minimum salary (৳)" type="number" min="0" error={errors.salary_min?.message} {...register("salary_min")} />
        <Input label="Maximum salary (৳)" type="number" min="0" error={errors.salary_max?.message} {...register("salary_max")} />
        <Input label="Application deadline" type="date" error={errors.deadline?.message} {...register("deadline")} />
      </div>
      <Textarea
        label="Description"
        rows={7}
        placeholder="Describe the role and what the successful candidate will do."
        error={errors.description?.message}
        {...register("description")}
      />
      <Textarea
        label="Requirements"
        rows={5}
        placeholder="List the skills and qualifications you are looking for."
        error={errors.requirements?.message}
        {...register("requirements")}
      />
      <div className="flex justify-end gap-3 border-t border-gray-100 pt-5">
        <Button type="button" variant="outline" onClick={() => router.push("/company/jobs")}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : job ? "Save changes" : "Post job"}
        </Button>
      </div>
    </form>
  );
}
