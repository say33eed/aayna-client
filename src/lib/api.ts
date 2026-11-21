export type HealthResponse = {
  success: boolean;
  message: string;
  data: { service: string; status: string };
};

const FALLBACK_API_URL = "https://aayna-server.onrender.com";

export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || FALLBACK_API_URL
).replace(/\/+$/, "");

export class ApiError extends Error {
  constructor(message: string, public readonly status?: number) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiRequest<T>(
  path: `/${string}`,
  options: RequestInit = {},
): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  const { signal, ...rest } = options;
  const abortFromCaller = () => controller.abort();
  signal?.addEventListener("abort", abortFromCaller, { once: true });
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...rest,
      cache: "no-store",
      signal: controller.signal,
    });
    if (!response.ok) {
      throw new ApiError(`API returned HTTP ${response.status}.`, response.status);
    }
    try {
      return (await response.json()) as T;
    } catch {
      throw new ApiError("API returned an invalid JSON response.");
    }
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (controller.signal.aborted) {
      throw new ApiError("Request timed out or was cancelled.");
    }
    throw new ApiError("Unable to reach the API. Check your connection and CORS settings.");
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener("abort", abortFromCaller);
  }
}

export async function getApiHealth(): Promise<HealthResponse> {
  const result = await apiRequest<HealthResponse>("/health");
  if (
    result?.success !== true ||
    result.data?.service !== "aayna-server" ||
    result.data?.status !== "ok"
  ) {
    throw new ApiError("The API health response was unexpected.");
  }
  return result;
}
