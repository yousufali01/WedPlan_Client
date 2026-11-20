
import { authClient } from "@/lib/auth-client";

const envAPIURL = process.env.NEXT_PUBLIC_API_URL;

if (!envAPIURL) {
  throw new Error(
    "NEXT_PUBLIC_API_URL is missing. Configure your backend URL."
  );
}

// Validated API URL
const API_URL: string = envAPIURL.replace(/\/+$/, "");

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  let token: string | undefined;

  // Get Better Auth JWT token
  try {
    const { data, error } = await authClient.token();

    if (!error && data?.token) {
      token = data.token;
    }
  } catch {
    // Session cookie can still authenticate the request.
  }

  // Safely merge headers
  const headers = new Headers(options.headers);

  if (
    !headers.has("Content-Type") &&
    !(options.body instanceof FormData)
  ) {
    headers.set("Content-Type", "application/json");
  }

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const cleanEndpoint = endpoint.startsWith("/")
    ? endpoint
    : `/${endpoint}`;

  const response = await fetch(
    `${API_URL}${cleanEndpoint}`,
    {
      ...options,
      credentials: "include",
      headers,
    }
  );

  // Handle empty response
  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get("content-type");

  const result = contentType?.includes("application/json")
    ? await response.json()
    : await response.text();

  // Handle API errors
  if (!response.ok) {
    const message =
      typeof result === "object" && result !== null
        ? result.message || result.error
        : result;

    throw new Error(
      message || `API request failed: ${response.status}`
    );
  }

  return result as T;
}
