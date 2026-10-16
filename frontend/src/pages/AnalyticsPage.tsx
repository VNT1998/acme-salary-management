import React, { useState, useEffect, useCallback } from 'react';
import {
  RotateCcw,
  DollarSign,
  TrendingUp,
  Users,
  ArrowDownRight,
  ArrowUpRight,
  AlertCircle,
  BarChart2,
} from 'lucide-react';
import type { FilterOptions, SalaryAnalytics } from '../types';

import { api } from '../services/api';
import { KPICard } from '../components/KPICard';

export const AnalyticsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<SalaryAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [department, setDepartment] = useState('');
  const [country, setCountry] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [minSalary, setMinSalary] = useState('');
  const [maxSalary, setMaxSalary] = useState('');

  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    departments: [],
    countries: [],
    job_titles: [],
  });

  useEffect(() => {
    api.getFilterOptions()
      .then(setFilterOptions)
      .catch((err) => console.error('Failed to load filter options:', err));
  }, []);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getSalaryAnalytics({
        department: department || undefined,
        country: country || undefined,
        job_title: jobTitle || undefined,
        min_salary: minSalary || undefined,
        max_salary: maxSalary || undefined,
      });
      setAnalytics(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  }, [department, country, jobTitle, minSalary, maxSalary]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const handleResetFilters = () => {
    setDepartment('');
    setCountry('');
    setJobTitle('');
    setMinSalary('');
    setMaxSalary('');
  };

  const formatUsd = (val: string | null) => {
    if (val === null || val === undefined) return '—';
    return `$${Number(val).toLocaleString('en-US', { minimumFractionDigits: 2 })} USD`;
  };

  // Find max average salary across departments for visual bar ratio
  const maxDeptAvg = analytics?.department_breakdown.reduce((max, d) => {
    const avg = Number(d.average_salary);
    return avg > max ? avg : max;
  }, 0) || 1;

  return (
    <div>
      {/* Page Title */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22 }}>Compensation & Salary Analytics</h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          Programmatic statistical compensation breakdown and distribution metrics
        </p>
      </div>

      {/* Filter Row */}
      <div className="card" style={{ marginBottom: 24, padding: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
          <div>
            <select
              className="select"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            >
              <option value="">All Departments</option>
              {filterOptions.departments.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              className="select"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
            >
              <option value="">All Countries</option>
              {filterOptions.countries.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              className="select"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
            >
              <option value="">All Job Titles</option>
              {filterOptions.job_titles.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <input
              type="number"
              className="input"
              placeholder="Min Salary (USD)"
              value={minSalary}
              onChange={(e) => setMinSalary(e.target.value)}
            />
          </div>

          <div>
            <input
              type="number"
              className="input"
              placeholder="Max Salary (USD)"
              value={maxSalary}
              onChange={(e) => setMaxSalary(e.target.value)}
            />
          </div>

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

      {/* KPI Cards Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 16,
        marginBottom: 24,
      }}>
        <KPICard
          title="Matching Employees"
          value={analytics ? analytics.employee_count.toLocaleString() : null}
          subtitle="Filtered employee count"
          icon={<Users size={20} />}
        />

        <KPICard
          title="Average Salary"
          value={analytics ? formatUsd(analytics.average_salary) : null}
          subtitle="Arithmetic mean (USD)"
          icon={<TrendingUp size={20} />}
        />

        <KPICard
          title="Median Salary"
          value={analytics ? formatUsd(analytics.median_salary) : null}
          subtitle="50th percentile (USD)"
          icon={<DollarSign size={20} />}
        />

        <KPICard
          title="Minimum Salary"
          value={analytics ? formatUsd(analytics.minimum_salary) : null}
          subtitle="Lowest in selection"
          icon={<ArrowDownRight size={20} />}
        />

        <KPICard
          title="Maximum Salary"
          value={analytics ? formatUsd(analytics.maximum_salary) : null}
          subtitle="Highest in selection"
          icon={<ArrowUpRight size={20} />}
        />
      </div>

      {/* Department Breakdown Section */}
      <div className="card">
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16,
          paddingBottom: 12,
          borderBottom: '1px solid var(--border-color)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <BarChart2 size={18} color="var(--primary)" />
            <h2 style={{ fontSize: 16 }}>Department Compensation Breakdown</h2>
          </div>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            All statistics computed programmatically in USD
          </span>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 48, color: 'var(--text-secondary)' }}>
            Calculating statistics...
          </div>
        ) : !analytics || analytics.department_breakdown.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 48, color: 'var(--text-secondary)' }}>
            No department data available for the selected filters.
          </div>
        ) : (
          <div className="table-responsive" style={{ border: 'none' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Department</th>
                  <th>Employees</th>
                  <th>Average Salary</th>
                  <th>Relative Scale</th>
                  <th>Median Salary</th>
                  <th>Min Salary</th>
                  <th>Max Salary</th>
                </tr>
              </thead>
              <tbody>
                {analytics.department_breakdown.map((dept) => {
                  const avgNum = Number(dept.average_salary);
                  const barPct = Math.min(100, Math.round((avgNum / maxDeptAvg) * 100));

                  return (
                    <tr key={dept.department}>
                      <td style={{ fontWeight: 600 }}>{dept.department}</td>
                      <td>
                        <span className="badge">{dept.employee_count.toLocaleString()}</span>
                      </td>
                      <td style={{ fontWeight: 600, color: 'var(--primary)' }}>
                        ${avgNum.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ width: 140 }}>
                        <div style={{
                          height: 8,
                          width: '100%',
                          backgroundColor: 'var(--bg-subtle)',
                          borderRadius: 4,
                          overflow: 'hidden',
                        }}>
                          <div style={{
                            height: '100%',
                            width: `${barPct}%`,
                            backgroundColor: 'var(--primary)',
                            borderRadius: 4,
                          }} />
                        </div>
                      </td>
                      <td style={{ fontWeight: 500 }}>
                        ${Number(dept.median_salary).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>
                        ${Number(dept.minimum_salary).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>
                        ${Number(dept.maximum_salary).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
