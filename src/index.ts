export interface LaravelResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  config: RequestInit;
  request?: any;
  success: boolean;
}

interface NextFetchRequestConfig {
  revalidate?: number | false;
  tags?: string[];
  cache?: "force-cache" | "no-store";
}

class Laravel {
  private readonly baseUrl: string;
  private cookies: string | null;
  private csrfToken: string | null;
  private bearerToken: string | null;

  private tokenResolver?: () => Promise<string | null> | string | null;

  constructor(url: string | undefined) {
    if (!url) {
      throw new Error("URL is required for using this API");
    }
    this.baseUrl = url;
    this.cookies = null;
    this.csrfToken = null;
    this.bearerToken = null;
  }

  setTokenResolver(resolver: () => Promise<string | null> | string | null) {
    this.tokenResolver = resolver;
    return this;
  }

  private extractCsrfToken(cookiesString: string): string | null {
    const match = cookiesString
      .split("; ")
      .find((row) => row.startsWith("XSRF-TOKEN="));
    return match ? decodeURIComponent(match.split("=")[1]) : null;
  }

  // Helper method to convert Headers to Record<string, string>
  private headersToRecord(headers: Headers): Record<string, string> {
    const record: Record<string, string> = {};
    headers.forEach((value, key) => {
      record[key] = value;
    });
    return record;
  }

  // Helper method to convert Response to LaravelResponse
  private async createLaravelResponse<T>(
    response: Response,
    config: RequestInit
  ): Promise<LaravelResponse<T>> {
    let data: T;

    try {
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        data = (await response.text()) as unknown as T;
      }
    } catch (error) {
      data = null as unknown as T;
    }

    return {
      data,
      status: response.status,
      statusText: response.statusText,
      headers: this.headersToRecord(response.headers),
      config,
      request: response,
      success: response.status >= 200 && response.status < 300,
    };
  }

  async request<T = any>(
    path: RequestInfo,
    init: RequestInit = {}
  ): Promise<LaravelResponse<T>> {
    const headers = new Headers(init.headers || {});

    headers.set("Accept", "application/json");
    headers.set("Origin", process.env.NEXT_PUBLIC_DOMAIN || "");

    if (typeof window !== "undefined" && this.cookies == null) {
      this.cookies = document.cookie;
    }

    if (this.cookies) {
      headers.set("cookie", this.cookies);

      // Pass the CSRF token as a header
      const csrfToken = this.extractCsrfToken(this.cookies);
      if (csrfToken) {
        headers.set("X-XSRF-TOKEN", csrfToken);
      }
    }

    if (this.csrfToken) {
      headers.set("X-XSRF-TOKEN", this.csrfToken);
    }

    if (this.tokenResolver && !this.bearerToken) {
      try {
        const resolvedToken = await this.tokenResolver();
        if (resolvedToken) {
          headers.set("Authorization", `Bearer ${resolvedToken}`);
        }
      } catch (error) {
        console.error("Error resolving token:", error);
      }
    } else if (this.bearerToken) {
      headers.set("Authorization", `Bearer ${this.bearerToken}`);
    }

    const config = {
      ...init,
      credentials: "include" as RequestCredentials,
      headers,
    };

    const response = await fetch(path, config);

    // Reset cookies for next request
    this.cookies = null;

    return this.createLaravelResponse<T>(response, config);
  }

  async get<T = any>(
    endpoint: string,
    options?: {
      params?: Record<string, unknown>;
      next?: NextFetchRequestConfig;
    }
  ): Promise<LaravelResponse<T>> {
    const url = new URL(endpoint, this.baseUrl);
    if (options?.params) {
      Object.keys(options.params).forEach((key) =>
        url.searchParams.append(key, String(options.params![key]))
      );
    }

    const requestOptions: RequestInit = {
      method: "GET",
    };

    // Add Next.js fetch options if provided
    if (options?.next) {
      // @ts-ignore - Next.js specific property
      requestOptions.next = options.next;
    }

    return await this.request<T>(url.toString(), requestOptions);
  }

  async post<T = any, D = any>(
    endpoint: string,
    body?: D,
    nextOptions?: NextFetchRequestConfig
  ): Promise<LaravelResponse<T>> {
    return this.sendRequest<T, D>(endpoint, "POST", body, nextOptions);
  }

  async put<T = any, D = any>(
    endpoint: string,
    body?: D,
    nextOptions?: NextFetchRequestConfig
  ): Promise<LaravelResponse<T>> {
    return this.sendRequest<T, D>(endpoint, "PUT", body, nextOptions);
  }

  async patch<T = any, D = any>(
    endpoint: string,
    body?: D,
    nextOptions?: NextFetchRequestConfig
  ): Promise<LaravelResponse<T>> {
    return this.sendRequest<T, D>(endpoint, "PATCH", body, nextOptions);
  }

  async delete<T = any, D = any>(
    endpoint: string,
    body?: D,
    nextOptions?: NextFetchRequestConfig
  ): Promise<LaravelResponse<T>> {
    return this.sendRequest<T, D>(endpoint, "DELETE", body, nextOptions);
  }

  private async sendRequest<T = any, D = any>(
    endpoint: string,
    method: string,
    body?: D,
    nextOptions?: NextFetchRequestConfig
  ): Promise<LaravelResponse<T>> {
    const url = new URL(endpoint, this.baseUrl);
    const headers: Record<string, string> = {};
    let processedBody: BodyInit | null = null;

    if (body !== undefined && body !== null) {
      // Handle different body types
      if (body instanceof FormData) {
        // FormData is already ready to use
        processedBody = body;
      } else if (typeof body === "string") {
        // If it's a string, use it directly
        processedBody = body;
        headers["Content-Type"] = "text/plain";
      } else if (body instanceof Blob || body instanceof ArrayBuffer) {
        // Handle Blob or ArrayBuffer
        processedBody = body;
      } else if (typeof body === "object") {
        // Convert objects to JSON
        processedBody = JSON.stringify(body);
        headers["Content-Type"] = "application/json";
      }
    }

    const requestOptions: RequestInit = {
      method,
      headers,
      body: processedBody,
    };

    // Add Next.js fetch options if provided
    if (nextOptions) {
      // @ts-ignore - Next.js specific property
      requestOptions.next = nextOptions;
    }

    const response = await this.request<T>(url.toString(), requestOptions);

    const setCookieHeaders = response.request?.headers?.getSetCookie?.();
    if (setCookieHeaders && setCookieHeaders.length > 0) {
      this.cookies = setCookieHeaders.join("; ");
    }

    return response;
  }

  withCookies(cookies?: string | null) {
    if (cookies) {
      this.cookies = cookies;
    } else {
      this.cookies = null;
    }
    return this;
  }

  withCSRFToken(token: string) {
    this.csrfToken = token;
    return this;
  }

  async csrf<T = any>(): Promise<LaravelResponse<T>> {
    return await this.get<T>("/sanctum/csrf-cookie");
  }

  withToken(token?: string | null) {
    this.bearerToken = token || null;
    return this;
  }

  getUri(path: unknown = "") {
    return new URL(String(path), this.baseUrl).toString();
  }

  login<T = any>(email: string, password: string): Promise<LaravelResponse<T>> {
    return this.post<T>("/api/login", {
      email: email,
      password: password,
    });
  }

  register<T = any>(data: any): Promise<LaravelResponse<T>> {
    return this.post<T>("/api/register", data);
  }

  sendVerificationNotification<T = any>(
    email: string
  ): Promise<LaravelResponse<T>> {
    return this.post<T>("/api/email/verification-notification", {
      email,
    });
  }

  verifyEmail<T = any>(
    userId: string,
    hash: string,
    query: {
      expires: string;
      signature: string;
    }
  ): Promise<LaravelResponse<T>> {
    return this.get<T>(`/api/verify-email/${userId}/${hash}`, {
      params: query,
    });
  }

  forgotPassword<T = any>(email: string): Promise<LaravelResponse<T>> {
    return this.post<T>("/api/forgot-password", {
      email,
    });
  }

  resetPassword<T = any>(data: {
    token: string;
    email: string;
    password: string;
    password_confirmation: string;
  }): Promise<LaravelResponse<T>> {
    return this.post<T>("/api/reset-password", data);
  }

  updatePassword<T = any>(data: {
    password: string;
    new_password: string;
    new_password_confirmation: string;
  }): Promise<LaravelResponse<T>> {
    return this.put<T>("/api/user/update-password", data);
  }

  updateAccount<T = any>(
    data: Record<string, unknown>
  ): Promise<LaravelResponse<T>> {
    return this.put<T>("/api/user", data);
  }
}

export default Laravel;
