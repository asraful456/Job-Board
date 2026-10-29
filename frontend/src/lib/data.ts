import axios from "axios";
import type { PaginatedResponse } from "@/types";

export function listFromResponse<T>(data: T[] | PaginatedResponse<T>): T[] {
  return Array.isArray(data) ? data : data.data;
}

export function apiErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (typeof message === "string" && message.length > 0) return message;
    if (!error.response) return "Could not connect to the server. Please try again.";
  }
  return fallback;
}
