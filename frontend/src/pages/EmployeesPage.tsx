import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  RotateCcw,
  Plus,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Edit3,
  TrendingUp,
  History,
  AlertCircle,
  Download,
  Filter,
} from 'lucide-react';
import type { Employee, EmployeeFilters, FilterOptions } from '../types';
import { api } from '../services/api';
import { EmployeeModal } from '../components/EmployeeModal';
import { SalaryUpdateModal } from '../components/SalaryUpdateModal';
import { SalaryHistoryModal } from '../components/SalaryHistoryModal';

// Helper to get consistent avatar pastel color based on string
const getAvatarColor = (name: string) => {
  const colors = [
    { bg: '#e0e7ff', text: '#4338ca' }, // Indigo
    { bg: '#fce7f3', text: '#be185d' }, // Pink
    { bg: '#e0f2fe', text: '#0369a1' }, // Sky
    { bg: '#dcfce7', text: '#15803d' }, // Emerald
    { bg: '#fef3c7', text: '#b45309' }, // Amber
    { bg: '#f3e8ff', text: '#7e22ce' }, // Purple
    { bg: '#ccfbf1', text: '#0f766e' }, // Teal
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

const getInitials = (name: string) => {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

export const EmployeesPage: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Pagination
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

  // Modals
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [employeeToEdit, setEmployeeToEdit] = useState<Employee | null>(null);

  const [isSalaryModalOpen, setIsSalaryModalOpen] = useState(false);
  const [employeeForSalary, setEmployeeForSalary] = useState<Employee | null>(null);

  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [employeeForHistory, setEmployeeForHistory] = useState<Employee | null>(null);

  useEffect(() => {
    api.getFilterOptions()
      .then(setFilterOptions)
      .catch((err) => console.error('Failed to load filter options:', err));
  }, []);

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
      page: 1,
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

  const hasActiveFilters = Boolean(
    filters.search ||
    filters.department ||
    filters.country ||
    filters.job_title ||
    filters.min_salary ||
    filters.max_salary
  );

  const renderSortIcon = (field: string) => {
    if (filters.sort_by !== field) {
      return <ArrowUpDown size={12} style={{ opacity: 0.35 }} />;
    }
    return filters.sort_order === 'asc' ? <ArrowUp size={12} color="var(--primary)" /> : <ArrowDown size={12} color="var(--primary)" />;
  };

  const handleExportCsv = () => {
    if (employees.length === 0) return;
    const headers = ['Code', 'Full Name', 'Email', 'Department', 'Job Title', 'Country', 'Salary USD'];
    const rows = employees.map((e) => [
      e.employee_code,
      `"${e.full_name}"`,
      e.email,
      `"${e.department}"`,
      `"${e.job_title}"`,
      `"${e.country}"`,
      e.current_salary,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `acme_employees_page_${filters.page}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      {/* Page Header */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: 24,
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.5px' }}>
              Employee Directory
            </h1>
            <span style={{
              fontSize: 12,
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--primary-subtle)',
              color: 'var(--primary)',
            }}>
              {totalItems.toLocaleString()} Total
            </span>
          </div>
          <p style={{ fontSize: 13.5, color: 'var(--text-secondary)' }}>
            Manage organizational workforce records, search personnel, and track individual compensation.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleExportCsv}
            title="Export current page as CSV"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>

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
      </div>

      {/* Filter Toolbar Card */}
      <div className="card" style={{ marginBottom: 20, padding: 18, border: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <Filter size={15} color="var(--primary)" />
          <span style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-secondary)' }}>
            Search & Filter Records
          </span>
          {hasActiveFilters && (
            <span style={{
              fontSize: 11,
              fontWeight: 600,
              padding: '1px 7px',
              borderRadius: 4,
              backgroundColor: 'var(--warning-subtle)',
              color: 'var(--warning-text)',
            }}>
              Filtered View
            </span>
          )}
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr auto',
          gap: 10,
          alignItems: 'center',
        }}>
          {/* Search box with keyboard shortcut indicator */}
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              className="input"
              placeholder="Search code, name, or email..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              style={{ paddingLeft: 34, paddingRight: 40 }}
            />
            <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: 11, top: 11 }} />
            <span style={{
              position: 'absolute',
              right: 10,
              top: 8,
              fontSize: 10,
              fontWeight: 700,
              color: 'var(--text-muted)',
              backgroundColor: 'var(--bg-subtle)',
              padding: '2px 5px',
              borderRadius: 4,
              border: '1px solid var(--border-color)',
            }}>
              ⌘K
            </span>
          </div>

          {/* Department Dropdown */}
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

          {/* Country Dropdown */}
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

          {/* Job Title Dropdown */}
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
              placeholder="Min USD"
              value={filters.min_salary}
              onChange={(e) => handleFilterChange('min_salary', e.target.value)}
            />
          </div>

          {/* Max Salary */}
          <div>
            <input
              type="number"
              className="input"
              placeholder="Max USD"
              value={filters.max_salary}
              onChange={(e) => handleFilterChange('max_salary', e.target.value)}
            />
          </div>

          {/* Reset Action */}
          <div>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleResetFilters}
              disabled={!hasActiveFilters}
              style={{ whiteSpace: 'nowrap' }}
            >
              <RotateCcw size={13} />
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

      {/* Main Employee Table */}
      <div className="table-container">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th className="sortable" onClick={() => handleSort('employee_code')}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span>Employee</span>
                    {renderSortIcon('employee_code')}
                  </div>
                </th>
                <th className="sortable" onClick={() => handleSort('department')}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span>Department</span>
                    {renderSortIcon('department')}
                  </div>
                </th>
                <th>Role & Title</th>
                <th>Location</th>
                <th className="sortable" onClick={() => handleSort('current_salary')}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span>Annual Salary</span>
                    {renderSortIcon('current_salary')}
                  </div>
                </th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: 56, color: 'var(--text-secondary)' }}>
                    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 24,
                        height: 24,
                        border: '3px solid #e2e8f0',
                        borderTopColor: 'var(--primary)',
                        borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite',
                      }} />
                      <span style={{ fontSize: 13, fontWeight: 500 }}>Fetching employee records...</span>
                    </div>
                  </td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: 56, color: 'var(--text-secondary)' }}>
                    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                      <AlertCircle size={28} color="var(--text-muted)" />
                      <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>No matching employees</div>
                      <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                        Try clearing or adjusting your search queries and filter bounds.
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                employees.map((emp) => {
                  const avatarColor = getAvatarColor(emp.full_name);
                  const deptClass = `dept-${emp.department.replace(/\s+/g, '-')}`;

                  return (
                    <tr key={emp.id}>
                      {/* Employee Identity with Avatar */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div
                            className="avatar"
                            style={{ backgroundColor: avatarColor.bg, color: avatarColor.text }}
                          >
                            {getInitials(emp.full_name)}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 14 }}>
                              {emp.full_name}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
                              <span style={{
                                fontFamily: 'var(--font-mono)',
                                fontWeight: 600,
                                color: 'var(--primary)',
                                fontSize: 11,
                              }}>
                                {emp.employee_code}
                              </span>
                              <span>•</span>
                              <span>{emp.email}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Department with colored pill */}
                      <td>
                        <span className={`dept-badge ${deptClass}`}>
                          {emp.department}
                        </span>
                      </td>

                      {/* Job Title */}
                      <td>
                        <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                          {emp.job_title}
                        </div>
                      </td>

                      {/* Country */}
                      <td>
                        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                          {emp.country}
                        </span>
                      </td>

                      {/* Current Salary with Tabular Numbers */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                          <span className="tabular-nums" style={{
                            fontWeight: 700,
                            fontSize: 14.5,
                            color: 'var(--text-primary)',
                          }}>
                            ${Number(emp.current_salary).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </span>
                          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)' }}>
                            USD
                          </span>
                        </div>
                      </td>

                      {/* Modern Clean Action Group */}
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          {/* Dedicated Salary Update */}
                          <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            title="Update employee compensation"
                            onClick={() => {
                              setEmployeeForSalary(emp);
                              setIsSalaryModalOpen(true);
                            }}
                            style={{ padding: '5px 11px', fontSize: 12.5 }}
                          >
                            <TrendingUp size={13} />
                            <span>Salary</span>
                          </button>

                          {/* Audit History */}
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            title="View chronological salary audit history"
                            onClick={() => {
                              setEmployeeForHistory(emp);
                              setIsHistoryModalOpen(true);
                            }}
                            style={{ padding: '5px 10px', fontSize: 12.5 }}
                          >
                            <History size={13} />
                            <span>History</span>
                          </button>

                          {/* Non-salary details Edit */}
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            title="Edit employee general details"
                            onClick={() => {
                              setEmployeeToEdit(emp);
                              setIsEmployeeModalOpen(true);
                            }}
                            style={{ padding: '5px 8px' }}
                          >
                            <Edit3 size={14} color="var(--text-secondary)" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Enhanced Pagination Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 20px',
          borderTop: '1px solid var(--border-color)',
          backgroundColor: '#fafbfc',
        }}>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            Showing page <strong style={{ color: 'var(--text-primary)' }}>{filters.page}</strong> of{' '}
            <strong style={{ color: 'var(--text-primary)' }}>{totalPages || 1}</strong> ({totalItems.toLocaleString()} employees)
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              disabled={filters.page <= 1 || loading}
              onClick={() => handleFilterChange('page', filters.page - 1)}
            >
              Previous Page
            </button>

            <span style={{
              fontSize: 12.5,
              fontWeight: 600,
              padding: '4px 10px',
              borderRadius: 6,
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
            }}>
              {filters.page} / {totalPages || 1}
            </span>

            <button
              type="button"
              className="btn btn-secondary btn-sm"
              disabled={filters.page >= totalPages || loading}
              onClick={() => handleFilterChange('page', filters.page + 1)}
            >
              Next Page
            </button>
          </div>
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
