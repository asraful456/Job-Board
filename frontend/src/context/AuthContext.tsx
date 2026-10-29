"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import api from "@/lib/api";
import type { AuthResponse, Role, User } from "@/types";

type LoginCredentials = { email: string; password: string };
type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role: "candidate" | "company_admin";
  company_name?: string;
};

function isUser(value: unknown): value is User {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    typeof value.id === "number" &&
    "name" in value &&
    typeof value.name === "string" &&
    "email" in value &&
    typeof value.email === "string" &&
    "role" in value &&
    typeof value.role === "string" &&
    validRoles.includes(value.role as Role)
  );
}

function userFromResponse(value: unknown): User | null {
  const user =
    typeof value === "object" &&
    value !== null &&
    "data" in value
      ? value.data
      : value;

  return isUser(user) ? user : null;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<User>;
  register: (payload: RegisterPayload) => Promise<User>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const validRoles: Role[] = ["candidate", "company_admin", "screener", "hr"];

export function getRoleHome(role: Role): string {
  switch (role) {
    case "candidate":
      return "/";
    case "company_admin":
      return "/company/dashboard";
    case "screener":
      return "/screener/applicants";
    case "hr":
      return "/hr/candidates";
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const clearSession = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  }, []);

  useEffect(() => {
    let active = true;

    const restoreSession = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        localStorage.removeItem("user");
        if (active) setLoading(false);
        return;
      }

      try {
        const { data } = await api.get<unknown>("/v1/me");
        const restoredUser = userFromResponse(data);

        if (!restoredUser) {
          throw new Error("The server returned invalid user data.");
        }

        localStorage.setItem("user", JSON.stringify(restoredUser));
        if (active) setUser(restoredUser);
      } catch (error) {
        clearSession();
        if (active) {
          toast.error(
            error instanceof Error && error.message === "The server returned invalid user data."
              ? "Could not restore your session. Please log in again."
              : "Could not verify your session. Please log in again.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    void restoreSession();

    return () => {
      active = false;
    };
  }, [clearSession]);

  useEffect(() => {
    const handleUnauthorized = () => setUser(null);
    window.addEventListener("jobboard:unauthorized", handleUnauthorized);
    return () =>
      window.removeEventListener("jobboard:unauthorized", handleUnauthorized);
  }, []);

  const saveAuth = useCallback((auth: AuthResponse) => {
    localStorage.setItem("token", auth.token);
    localStorage.setItem("user", JSON.stringify(auth.user));
    setUser(auth.user);
    return auth.user;
  }, []);

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      const { data } = await api.post<AuthResponse>("/v1/login", credentials);
      return saveAuth(data);
    },
    [saveAuth],
  );

  const register = useCallback(
    async (payload: RegisterPayload) => {
      const { role, ...registrationData } = payload;
      const endpoint =
        role === "candidate"
          ? "/v1/register/candidate"
          : "/v1/register/company";
      const { data } = await api.post<AuthResponse>(
        endpoint,
        registrationData,
      );
      return saveAuth(data);
    },
    [saveAuth],
  );

  const logout = useCallback(async () => {
    try {
      await api.post("/v1/logout");
      toast.success("You have been logged out.");
    } catch {
      toast.error("Your local session was cleared, but the server logout failed.");
    } finally {
      clearSession();
      router.push("/login");
    }
  }, [clearSession, router]);

  const value = useMemo(
    () => ({ user, loading, login, register, logout }),
    [user, loading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside an AuthProvider.");
  }
  return context;
}
