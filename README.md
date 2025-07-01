<p align="center"><img src="/blue-flamingos-logo.png" alt="Blue Flamingos"></p>

# Laravel Client

A lightweight TypeScript client for interacting with Laravel Sanctum-protected APIs in SPA mode. Designed to work smoothly with NextJS and other frontend frameworks.

[![npm version](https://img.shields.io/npm/v/laravelclient.svg)](https://www.npmjs.com/package/laravelclient)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## Features

- 🔒 Seamless integration with Laravel Sanctum SPA authentication
- 🔄 Support for all common HTTP methods (GET, POST, PUT, PATCH, DELETE)
- 📦 Works with JSON, FormData, or plain text request bodies
- 🍪 Cookie handling for server-side requests
- ⚡ NextJS cache tagging support for App Router
- 🔗 Full TypeScript support

## Installation

```bash
npm install laravelclient
```

or

```bash
yarn add laravelclient
```

## Basic Usage

```typescript
import Laravel from 'laravelclient';

// Initialize with your Laravel backend URL
const api = new Laravel(process.env.NEXT_PUBLIC_LARAVEL_URL);

// Make API requests
const users = await api.get('/api/users');
const user = await api.post('/api/users', { name: 'John Doe', email: 'john@example.com' });
```

## API Reference

### Constructor

```typescript
const api = new Laravel(url: string);
```

### HTTP Methods

#### GET Requests

```typescript
// Simple GET request
const response = await api.get('/api/endpoint');

// GET with query parameters
const response = await api.get('/api/endpoint', {
  params: { search: 'keyword', page: 1 }
});

// With NextJS cache options
const response = await api.get('/api/endpoint', {
  params: { search: 'keyword' },
  next: {
    tags: ['users'],
    revalidate: 60
  }
});
```

#### POST/PUT/PATCH/DELETE Requests

```typescript
// JSON body
const response = await api.post('/api/endpoint', { name: 'John', email: 'john@example.com' });

// FormData
const formData = new FormData();
formData.append('file', fileInput.files[0]);
const response = await api.post('/api/upload', formData);

// With NextJS cache options
const response = await api.post('/api/endpoint', data, {
  tags: ['users'],
  cache: 'no-store'
});
```

### Authentication Helpers

```typescript
import {cookies} from "next/headers";

// Get CSRF cookie
await api.csrf();

// Use with server-side cookies
const userData = await api.withCookies(cookies().toString()).get('/api/user');
```

### URL Helper

```typescript
// Get full URL for a path
const url = api.getUri('/api/endpoint');
```

## NextJS Integration

This client has special support for NextJS App Router's data fetching and caching mechanisms:

### Client-side Component

```typescript
'use client';

import { useState, useEffect } from 'react';
import Laravel from 'laravelclient';

const api = new Laravel(process.env.NEXT_PUBLIC_LARAVEL_URL);

export default function UserProfile() {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    const fetchUser = async () => {
      const data = await api.get('/api/user');
      setUser(data);
    };
    fetchUser();
  }, []);
  
  // ...
}
```

### Server Component with Cache Tags

```typescript
import Laravel from 'laravelclient';
import {cookies} from "next/headers";

const api = new Laravel(process.env.LARAVEL_API_URL);

export default async function UsersPage() {
  const users = await api.withCookies(cookies().toString()).get('/api/users', {
    next: {
      tags: ['users'],
      revalidate: 60
    }
  });
  
  return (
    <div>
      {users.map(user => (
        <div key={user.id}>{user.name}</div>
      ))}
    </div>
  );
}
```

### Revalidate Data on Demand

```typescript
import { revalidateTag } from 'next/cache';

// In a Server Action or Route Handler
export async function revalidateUsers() {
  revalidateTag('users');
  return { revalidated: true };
}
```

## Full Type Support

The client includes TypeScript types for all features:

```typescript
interface NextFetchRequestConfig {
  revalidate?: number | false;
  tags?: string[];
  cache?: 'force-cache' | 'no-store';
}

// You can create your own response types
interface User {
  id: number;
  name: string;
  email: string;
}

const user = await api.get<User>('/api/user');
```

## Local Development

To develop locally with your projects:

1. Clone the repository
2. Install dependencies: `npm install`
3. Link for local development: `npm run yalc:publish`
4. In your project: `yalc add laravelclient`
5. Watch for changes: `npm run dev`

## License

MIT Licensed. Copyright (c) Blue Flamingos.
