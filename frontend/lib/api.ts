/**
 * Centralized API Client for FastAPI backend
 * Uses NEXT_PUBLIC_API_URL environment variable
 */

export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

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

  return response.json();
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