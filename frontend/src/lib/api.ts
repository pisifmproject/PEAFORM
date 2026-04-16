// API Base URL - automatically switches between dev and production
export const API_BASE_URL = import.meta.env.DEV
  ? "http://localhost:3002"
  : "http://10.125.48.102:3002";

// Helper function for API calls
export async function apiCall(endpoint: string, options?: RequestInit) {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: "Request failed" }));
    throw new Error(error.error || "Request failed");
  }

  return response.json();
}

// Helper function for file upload
export async function uploadFiles(files: File[]) {
  const formData = new FormData();
  files.forEach(file => {
    formData.append('files', file);
  });

  const url = `${API_BASE_URL}/api/forms/upload`;
  const response = await fetch(url, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Upload failed" }));
    throw new Error(error.error || "Upload failed");
  }

  return response.json();
}

// Helper function to get download URL
export function getDownloadUrl(filename: string): string {
  return `${API_BASE_URL}/api/forms/download/${filename}`;
}
