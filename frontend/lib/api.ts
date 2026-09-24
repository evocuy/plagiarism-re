/**
 * Centralized API Client for FastAPI backend
 * Uses NEXT_PUBLIC_API_URL environment variable
 */

export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Helper to get stored auth token
export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("plagiarism_auth_token");
}

export function setAuthToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) {
    localStorage.setItem("plagiarism_auth_token", token);
  } else {
    localStorage.removeItem("plagiarism_auth_token");
  }
}

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

  const token = getAuthToken();
  if (token && !headers["Authorization"]) {
    headers["Authorization"] = `Bearer ${token}`;
  }

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
      try {
        const text = await response.text();
        if (text) errorDetail = text;
      } catch {
        // ignore
      }
    }
    throw new Error(errorDetail);
  }

  return response.json();
}

/**
 * Auth & User Models
 */
export type Role = "mahasiswa" | "dosen" | "admin";

export interface ApiUser {
  id: number;
  identifier: string;
  name: string;
  email: string;
  role: Role;
  program_studi?: string | null;
  fakultas?: string | null;
  is_active: boolean;
}

export interface LoginResponse {
  token: string;
  user: ApiUser;
}

export interface CreateUserData {
  identifier: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  program_studi?: string;
  fakultas?: string;
}

export async function loginApi(identifier: string, password: string): Promise<LoginResponse> {
  const data = await apiFetch<LoginResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ identifier, password }),
  });
  setAuthToken(data.token);
  return data;
}

export async function getCurrentUserApi(): Promise<ApiUser> {
  return apiFetch<ApiUser>("/api/auth/me", {
    method: "GET",
  });
}

export async function logoutApi(): Promise<void> {
  try {
    await apiFetch("/api/auth/logout", { method: "POST" });
  } catch {
    // ignore
  } finally {
    setAuthToken(null);
  }
}

export async function getAllUsersApi(): Promise<ApiUser[]> {
  return apiFetch<ApiUser[]>("/api/auth/users", {
    method: "GET",
  });
}

export async function createUserApi(userData: CreateUserData): Promise<ApiUser> {
  return apiFetch<ApiUser>("/api/auth/users", {
    method: "POST",
    body: JSON.stringify(userData),
  });
}

export async function deleteUserApi(userId: number): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/api/auth/users/${userId}`, {
    method: "DELETE",
  });
}

/**
 * Backend Data Models
 */
export interface ApiDocument {
  id: number;
  user_id?: number | null;
  owner_name?: string;
  owner_identifier?: string;
  title: string;
  document_type: string;
  file_path: string;
  created_at: string;
}

export interface UploadResponse {
  id: number;
  user_id?: number | null;
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

export interface CheckHistoryItem {
  id: number;
  document_id: number;
  user_id?: number | null;
  owner_name?: string;
  owner_identifier?: string;
  title: string;
  document_type: string;
  file_path: string;
  overall_similarity: number;
  similarity_percentage: string;
  status: string;
  created_at: string;
}

/**
 * Upload a PDF document to FastAPI (POST /api/documents/upload)
 */
export async function uploadDocumentApi(
  file: File,
  documentType: string = "skripsi",
  userId?: number
): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("document_type", documentType);
  if (userId) {
    formData.append("user_id", userId.toString());
  }

  return apiFetch<UploadResponse>("/api/documents/upload", {
    method: "POST",
    body: formData,
  });
}

/**
 * Retrieve uploaded documents from FastAPI (GET /api/documents/)
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

/**
 * Retrieve plagiarism check history (GET /api/plagiarism/history)
 */
export async function getCheckHistoryApi(): Promise<CheckHistoryItem[]> {
  return apiFetch<CheckHistoryItem[]>("/api/plagiarism/history", {
    method: "GET",
  });
}