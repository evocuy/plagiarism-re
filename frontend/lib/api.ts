/**
 * Centralized API Client for FastAPI backend
 * Uses NEXT_PUBLIC_API_URL environment variable
 */

// Jika NEXT_PUBLIC_API_URL kosong, gunakan relative URL (/api/...)
// sehingga semua request lewat proxy Next.js (same-origin, no CORS, no SameSite issue).
export const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

/**
 * Standard API response error handler and fetch wrapper
 */
export async function apiFetch<T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = `${API_BASE}${cleanEndpoint}`;

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  // Only attach application/json Content-Type if not sending FormData
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: "include",
  });

  if (!response.ok) {
    let errorDetail = `HTTP ${response.status}: ${response.statusText}`;
    try {
      const errorJson = await response.json();
      if (errorJson.detail) {
        errorDetail = errorJson.detail;
      } else if (errorJson.message) {
        errorDetail = errorJson.message;
      }
    } catch {
      // If response is not JSON, try text
      try {
        const text = await response.text();
        if (text) errorDetail = text;
      } catch {
        // ignore
      }
    }
    throw new Error(errorDetail);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

export type AuthRole = "mahasiswa" | "dosen" | "super_admin";

export interface AuthUser {
  id: number;
  identifier: string;
  name: string;
  email: string;
  role: AuthRole;
  program_studi?: string | null;
  fakultas?: string | null;
}

interface LoginResponse {
  user: AuthUser;
}

export async function loginApi(identifier: string, password: string): Promise<AuthUser> {
  const response = await apiFetch<LoginResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ identifier, password }),
  });
  return response.user;
}

export async function getCurrentUserApi(signal?: AbortSignal): Promise<AuthUser> {
  return apiFetch<AuthUser>("/api/auth/me", { method: "GET", signal });
}

export async function logoutApi(): Promise<void> {
  await apiFetch<void>("/api/auth/logout", { method: "POST" });
}

export interface CreateManagedUserInput {
  identifier: string;
  name: string;
  email: string;
  password: string;
  role: "mahasiswa" | "dosen";
  program_studi?: string;
  fakultas?: string;
}

export async function createManagedUserApi(input: CreateManagedUserInput): Promise<AuthUser> {
  return apiFetch<AuthUser>("/api/auth/users", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

/**
 * Backend Data Models
 */
export interface ApiDocument {
  id: number;
  title: string;
  document_type: string;
  file_path: string;
  created_at: string;
}

export interface UploadResponse {
  id: number;
  filename: string;
  document_type?: string;
  file_path: string;
  message: string;
}

export interface MatchResult {
  repository_document_id: number;
  title: string;
  similarity_score: number;
  similarity_percentage: string;
}

export interface CheckRepositoryResponse {
  check_id: number;
  target_document: string;
  highest_similarity_percentage: string;
  total_repository_checked: number;
  matches: MatchResult[];
}

/**
 * Upload a PDF document to FastAPI (POST /api/documents/upload)
 */
export async function uploadDocumentApi(
  file: File,
  documentType: string = "skripsi"
): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("document_type", documentType);

  return apiFetch<UploadResponse>("/api/documents/upload", {
    method: "POST",
    body: formData,
  });
}

/**
 * Retrieve all uploaded documents from FastAPI (GET /api/documents/)
 */
export async function getAllDocumentsApi(): Promise<ApiDocument[]> {
  return apiFetch<ApiDocument[]>("/api/documents/", {
    method: "GET",
  });
}

/**
 * Trigger similarity check against internal repository (POST /api/plagiarism/check-repository/{id})
 */
export async function checkRepositoryApi(documentId: number): Promise<CheckRepositoryResponse> {
  return apiFetch<CheckRepositoryResponse>(`/api/plagiarism/check-repository/${documentId}`, {
    method: "POST",
  });
}