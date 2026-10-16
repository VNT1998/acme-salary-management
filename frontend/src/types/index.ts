export interface User {
  id: number;
  email: string;
}


export interface Employee {
  id: number;
  employee_code: string;
  full_name: string;
  email: string;
  department: string;
  job_title: string;
  country: string;
  current_salary: string;
  currency: string;
  created_at?: string;
  updated_at?: string;
}

export interface EmployeeListResponse {
  items: Employee[];
  page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
}

export interface SalaryHistoryItem {
  id: number;
  employee_id: number;
  previous_salary: string | null;
  new_salary: string;
  effective_date: string;
  recorded_at: string;
}

export interface DepartmentBreakdown {
  department: string;
  employee_count: number;
  average_salary: string;
  median_salary: string;
  minimum_salary: string;
  maximum_salary: string;
}

export interface SalaryAnalytics {
  currency: string;
  employee_count: number;
  average_salary: string | null;
  median_salary: string | null;
  minimum_salary: string | null;
  maximum_salary: string | null;
  department_breakdown: DepartmentBreakdown[];
}

export interface FilterOptions {
  departments: string[];
  countries: string[];
  job_titles: string[];
}

export interface EmployeeFilters {
  search: string;
  department: string;
  country: string;
  job_title: string;
  min_salary: string;
  max_salary: string;
  sort_by: string;
  sort_order: 'asc' | 'desc';
  page: number;
  page_size: number;
}
