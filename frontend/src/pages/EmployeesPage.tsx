import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  RotateCcw,
  Plus,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Edit2,
  TrendingUp,
  History,
  AlertCircle,
} from 'lucide-react';
import type { Employee, EmployeeFilters, FilterOptions } from '../types';

import { api } from '../services/api';
import { EmployeeModal } from '../components/EmployeeModal';
import { SalaryUpdateModal } from '../components/SalaryUpdateModal';
import { SalaryHistoryModal } from '../components/SalaryHistoryModal';

export const EmployeesPage: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter & Pagination State
  const [filters, setFilters] = useState<EmployeeFilters>({
    search: '',
    department: '',
    country: '',
    job_title: '',
    min_salary: '',
    max_salary: '',
    sort_by: 'id',
    sort_order: 'asc',
    page: 1,
    page_size: 25,
  });

  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    departments: [],
    countries: [],
    job_titles: [],
  });

  // Modal States
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [employeeToEdit, setEmployeeToEdit] = useState<Employee | null>(null);

  const [isSalaryModalOpen, setIsSalaryModalOpen] = useState(false);
  const [employeeForSalary, setEmployeeForSalary] = useState<Employee | null>(null);

  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [employeeForHistory, setEmployeeForHistory] = useState<Employee | null>(null);

  // Load filter dropdown options once
  useEffect(() => {
    api.getFilterOptions()
      .then(setFilterOptions)
      .catch((err) => console.error('Failed to load filter options:', err));
  }, []);

  // Fetch employees
  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getEmployees(filters);
      setEmployees(data.items);
      setTotalItems(data.total_items);
      setTotalPages(data.total_pages);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleFilterChange = (field: keyof EmployeeFilters, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
      page: 1, // Reset to page 1 on filter change
    }));
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      department: '',
      country: '',
      job_title: '',
      min_salary: '',
      max_salary: '',
      sort_by: 'id',
      sort_order: 'asc',
      page: 1,
      page_size: 25,
    });
  };

  const handleSort = (field: string) => {
    setFilters((prev) => ({
      ...prev,
      sort_by: field,
      sort_order: prev.sort_by === field && prev.sort_order === 'asc' ? 'desc' : 'asc',
      page: 1,
    }));
  };

  const renderSortIcon = (field: string) => {
    if (filters.sort_by !== field) {
      return <ArrowUpDown size={13} style={{ opacity: 0.4 }} />;
    }
    return filters.sort_order === 'asc' ? <ArrowUp size={13} color="var(--primary)" /> : <ArrowDown size={13} color="var(--primary)" />;
  };

  return (
    <div>
      {/* Top Header & Actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22 }}>Employee Directory</h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            Showing {totalItems.toLocaleString()} registered employees across ACME global offices
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            setEmployeeToEdit(null);
            setIsEmployeeModalOpen(true);
          }}
        >
          <Plus size={16} />
          <span>Add Employee</span>
        </button>
      </div>

      {/* Filter Toolbar Card */}
      <div className="card" style={{ marginBottom: 20, padding: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
          {/* Search box */}
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              className="input"
              placeholder="Search code, name, email..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              style={{ paddingLeft: 32 }}
            />
            <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: 10, top: 10 }} />
          </div>

          {/* Department */}
          <div>
            <select
              className="select"
              value={filters.department}
              onChange={(e) => handleFilterChange('department', e.target.value)}
            >
              <option value="">All Departments</option>
              {filterOptions.departments.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Country */}
          <div>
            <select
              className="select"
              value={filters.country}
              onChange={(e) => handleFilterChange('country', e.target.value)}
            >
              <option value="">All Countries</option>
              {filterOptions.countries.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Job Title */}
          <div>
            <select
              className="select"
              value={filters.job_title}
              onChange={(e) => handleFilterChange('job_title', e.target.value)}
            >
              <option value="">All Job Titles</option>
              {filterOptions.job_titles.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Min Salary */}
          <div>
            <input
              type="number"
              className="input"
              placeholder="Min Salary (USD)"
              value={filters.min_salary}
              onChange={(e) => handleFilterChange('min_salary', e.target.value)}
            />
          </div>

          {/* Max Salary */}
          <div>
            <input
              type="number"
              className="input"
              placeholder="Max Salary (USD)"
              value={filters.max_salary}
              onChange={(e) => handleFilterChange('max_salary', e.target.value)}
            />
          </div>

          {/* Reset button */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleResetFilters}
              style={{ width: '100%' }}
            >
              <RotateCcw size={14} />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Employees Table */}
      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th className="sortable" onClick={() => handleSort('employee_code')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>Code</span>
                  {renderSortIcon('employee_code')}
                </div>
              </th>
              <th className="sortable" onClick={() => handleSort('full_name')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>Full Name</span>
                  {renderSortIcon('full_name')}
                </div>
              </th>
              <th className="sortable" onClick={() => handleSort('email')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>Email</span>
                  {renderSortIcon('email')}
                </div>
              </th>
              <th className="sortable" onClick={() => handleSort('department')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>Department</span>
                  {renderSortIcon('department')}
                </div>
              </th>
              <th>Job Title</th>
              <th>Country</th>
              <th className="sortable" onClick={() => handleSort('current_salary')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>Current Salary</span>
                  {renderSortIcon('current_salary')}
                </div>
              </th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: 48, color: 'var(--text-secondary)' }}>
                  Loading employee records...
                </td>
              </tr>
            ) : employees.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: 48, color: 'var(--text-secondary)' }}>
                  No employees found matching the specified filters.
                </td>
              </tr>
            ) : (
              employees.map((emp) => (
                <tr key={emp.id}>
                  <td style={{ fontWeight: 600, color: 'var(--primary)' }}>{emp.employee_code}</td>
                  <td style={{ fontWeight: 500 }}>{emp.full_name}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{emp.email}</td>
                  <td>
                    <span className="badge">{emp.department}</span>
                  </td>
                  <td>{emp.job_title}</td>
                  <td>{emp.country}</td>
                  <td style={{ fontWeight: 600 }}>
                    ${Number(emp.current_salary).toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: 6 }}>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        title="Edit non-salary details"
                        onClick={() => {
                          setEmployeeToEdit(emp);
                          setIsEmployeeModalOpen(true);
                        }}
                      >
                        <Edit2 size={13} />
                        <span>Edit</span>
                      </button>

                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        title="Update employee salary"
                        onClick={() => {
                          setEmployeeForSalary(emp);
                          setIsSalaryModalOpen(true);
                        }}
                      >
                        <TrendingUp size={13} />
                        <span>Salary</span>
                      </button>

                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        title="View salary audit history"
                        onClick={() => {
                          setEmployeeForHistory(emp);
                          setIsHistoryModalOpen(true);
                        }}
                      >
                        <History size={13} />
                        <span>History</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 16,
        padding: '8px 4px',
      }}>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          Showing page <strong>{filters.page}</strong> of <strong>{totalPages || 1}</strong> ({totalItems.toLocaleString()} total records)
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            disabled={filters.page <= 1 || loading}
            onClick={() => handleFilterChange('page', filters.page - 1)}
          >
            Previous
          </button>

          <span style={{ fontSize: 13, padding: '0 8px' }}>
            Page {filters.page}
          </span>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            disabled={filters.page >= totalPages || loading}
            onClick={() => handleFilterChange('page', filters.page + 1)}
          >
            Next
          </button>
        </div>
      </div>

      {/* Modals */}
      <EmployeeModal
        isOpen={isEmployeeModalOpen}
        onClose={() => setIsEmployeeModalOpen(false)}
        onSuccess={fetchEmployees}
        employeeToEdit={employeeToEdit}
        filterOptions={filterOptions}
      />

      <SalaryUpdateModal
        isOpen={isSalaryModalOpen}
        onClose={() => setIsSalaryModalOpen(false)}
        onSuccess={fetchEmployees}
        employee={employeeForSalary}
      />

      <SalaryHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        employee={employeeForHistory}
      />
    </div>
  );
};
