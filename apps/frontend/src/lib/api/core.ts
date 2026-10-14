import {
  ApiError,
  type ApiFailure,
  type ApiResult,
  type ApiSuccess,
  type RequestOptions,
} from "./types";

export interface RequestConfig extends RequestOptions {
  body?: unknown;
}

export interface ApiClient {
  request<T>(
    method: string,
    path: string,
    config?: RequestConfig,
  ): Promise<ApiResult<T>>;
  get<T>(path: string, options?: RequestOptions): Promise<ApiResult<T>>;
  post<T>(
    path: string,
    body?: unknown,
    options?: RequestOptions,
  ): Promise<ApiResult<T>>;
  patch<T>(
    path: string,
    body?: unknown,
    options?: RequestOptions,
  ): Promise<ApiResult<T>>;
  put<T>(
    path: string,
    body?: unknown,
    options?: RequestOptions,
  ): Promise<ApiResult<T>>;
  del<T>(path: string, options?: RequestOptions): Promise<ApiResult<T>>;
}

/**
 * Build an API client bound to a base URL.
 * Shared by `client.ts` (public URL) and `server.ts` (private URL).
 */
export function createApi(baseUrl: string): ApiClient {
  const request = async <T>(
    method: string,
    path: string,
    config: RequestConfig = {},
  ): Promise<ApiResult<T>> => {
    const { token, headers, body, signal } = config;

    const res = await fetch(`${baseUrl}${path}`, {
      method,
      signal,
      body: body === undefined ? undefined : JSON.stringify(body),
      headers: {
        "content-type": "application/json",
        ...(token ? { authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
    });

    const json = (await res.json().catch(() => null)) as
      | ApiSuccess<T>
      | ApiFailure
      | null;

    if (!res.ok || !json || json.success === false) {
      const error = json && json.success === false ? json.error : undefined;
      throw new ApiError(
        res.status,
        error?.code ?? "UNKNOWN",
        error?.message ?? `Permintaan gagal (${res.status})`,
        error?.details,
      );
    }

    return { data: json.data, meta: json.meta };
  };

  return {
    request,
    get: <T>(path: string, options?: RequestOptions) =>
      request<T>("GET", path, options),
    post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
      request<T>("POST", path, { ...options, body }),
    patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
      request<T>("PATCH", path, { ...options, body }),
    put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
      request<T>("PUT", path, { ...options, body }),
    del: <T>(path: string, options?: RequestOptions) =>
      request<T>("DELETE", path, options),
  };
}
