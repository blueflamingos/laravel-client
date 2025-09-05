<p align="center"><img src="/blue-flamingos-logo.png" alt="Blue Flamingos"></p>

# Laravel Client

A lightweight TypeScript client for interacting with Laravel Sanctum-protected APIs in SPA mode. Designed to work smoothly with NextJS and other frontend frameworks.

[![npm version](https://img.shields.io/npm/v/@blueflamingos/laravel-client.svg)](https://www.npmjs.com/package/@blueflamingos/laravel-client)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## Features

- 🔒 Seamless integration with Laravel Sanctum SPA authentication
- 🔄 Support for all common HTTP methods (GET, POST, PUT, PATCH, DELETE)
- 📦 Works with JSON, FormData, or plain text request bodies
- 🍪 Automatic CSRF token handling and cookie management
- 🔑 Flexible authentication with Bearer tokens and token resolvers
- ⚡ NextJS cache tagging support for App Router
- 🔗 Full TypeScript support with custom response types
- 🛠️ Built-in Laravel authentication helpers

## Installation

```bash
npm install @blueflamingos/laravel-client
```

or

```bash
yarn add @blueflamingos/laravel-client
```

## Basic Usage

```typescript
import Laravel from '@blueflamingos/laravel-client';

const laravel = new Laravel(process.env.NEXT_PUBLIC_LARAVEL_URL);

// Make API requests
const users = await laravel.get('/api/users');
const user = await laravel.post('/api/users', { name: 'John Doe', email: 'john@example.com' });
```

## API Reference

### Constructor

```typescript
const api = new Laravel(url: string);
```

Creates a new Laravel client instance. The URL parameter is required and should point to your Laravel application's base URL.

### Authentication Configuration

#### Bearer Token Authentication

```typescript
// Set a static bearer token
laravel.withToken('your-bearer-token');

// Set a token resolver for dynamic tokens
laravel.setTokenResolver(async () => {
  const session = await getSession();
  return session?.accessToken || null;
});

// Clear the token
laravel.withToken(null);
```

#### CSRF Token Handling

```typescript
// Get CSRF cookie from Laravel Sanctum
await laravel.csrf();

// Manually set CSRF token
laravel.withCSRFToken('csrf-token-value');
```

#### Cookie Management

```typescript
// Set cookies manually (useful for SSR)
laravel.withCookies('session_cookie=value; other_cookie=value2');

// Clear cookies
laravel.withCookies(null);
```

### HTTP Methods

#### GET Requests

```typescript
// Simple GET request
const response = await laravel.get('/api/users');
console.log(response.data); // Array of users
console.log(response.success); // true if 2xx status

// GET with query parameters (object)
const response = await laravel.get('/api/users', {
  params: { search: 'keyword', page: 1, per_page: 10 }
});

// GET with raw query string
const response = await laravel.get('/api/users', {
  params: 'search=keyword&page=1&per_page=10'
});

// With NextJS cache options
const response = await laravel.get('/api/users', {
  params: { active: true },
  next: {
    tags: ['users'],
    revalidate: 60,
    cache: 'force-cache'
  }
});
```

#### POST/PUT/PATCH/DELETE Requests

```typescript
// JSON body
const response = await laravel.post('/api/users', { 
  name: 'John', 
  email: 'john@example.com' 
});

// FormData (automatically detected)
const formData = new FormData();
formData.append('name', 'John');
formData.append('avatar', fileInput.files[0]);
const response = await laravel.post('/api/users', formData);

// Plain text body
const response = await laravel.post('/api/webhook', 'raw text data');

// Blob or ArrayBuffer
const response = await laravel.post('/api/upload', blob);

// With NextJS cache options
const response = await laravel.post('/api/users', data, {
  tags: ['users'],
  cache: 'no-store'
});

// Other HTTP methods work the same way
await laravel.put('/api/users/1', userData);
await laravel.patch('/api/users/1', { name: 'Jane' });
await laravel.delete('/api/users/1');
```

### Response Format

All methods return a `LaravelResponse<T>` object:

```typescript
interface LaravelResponse<T = any> {
  data: T;                    // Response data
  status: number;             // HTTP status code
  statusText: string;         // HTTP status text
  headers: Record<string, string>; // Response headers
  config: RequestInit;        // Request configuration
  request?: any;              // Original Response object
  success: boolean;           // true for 2xx status codes
}
```

### Built-in Authentication Helpers

The client includes convenient methods for common Laravel authentication flows:

```typescript
// Login
const response = await laravel.login('user@example.com', 'password');
if (response.success) {
  console.log('Login successful', response.data);
}

// Register
const response = await laravel.register({
  name: 'John Doe',
  email: 'john@example.com',
  password: 'secret',
  password_confirmation: 'secret'
});

// Send email verification notification
await laravel.sendVerificationNotification('user@example.com');

// Verify email
await laravel.verifyEmail(userId, hash, {
  expires: '1234567890',
  signature: 'signature-hash'
});

// Forgot password
await laravel.forgotPassword('user@example.com');

// Reset password
await laravel.resetPassword({
  token: 'reset-token',
  email: 'user@example.com',
  password: 'newpassword',
  password_confirmation: 'newpassword'
});

// Update password (authenticated)
await laravel.withToken(token).updatePassword({
  password: 'currentpassword',
  new_password: 'newpassword',
  new_password_confirmation: 'newpassword'
});

// Update account (authenticated)
await laravel.withToken(token).updateAccount({
  name: 'New Name',
  email: 'newemail@example.com'
});
```

### Utility Methods

```typescript
// Get full URL for a path
const url = laravel.getUri('/api/users'); // "https://api.example.com/api/users"
const url = laravel.getUri(); // "https://api.example.com/"
```

## NextJS Integration

This client has special support for NextJS App Router's data fetching and caching mechanisms:

### Client-side Component

```typescript
'use client';

import { useState, useEffect } from 'react';
import Laravel from '@blueflamingos/laravel-client';

const api = new Laravel(process.env.NEXT_PUBLIC_LARAVEL_URL!);

export default function UserProfile() {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    const fetchUser = async () => {
      // Set up authentication
      api.setTokenResolver(async () => {
        const session = await getSession();
        return session?.accessToken || null;
      });
      
      const response = await api.get('/api/user');
      if (response.success) {
        setUser(response.data);
      }
    };
    
    fetchUser();
  }, []);
  
  if (!user) return <div>Loading...</div>;
  
  return <div>Welcome, {user.name}!</div>;
}
```

### Server Component with SSR

```typescript
import Laravel from '@blueflamingos/laravel-client';
import { cookies } from 'next/headers';

const api = new Laravel(process.env.LARAVEL_API_URL!);

export default async function UsersPage() {
  const response = await api
    .withCookies(cookies().toString())
    .get('/api/users', {
      next: {
        tags: ['users'],
        revalidate: 60
      }
    });
  
  if (!response.success) {
    return <div>Error loading users</div>;
  }
  
  return (
    <div>
      {response.data.map(user => (
        <div key={user.id}>{user.name}</div>
      ))}
    </div>
  );
}
```

### Server Actions with Revalidation

```typescript
'use server';

import { revalidateTag } from 'next/cache';
import Laravel from '@blueflamingos/laravel-client';

const api = new Laravel(process.env.LARAVEL_API_URL!);

export async function createUser(formData: FormData) {
  const response = await api.post('/api/users', {
    name: formData.get('name'),
    email: formData.get('email')
  });
  
  if (response.success) {
    revalidateTag('users');
  }
  
  return response;
}
```

## TypeScript Support

The client includes full TypeScript support with generics:

```typescript
// Define your data types
interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

interface ApiResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    total: number;
  };
}

// Use with typed responses
const response = await api.get<ApiResponse<User>>('/api/users');
console.log(response.data.data); // User[]
console.log(response.data.meta.total); // number

// Authentication responses
interface LoginResponse {
  user: User;
  token: string;
}

const loginResponse = await api.login<LoginResponse>('email', 'password');
if (loginResponse.success) {
  console.log(loginResponse.data.user.name);
  console.log(loginResponse.data.token);
}
```

## Error Handling

```typescript
const response = await laravel.get('/api/users');

if (!response.success) {
  console.error('Request failed:', response.status, response.statusText);
  console.error('Error data:', response.data);
} else {
  console.log('Users:', response.data);
}

// Or handle specific status codes
switch (response.status) {
  case 401:
    // Unauthorized - redirect to login
    break;
  case 403:
    // Forbidden - show access denied
    break;
  case 422:
    // Validation errors
    console.log('Validation errors:', response.data.errors);
    break;
  default:
    // Handle other errors
}
```

## Common Patterns

### Authentication Flow

```typescript
// 1. Get CSRF token (for SPA mode)
await laravel.csrf();

// 2. Login
const loginResponse = await laravel.login(email, password);

if (loginResponse.success) {
  // 3. Set token for subsequent requests
  laravel.withToken(loginResponse.data.token);
  
  // 4. Make authenticated requests
  const userResponse = await laravel.get('/api/user');
}
```

### File Upload with Progress

```typescript
const formData = new FormData();
formData.append('file', file);
formData.append('title', 'My Upload');

const response = await laravel.post('/api/uploads', formData);

if (response.success) {
  console.log('Upload successful:', response.data);
}
```

### Validation Error Handling

```typescript
const response = await laravel.post('/api/users', userData);

if (response.status === 422) {
  // Laravel validation errors
  const errors = response.data.errors;
  Object.keys(errors).forEach(field => {
    console.log(`${field}: ${errors[field].join(', ')}`);
  });
}
```

## License

MIT Licensed. Copyright (c) Blue Flamingos.
