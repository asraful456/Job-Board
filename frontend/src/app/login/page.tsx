"use client";

import Link from "next/link";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAuth, getRoleHome } from "@/context/AuthContext";
import { apiErrorMessage } from "@/lib/data";
import { Button, Input } from "@/components/ui";
import PublicShell from "@/components/PublicShell";

const schema = z.object({
  email: z.email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});
type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const user = await login(values);
      toast.success("Welcome back!");
      router.replace(getRoleHome(user.role));
    } catch (error) {
      toast.error(apiErrorMessage(error, "Unable to log in. Please try again."));
    }
  });

  return (
    <PublicShell>
      <div className="mx-auto flex min-h-[70vh] max-w-md items-center px-4 py-12">
        <section className="w-full rounded-2xl border border-gray-200 bg-white p-7 shadow-sm sm:p-9">
        <div className="mb-7 text-center">
          <h1 className="text-2xl font-semibold text-gray-900">Welcome back</h1>
          <p className="mt-2 text-sm text-gray-500">Log in to your JobBoard account.</p>
        </div>
        <form className="space-y-5" onSubmit={onSubmit}>
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            error={errors.email?.message}
            {...register("email")}
          />
          <Input
            label="Password"
            type="password"
            autoComplete="current-password"
            placeholder="Enter your password"
            error={errors.password?.message}
            {...register("password")}
          />
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting && <span className="animate-spin">◌</span>}
            {isSubmitting ? "Logging in..." : "Login"}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-600">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-semibold text-blue-600 hover:text-blue-700">
            Sign up
          </Link>
        </p>
        </section>
      </div>
    </PublicShell>
  );
}
