class Laravel {
    private readonly baseUrl: string;
    private cookies: string | null;

    constructor(url: string | undefined) {
        if (!url) {
            throw new Error('URL is required for using this API');
        }

        this.baseUrl = url;
        this.cookies = null;
    }

    async request(path: RequestInfo, init: RequestInit = {}) {
        const headers = new Headers(init.headers || {});

        headers.set('Accept', 'application/json');
        headers.set('Origin', process.env.NEXT_PUBLIC_DOMAIN || '');

        if (this.cookies) {
            headers.set('cookie', this.cookies);
        }

        return fetch(path, {
            ...init,
            credentials: 'include',
            headers
        });
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

        const response = await this.request(url.toString(), requestOptions);
        return await response.json();
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
        return await response.json();
    }

    withCookies(cookies?: string | null) {
        if (cookies) {
            this.cookies = cookies;
        } else {
            this.cookies = null;
        }

        return this;
    }

    async csrf() {
        return await this.get('/sanctum/csrf-cookie');
    }

    getUri(path: unknown = '') {
        return (new URL(String(path), this.baseUrl)).toString();
    }
}

// Type definition for Next.js fetch request config
interface NextFetchRequestConfig {
    revalidate?: number | false;
    tags?: string[];
    cache?: 'force-cache' | 'no-store';
}

export default Laravel;
