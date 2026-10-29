export type Role = "candidate" | "company_admin" | "screener" | "hr";

export type ApplicationStatus =
  | "applied"
  | "shortlisted"
  | "screening_rejected"
  | "accepted"
  | "rejected";

export type CandidateApplicationLabel =
  | "Under Review"
  | "Shortlisted"
  | "Accepted"
  | "Not Selected";

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  phone?: string;
  company_id?: number;
  company?: Company;
}

export interface Company {
  id: number;
  name: string;
  website?: string;
  location?: string;
  about?: string;
  logo_url?: string;
}

export interface Job {
  id: number;
  title: string;
  description: string;
  requirements?: string;
  category?: string;
  location: string;
  type: string;
  salary?: string;
  salary_min?: number;
  salary_max?: number;
  deadline?: string;
  status?: "open" | "closed";
  applicant_count?: number;
  company?: Company;
  company_name?: string;
  created_at: string;
}

export interface Application {
  id: number;
  status: ApplicationStatus;
  cover_letter?: string;
  cv_url?: string;
  cv_preview_url?: string;
  phone?: string;
  created_at: string;
  shortlisted_at?: string;
  rejection_reason?: string;
  job?: Job;
  candidate?: User;
  shortlisted_by?: User;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page?: number;
  last_page?: number;
  total?: number;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export function getCandidateApplicationLabel(
  status: ApplicationStatus,
): CandidateApplicationLabel {
  switch (status) {
    case "applied":
      return "Under Review";
    case "shortlisted":
      return "Shortlisted";
    case "accepted":
      return "Accepted";
    case "screening_rejected":
    case "rejected":
      return "Not Selected";
  }
}
