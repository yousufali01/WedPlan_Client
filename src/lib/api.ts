
import { authClient } from "@/lib/auth-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const { data, error } = await authClient.token();

  if (error || !data?.token) {
    throw new Error("Authentication required. Please sign in again.");
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
      Authorization: `Bearer ${data.token}`,
    },
  });

  if (!response.ok) {
    const result = await response.json().catch(() => null);
    throw new Error(result?.message || `Request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}
