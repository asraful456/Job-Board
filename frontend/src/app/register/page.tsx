"use client";

import Link from "next/link";
import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Button, Input } from "@/components/ui";
import { useAuth, getRoleHome } from "@/context/AuthContext";
import { apiErrorMessage } from "@/lib/data";
import PublicShell from "@/components/PublicShell";

const schema = z
  .object({
    name: z.string().trim().min(2, "Enter your name."),
    company_name: z.string().optional(),
    email: z.email("Enter a valid email address."),
    password: z.string().min(8, "Use at least 8 characters."),
    password_confirmation: z.string().min(1, "Confirm your password."),
  })
  .refine((values) => values.password === values.password_confirmation, {
    message: "Passwords do not match.",
    path: ["password_confirmation"],
  });

type FormValues = z.infer<typeof schema>;
type AccountType = "candidate" | "company_admin";

export default function RegisterPage() {
  const [accountType, setAccountType] = useState<AccountType | null>(null);
  const { register: createAccount } = useAuth();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = handleSubmit(async (values) => {
    if (!accountType) {
      toast.error("Choose whether you are looking for a job or hiring.");
      return;
    }
    if (accountType === "company_admin" && !values.company_name?.trim()) {
      toast.error("Enter your company name.");
      return;
    }
    try {
      const user = await createAccount({
        name: values.name.trim(),
        email: values.email,
        password: values.password,
        password_confirmation: values.password_confirmation,
        role: accountType,
        ...(accountType === "company_admin"
          ? { company_name: values.company_name?.trim() }
          : {}),
      });
      toast.success("Your account is ready.");
      router.replace(getRoleHome(user.role));
    } catch (error) {
      toast.error(apiErrorMessage(error, "Unable to create your account."));
    }
  });

  return (
    <PublicShell>
      <div className="mx-auto min-h-[70vh] max-w-2xl px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold text-gray-900">Create your account</h1>
        <p className="mt-2 text-sm text-gray-500">Choose how you want to use JobBoard.</p>
      </div>
      <div className="mb-7 grid gap-4 sm:grid-cols-2">
        {(
          [
            ["candidate", "♙", "I'm a Candidate", "I'm looking for my next role."],
            ["company_admin", "▣", "I'm hiring", "I want to hire great people."],
          ] as const
        ).map(([role, icon, title, description]) => (
          <button
            key={role}
            type="button"
            onClick={() => setAccountType(role)}
            aria-pressed={accountType === role}
            className={`rounded-xl border bg-white p-5 text-left transition ${
              accountType === role
                ? "border-blue-600 ring-2 ring-blue-100"
                : "border-gray-200 hover:border-blue-300"
            }`}
          >
            <span className="text-2xl text-blue-600" aria-hidden="true">
              {icon}
            </span>
            <span className="mt-3 block font-semibold text-gray-900">{title}</span>
            <span className="mt-1 block text-sm text-gray-500">{description}</span>
          </button>
        ))}
      </div>
      {accountType && (
        <form
          onSubmit={onSubmit}
          className="space-y-5 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8"
        >
          {accountType === "company_admin" && (
            <Input
              label="Company name"
              placeholder="Acme Inc."
              error={errors.company_name?.message}
              {...register("company_name")}
            />
          )}
          <Input
            label="Your name"
            placeholder="Your full name"
            error={errors.name?.message}
            {...register("name")}
          />
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            error={errors.email?.message}
            {...register("email")}
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <Input
              label="Password"
              type="password"
              error={errors.password?.message}
              {...register("password")}
            />
            <Input
              label="Confirm password"
              type="password"
              error={errors.password_confirmation?.message}
              {...register("password_confirmation")}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Creating account..." : "Create account"}
          </Button>
          <p className="text-center text-xs text-gray-500">
            Screener and HR accounts are added by a company admin.
          </p>
        </form>
      )}
      <p className="mt-6 text-center text-sm text-gray-600">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-blue-600 hover:text-blue-700">
          Login
        </Link>
      </p>
      </div>
    </PublicShell>
  );
}
