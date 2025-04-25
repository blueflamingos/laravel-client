class Laravel {
    private readonly baseUrl: string;
    private cookies: string | null;

    constructor(url: string | undefined) {
        if (!url) {
            throw new Error('NEXT_PUBLIC_LARAVEL_URL is not set');
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

    async get(endpoint: string, params?: Record<string, unknown>) {
        const url = new URL(endpoint, this.baseUrl);
        if (params) {
            Object.keys(params).forEach(key =>
                url.searchParams.append(key, String(params[key]))
            );
        }

        const response = await this.request(url.toString(), {
            method: 'GET',
        });

        return await response.json();
    }

    async post(endpoint: string, body?: BodyInit | Record<string, unknown> | null) {
        return this.sendRequest(endpoint, 'POST', body);
    }

    async put(endpoint: string, body?: BodyInit | Record<string, unknown> | null) {
        return this.sendRequest(endpoint, 'PUT', body);
    }

    async patch(endpoint: string, body?: BodyInit | Record<string, unknown> | null) {
        return this.sendRequest(endpoint, 'PATCH', body);
    }

    async delete(endpoint: string, body?: BodyInit | Record<string, unknown> | null) {
        return this.sendRequest(endpoint, 'DELETE', body);
    }

    private async sendRequest(endpoint: string, method: string, body?: BodyInit | Record<string, unknown> | null) {
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

        const response = await this.request(url.toString(), {
            method,
            headers,
            body: processedBody,
        });

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
}

export default Laravel;
