const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiClient {
  constructor() {
    this.base = API_BASE;
  }

  getToken() {
    return localStorage.getItem('fsi_token');
  }

  setToken(token) {
    localStorage.setItem('fsi_token', token);
  }

  clearToken() {
    localStorage.removeItem('fsi_token');
  }

  async request(path, options = {}) {
    const token = this.getToken();
    const headers = { ...options.headers };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(`${this.base}${path}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      this.clearToken();
      window.location.href = '/login';
      throw new Error('Session expired');
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Request failed');
    }

    return data;
  }

  // Auth
  async register(email, password, name) {
    const data = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
    this.setToken(data.token);
    return data;
  }

  async login(email, password) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(data.token);
    return data;
  }

  async getMe() {
    return this.request('/auth/me');
  }

  async deleteAccount() {
    const data = await this.request('/auth/account', { method: 'DELETE' });
    this.clearToken();
    return data;
  }

  // Statements
  async uploadStatement(file) {
    const formData = new FormData();
    formData.append('file', file);
    return this.request('/statements/upload', {
      method: 'POST',
      body: formData,
    });
  }

  async getStatements() {
    return this.request('/statements');
  }

  async deleteStatement(id) {
    return this.request(`/statements/${id}`, { method: 'DELETE' });
  }

  // Analytics
  async getOverview() {
    return this.request('/analytics/overview');
  }

  async getMonthly() {
    return this.request('/analytics/monthly');
  }

  async getCategories(month) {
    const params = month ? `?month=${month}` : '';
    return this.request(`/analytics/categories${params}`);
  }

  async getMerchants(limit = 10) {
    return this.request(`/analytics/merchants?limit=${limit}`);
  }

  async getTransactions(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return this.request(`/analytics/transactions?${qs}`);
  }

  async getInsights() {
    return this.request('/analytics/insights');
  }

  async getRecurring() {
    return this.request('/analytics/recurring');
  }

  async getDaily(month) {
    const params = month ? `?month=${month}` : '';
    return this.request(`/analytics/daily${params}`);
  }
}

export const api = new ApiClient();
export default api;
