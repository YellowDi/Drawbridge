export type ApiClientOptions = {
  baseUrl?: string
  getToken?: () => string
}

export type ApiQueryValue = string | number | boolean | null | undefined

export type ApiRequestOptions = RequestInit & {
  query?: Record<string, ApiQueryValue>
}

export type PaginatedResponse<T> = {
  data: T[]
  total: number
  page: number
  pageSize: number
}

export class ApiClient {
  private readonly baseUrl: string
  private readonly getToken?: () => string

  constructor(options: ApiClientOptions = {}) {
    this.baseUrl = options.baseUrl?.replace(/\/+$/, "") ?? ""
    this.getToken = options.getToken
  }

  get<T>(path: string, options: ApiRequestOptions = {}) {
    return this.request<T>(path, options)
  }

  post<T>(path: string, body: unknown, options: ApiRequestOptions = {}) {
    return this.request<T>(path, {
      ...options,
      method: "POST",
      body: JSON.stringify(body),
    })
  }

  put<T>(path: string, body: unknown, options: ApiRequestOptions = {}) {
    return this.request<T>(path, {
      ...options,
      method: "PUT",
      body: JSON.stringify(body),
    })
  }

  patch<T>(path: string, body: unknown, options: ApiRequestOptions = {}) {
    return this.request<T>(path, {
      ...options,
      method: "PATCH",
      body: JSON.stringify(body),
    })
  }

  delete<T>(path: string, options: ApiRequestOptions = {}) {
    return this.request<T>(path, {
      ...options,
      method: "DELETE",
    })
  }

  async request<T>(path: string, init: ApiRequestOptions = {}) {
    const { query, ...requestInit } = init
    const response = await fetch(this.resolveUrl(path, query), {
      ...requestInit,
      headers: this.buildHeaders(requestInit.headers, requestInit.body),
    })

    if (response.status === 204) {
      return undefined as T
    }

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`)
    }

    return response.json() as Promise<T>
  }

  private resolveUrl(path: string, query?: Record<string, ApiQueryValue>) {
    const normalizedPath = path.startsWith("/") ? path : `/${path}`
    const url = `${this.baseUrl}${normalizedPath}`
    const search = this.buildQueryString(query)

    return search ? `${url}?${search}` : url
  }

  private buildQueryString(query: Record<string, ApiQueryValue> = {}) {
    const search = new URLSearchParams()

    for (const [key, value] of Object.entries(query)) {
      if (value !== null && value !== undefined && value !== "") {
        search.set(key, String(value))
      }
    }

    return search.toString()
  }

  private buildHeaders(headers: HeadersInit = {}, body?: BodyInit | null) {
    const resolved = new Headers(headers)
    const token = this.getToken?.()

    if (body && !(body instanceof FormData) && !resolved.has("Content-Type")) {
      resolved.set("Content-Type", "application/json")
    }

    if (token) {
      resolved.set("Authorization", `Bearer ${token}`)
    }

    return resolved
  }
}
