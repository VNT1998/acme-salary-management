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
      {/* Page Title & Context Header */}
      <div className="page-header-row">
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
            Compensation Analytics
          </h1>
          <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', marginTop: 4 }}>
            Real-time programmatic statistical distribution, quartiles, and cross-departmental parity metrics across ACME
          </p>
        </div>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '6px 12px',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-full)',
          fontSize: 12,
          fontWeight: 600,
          color: 'var(--text-secondary)',
          boxShadow: 'var(--shadow-xs)',
          alignSelf: 'flex-start',
        }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: '#10b981' }} />
          <span>Real-time Calculation Engine (USD)</span>
        </div>
      </div>

      {/* Filter Row */}
      <div className="card" style={{ marginBottom: 24, padding: '18px 20px' }}>
        <div style={{
          fontSize: 12,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          color: 'var(--text-muted)',
          marginBottom: 12,
        }}>
          Segment & Filter Cohort
        </div>
        <div className="filter-grid-analytics">
          <div>
            <label className="form-label" style={{ fontSize: 11.5, marginBottom: 4 }}>Department</label>
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
            <label className="form-label" style={{ fontSize: 11.5, marginBottom: 4 }}>Country</label>
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
            <label className="form-label" style={{ fontSize: 11.5, marginBottom: 4 }}>Job Title</label>
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
            <label className="form-label" style={{ fontSize: 11.5, marginBottom: 4 }}>Minimum Base (USD)</label>
            <input
              type="number"
              className="input tabular-nums"
              placeholder="e.g. 50,000"
              value={minSalary}
              onChange={(e) => setMinSalary(e.target.value)}
            />
          </div>

          <div>
            <label className="form-label" style={{ fontSize: 11.5, marginBottom: 4 }}>Maximum Base (USD)</label>
            <input
              type="number"
              className="input tabular-nums"
              placeholder="e.g. 250,000"
              value={maxSalary}
              onChange={(e) => setMaxSalary(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleResetFilters}
              style={{ width: '100%', height: 39 }}
            >
              <RotateCcw size={14} />
              <span>Reset Filters</span>
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: 20 }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Cards Row */}
      <div className="kpi-grid">
        <KPICard
          title="Active Headcount"
          value={analytics ? analytics.employee_count.toLocaleString() : null}
          subtitle="Employees in selected cohort"
          icon={<Users size={18} />}
          accentColor="#4f46e5"
          accentBg="#eef2ff"
          badge="Sample"
        />

        <KPICard
          title="Average Base"
          value={analytics ? formatUsd(analytics.average_salary) : null}
          subtitle="Arithmetic mean per employee"
          icon={<TrendingUp size={18} />}
          accentColor="#10b981"
          accentBg="#ecfdf5"
          badge="Mean"
        />

        <KPICard
          title="Median Compensation"
          value={analytics ? formatUsd(analytics.median_salary) : null}
          subtitle="50th percentile midpoint"
          icon={<DollarSign size={18} />}
          accentColor="#8b5cf6"
          accentBg="#f5f3ff"
          badge="P50"
        />

        <KPICard
          title="Minimum Floor"
          value={analytics ? formatUsd(analytics.minimum_salary) : null}
          subtitle="Lowest in current query"
          icon={<ArrowDownRight size={18} />}
          accentColor="#0284c7"
          accentBg="#e0f2fe"
          badge="Floor"
        />

        <KPICard
          title="Maximum Ceiling"
          value={analytics ? formatUsd(analytics.maximum_salary) : null}
          subtitle="Highest in current query"
          icon={<ArrowUpRight size={18} />}
          accentColor="#d97706"
          accentBg="#fffbeb"
          badge="Ceiling"
        />
      </div>

      {/* Department Breakdown Section */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{
          padding: '18px 24px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          backgroundColor: '#fafbfc',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--primary-subtle)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <BarChart2 size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
                Department Compensation Breakdown
              </h2>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                {analytics ? `${analytics.department_breakdown.length} departments reporting` : 'Aggregating compensation metrics...'}
              </span>
            </div>
          </div>
          <div style={{
            fontSize: 12,
            fontWeight: 500,
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-mono)',
          }}>
            ISO 4217 Currency: USD
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 56, color: 'var(--text-secondary)' }}>
            <div style={{ fontSize: 14, fontWeight: 600 }}>Calculating statistics across 10,000 records...</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Programmatic aggregation in SQLite</div>
          </div>
        ) : !analytics || analytics.department_breakdown.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 56, color: 'var(--text-secondary)' }}>
            No department data available for the selected filters.
          </div>
        ) : (
          <div className="table-responsive" style={{ border: 'none' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Department</th>
                  <th style={{ textAlign: 'right' }}>Headcount</th>
                  <th style={{ textAlign: 'right' }}>Average Base</th>
                  <th style={{ width: 180 }}>Relative Avg Scale</th>
                  <th style={{ textAlign: 'right' }}>Median (P50)</th>
                  <th style={{ textAlign: 'right' }}>Min Base</th>
                  <th style={{ textAlign: 'right' }}>Max Base</th>
                </tr>
              </thead>
              <tbody>
                {analytics.department_breakdown.map((dept) => {
                  const avgNum = Number(dept.average_salary);
                  const barPct = Math.min(100, Math.round((avgNum / maxDeptAvg) * 100));

                  return (
                    <tr key={dept.department}>
                      <td>
                        <span className={`dept-badge dept-${dept.department.replace(/\s+/g, '-')}`}>
                          {dept.department}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <span className="badge tabular-nums" style={{ fontWeight: 600 }}>
                          {dept.employee_count.toLocaleString()}
                        </span>
                      </td>
                      <td className="tabular-nums" style={{
                        textAlign: 'right',
                        fontWeight: 700,
                        color: 'var(--text-primary)',
                        fontFamily: 'var(--font-mono)',
                      }}>
                        ${avgNum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{
                            flex: 1,
                            height: 7,
                            backgroundColor: 'var(--bg-subtle)',
                            borderRadius: 'var(--radius-full)',
                            overflow: 'hidden',
                          }}>
                            <div style={{
                              height: '100%',
                              width: `${barPct}%`,
                              background: 'linear-gradient(90deg, #4f46e5 0%, #6366f1 100%)',
                              borderRadius: 'var(--radius-full)',
                            }} />
                          </div>
                          <span className="tabular-nums" style={{
                            fontSize: 11,
                            fontWeight: 600,
                            color: 'var(--text-muted)',
                            width: 32,
                            textAlign: 'right',
                          }}>
                            {barPct}%
                          </span>
                        </div>
                      </td>
                      <td className="tabular-nums" style={{
                        textAlign: 'right',
                        fontWeight: 600,
                        color: '#4338ca',
                        fontFamily: 'var(--font-mono)',
                      }}>
                        ${Number(dept.median_salary).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="tabular-nums" style={{
                        textAlign: 'right',
                        color: 'var(--text-secondary)',
                        fontFamily: 'var(--font-mono)',
                        fontSize: 13,
                      }}>
                        ${Number(dept.minimum_salary).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="tabular-nums" style={{
                        textAlign: 'right',
                        color: 'var(--text-secondary)',
                        fontFamily: 'var(--font-mono)',
                        fontSize: 13,
                      }}>
                        ${Number(dept.maximum_salary).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
