const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('velocex_access_token') : null;

  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // If token expired, attempt refresh or logout
    if (typeof window !== 'undefined') {
      const refreshToken = localStorage.getItem('velocex_refresh_token');
      if (refreshToken) {
        try {
          const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh_token: refreshToken }),
          });
          if (refreshRes.ok) {
            const data = await refreshRes.json();
            localStorage.setItem('velocex_access_token', data.access_token);
            localStorage.setItem('velocex_refresh_token', data.refresh_token);
            // Retry original request
            headers.set('Authorization', `Bearer ${data.access_token}`);
            return fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });
          }
        } catch (e) {
          // Refresh failed
        }
      }
    }
  }

  return response;
}
