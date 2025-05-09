class Laravel {
    private readonly baseUrl: string;
    private cookies: string | null;
    private csrfToken: string | null;
    private bearerToken: string | null;

    private tokenResolver?: () => Promise<string | null> | string | null;

    constructor(url: string | undefined) {
        if (!url) {
            throw new Error('URL is required for using this API');
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
        const match = cookiesString.split('; ').find((row) => row.startsWith('XSRF-TOKEN='));
        return match ? decodeURIComponent(match.split('=')[1]) : null;
    }

    async request(path: RequestInfo, init: RequestInit = {}) {
        const headers = new Headers(init.headers || {});

        headers.set('Accept', 'application/json');
        headers.set('Origin', process.env.NEXT_PUBLIC_DOMAIN || '');

        if (typeof window !== 'undefined' && this.cookies == null) {
            this.cookies = document.cookie

        }
        if (this.cookies) {
            headers.set('cookie', this.cookies);

            // Pass the CSRF token as a header
            const csrfToken = this.extractCsrfToken(this.cookies);
            if (csrfToken) {
                headers.set('X-XSRF-TOKEN', csrfToken);
            }
        }

        if (this.csrfToken) {
            headers.set('X-XSRF-TOKEN', this.csrfToken);
        }

        if (this.tokenResolver && !this.bearerToken) {
            try {
                const resolvedToken = await this.tokenResolver();
                if (resolvedToken) {
                    headers.set('Authorization', `Bearer ${resolvedToken}`);
                }
            } catch (error) {
                console.error('Error resolving token:', error);
            }
        } else if (this.bearerToken) {
            headers.set('Authorization', `Bearer ${this.bearerToken}`);
        }


        const response = fetch(path, {
            ...init,
            credentials: 'include',
            headers
        });

        // Reset cookies for next request
        this.cookies = null;

        return response;
    }

    async get(endpoint: string, options?: {
        params?: Record<string, unknown>,
        next?: NextFetchRequestConfig
    }) {
        const url = new URL(endpoint, this.baseUrl);
        if (options?.params) {
            Object.keys(options.params).forEach(key =>
                url.searchParams.append(key, String(options.params![key]))
            );
        }

        const requestOptions: RequestInit = {
            method: 'GET',
        };


        // Add Next.js fetch options if provided
        if (options?.next) {
            // @ts-ignore - Next.js specific property
            requestOptions.next = options.next;
        }

        return await this.request(url.toString(), requestOptions);
    }

    async post(endpoint: string, body?: BodyInit | Record<string, unknown> | null, nextOptions?: NextFetchRequestConfig) {
        return this.sendRequest(endpoint, 'POST', body, nextOptions);
    }

    async put(endpoint: string, body?: BodyInit | Record<string, unknown> | null, nextOptions?: NextFetchRequestConfig) {
        return this.sendRequest(endpoint, 'PUT', body, nextOptions);
    }

    async patch(endpoint: string, body?: BodyInit | Record<string, unknown> | null, nextOptions?: NextFetchRequestConfig) {
        return this.sendRequest(endpoint, 'PATCH', body, nextOptions);
    }

    async delete(endpoint: string, body?: BodyInit | Record<string, unknown> | null, nextOptions?: NextFetchRequestConfig) {
        return this.sendRequest(endpoint, 'DELETE', body, nextOptions);
    }

    private async sendRequest(
        endpoint: string,
        method: string,
        body?: BodyInit | Record<string, unknown> | null,
        nextOptions?: NextFetchRequestConfig
    ) {
        const url = new URL(endpoint, this.baseUrl);
        const headers: Record<string, string> = {};
        let processedBody: BodyInit | null = null;

        if (body !== undefined && body !== null) {
            // Handle different body types
            if (body instanceof FormData) {
                // FormData is already ready to use
                processedBody = body;
            } else if (typeof body === 'string') {
                // If it's a string, use it directly
                processedBody = body;
                headers['Content-Type'] = 'text/plain';
            } else if (body instanceof Blob || body instanceof ArrayBuffer) {
                // Handle Blob or ArrayBuffer
                processedBody = body;
            } else if (typeof body === 'object') {
                // Convert objects to JSON
                processedBody = JSON.stringify(body);
                headers['Content-Type'] = 'application/json';
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

        const response = await this.request(url.toString(), requestOptions);

        const setCookieHeaders = response.headers.getSetCookie();

        if (setCookieHeaders && setCookieHeaders.length > 0) {
            this.cookies = setCookieHeaders.join('; ');
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

    async csrf() {
        return await this.get('/sanctum/csrf-cookie');
    }

    withToken(token?: string | null) {
        this.bearerToken = token || null;

        return this;
    }

    getUri(path: unknown = '') {
        return (new URL(String(path), this.baseUrl)).toString();
    }

    login(email: string, password: string) {
        return this.post('/api/login', {
            email: email,
            password: password,
        })
    }

    register(data: {
        name: string,
        email: string,
        password: string,
        password_confirmation: string,
    }) {
        return this.post('/api/register', data);
    }

    sendVerificationNotification(email: string) {
        return this.post('/api/email/verification-notification', {
            email
        })
    }

    verifyEmail(userId: string, hash: string, query: {
        expires: string,
        signature: string
    }) {
        return this.get(`/api/verify-email/${userId}/${hash}`, {
            params: query
        });
    }

    forgotPassword(email: string) {
        return this.post('/api/forgot-password', {
            email
        });
    }

    resetPassword(data: {
        token: string,
        email: string,
        password: string,
        password_confirmation: string,
    }) {
        return this.post('/api/reset-password', data);
    }

    updatePassword(data: {
        password: string,
        new_password: string,
        new_password_confirmation: string
                   }) {
        return this.put('/api/user/update-password', data);
    }

    updateAccount(data: Record<string, unknown>) {
        return this.put('/api/user', data);
    }
}

// Type definition for Next.js fetch request config
interface NextFetchRequestConfig {
    revalidate?: number | false;
    tags?: string[];
    cache?: 'force-cache' | 'no-store';
}

export default Laravel;
