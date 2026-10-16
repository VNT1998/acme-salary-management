import type {
  Employee,
  EmployeeFilters,
  EmployeeListResponse,
  FilterOptions,
  SalaryAnalytics,
  SalaryHistoryItem,
  User,
} from '../types';


let csrfToken: string | null = null;

export function setCsrfToken(token: string | null) {
  csrfToken = token;
}

export function getCsrfToken(): string | null {
  return csrfToken;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  const method = (options.method || 'GET').toUpperCase();
  if (['POST', 'PATCH', 'PUT', 'DELETE'].includes(method) && csrfToken) {
    headers['X-CSRF-Token'] = csrfToken;
  }

  const response = await fetch(`/api/v1${endpoint}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (response.status === 204) {
    return {} as T;
  }

  let data: any;
  try {
    data = await response.json();
  } catch {
    throw new Error('An unexpected server error occurred.');
  }

  if (!response.ok) {
    const errorMsg = data?.error?.message || 'Request failed';
    const err = new Error(errorMsg);
    (err as any).code = data?.error?.code;
    (err as any).details = data?.error?.details;
    (err as any).status = response.status;
    throw err;
  }

  return data as T;
}

export const api = {
  // Auth
  async login(email: string, password: string): Promise<{ user: User; csrf_token: string }> {
    const data = await request<{ user: User; csrf_token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setCsrfToken(data.csrf_token);
    return data;
  },

  async getMe(): Promise<{ user: User }> {
    return request<{ user: User }>('/auth/me');
  },

  async logout(): Promise<void> {
    await request<void>('/auth/logout', { method: 'POST' });
    setCsrfToken(null);
  },

  // Employees
  async getEmployees(params: Partial<EmployeeFilters>): Promise<EmployeeListResponse> {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.page_size) searchParams.set('page_size', params.page_size.toString());
    if (params.search) searchParams.set('search', params.search);
    if (params.department) searchParams.set('department', params.department);
    if (params.country) searchParams.set('country', params.country);
    if (params.job_title) searchParams.set('job_title', params.job_title);
    if (params.min_salary) searchParams.set('min_salary', params.min_salary);
    if (params.max_salary) searchParams.set('max_salary', params.max_salary);
    if (params.sort_by) searchParams.set('sort_by', params.sort_by);
    if (params.sort_order) searchParams.set('sort_order', params.sort_order);

    return request<EmployeeListResponse>(`/employees?${searchParams.toString()}`);
  },

  async getFilterOptions(): Promise<FilterOptions> {
    return request<FilterOptions>('/employees/meta/filter-options');
  },

  async getEmployee(id: number): Promise<Employee> {
    return request<Employee>(`/employees/${id}`);
  },

  async createEmployee(data: {
    full_name: string;
    email: string;
    department: string;
    job_title: string;
    country: string;
    initial_salary: string;
    effective_date?: string;
  }): Promise<Employee> {
    return request<Employee>('/employees', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateEmployee(
    id: number,
    data: {
      full_name?: string;
      email?: string;
      department?: string;
      job_title?: string;
      country?: string;
    }
  ): Promise<Employee> {
    return request<Employee>(`/employees/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  // Salaries
  async updateSalary(
    employeeId: number,
    newSalary: string,
    effectiveDate: string
  ): Promise<{
    employee_id: number;
    previous_salary: string;
    current_salary: string;
    effective_date: string;
    recorded_at: string;
  }> {
    return request(`/employees/${employeeId}/salary-updates`, {
      method: 'POST',
      body: JSON.stringify({
        new_salary: newSalary,
        effective_date: effectiveDate,
      }),
    });
  },

  async getSalaryHistory(employeeId: number): Promise<SalaryHistoryItem[]> {
    return request<SalaryHistoryItem[]>(`/employees/${employeeId}/salary-history`);
  },

  // Analytics
  async getSalaryAnalytics(filters: {
    department?: string;
    country?: string;
    job_title?: string;
    min_salary?: string;
    max_salary?: string;
  }): Promise<SalaryAnalytics> {
    const searchParams = new URLSearchParams();
    if (filters.department) searchParams.set('department', filters.department);
    if (filters.country) searchParams.set('country', filters.country);
    if (filters.job_title) searchParams.set('job_title', filters.job_title);
    if (filters.min_salary) searchParams.set('min_salary', filters.min_salary);
    if (filters.max_salary) searchParams.set('max_salary', filters.max_salary);

    return request<SalaryAnalytics>(`/analytics/salaries?${searchParams.toString()}`);
  },
};
