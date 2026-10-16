import React, { useState, useEffect } from 'react';
import { Users, CreditCard, UserCheck, Clock, ArrowUpRight } from 'lucide-react';
import { api } from '../services/api';
import type { SalaryAnalytics, Employee } from '../types';

interface DashboardPageProps {
  onNavigateTab: (tab: 'dashboard' | 'employees' | 'analytics' | 'profile') => void;
  onOpenEmployeeSalary?: (emp: Employee) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigateTab }) => {
  const [analytics, setAnalytics] = useState<SalaryAnalytics | null>(null);
  const [recentEmployees, setRecentEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getSalaryAnalytics({}),
      api.getEmployees({ page: 1, page_size: 5, sort_by: 'created_at', sort_order: 'desc' }),
    ])
      .then(([analyticsData, employeesRes]) => {
        setAnalytics(analyticsData);
        setRecentEmployees(employeesRes.items);
      })
      .catch((err) => console.error('Dashboard load failed:', err))
      .finally(() => setLoading(false));
  }, []);

  const totalPayrollAnnual = analytics
    ? (Number(analytics.average_salary) * analytics.employee_count)
    : 0;

  const totalPayrollMonthly = totalPayrollAnnual / 12;

  // Department colors for Donut Chart
  const deptColors: Record<string, string> = {
    Engineering: '#2563EB',
    Product: '#10B981',
    Design: '#F59E0B',
    Marketing: '#8B5CF6',
    Finance: '#06B6D4',
    Operations: '#F97316',
    'Customer Success': '#EC4899',
    'Human Resources': '#E11D48',
    Legal: '#6366F1',
    Sales: '#14B8A6',
  };

  // Salary cohort buckets for distribution chart
  const cohorts = [
    { label: '< 50K', min: 0, max: 50000, count: 120 },
    { label: '50K - 75K', min: 50000, max: 75000, count: 850 },
    { label: '75K - 100K', min: 75000, max: 100000, count: 2400 },
    { label: '100K - 125K', min: 100000, max: 125000, count: 3850 },
    { label: '125K - 150K', min: 125000, max: 150000, count: 2150 },
    { label: '> 150K', min: 150000, max: 9999999, count: 630 },
  ];
  const maxCohortCount = Math.max(...cohorts.map((c) => c.count));

  // Compute total department count for donut chart proportions
  const totalDeptHeadcount = analytics?.department_breakdown.reduce((sum, d) => sum + d.employee_count, 0) || 1;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 4 }}>
          Dashboard
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
          Welcome back! Here's what's happening in your organization.
        </p>
      </div>

      {/* 4 Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: 18,
        marginBottom: 28,
      }}>
        {/* Card 1: Total Employees */}
        <div className="card" style={{ padding: '20px 22px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            backgroundColor: '#EFF6FF',
            color: '#2563EB',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Users size={24} />
          </div>
          <div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>Total Employees</div>
            <div className="tabular-nums" style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', marginTop: 2 }}>
              {analytics ? analytics.employee_count.toLocaleString() : '—'}
            </div>
          </div>
        </div>

        {/* Card 2: Total Payroll Cost */}
        <div className="card" style={{ padding: '20px 22px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            backgroundColor: '#ECFDF5',
            color: '#10B981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <CreditCard size={24} />
          </div>
          <div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>Total Monthly Payroll</div>
            <div className="tabular-nums" style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', marginTop: 2 }}>
              {analytics ? `$${Math.round(totalPayrollMonthly).toLocaleString('en-US')}` : '—'}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              ${(totalPayrollAnnual / 1000000).toFixed(1)}M USD annual run-rate
            </div>
          </div>
        </div>

        {/* Card 3: Avg. Salary */}
        <div className="card" style={{ padding: '20px 22px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            backgroundColor: '#FFFBEB',
            color: '#F59E0B',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <UserCheck size={24} />
          </div>
          <div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>Avg. Salary</div>
            <div className="tabular-nums" style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', marginTop: 2 }}>
              {analytics ? `$${Math.round(Number(analytics.average_salary)).toLocaleString('en-US')}` : '—'}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>USD per employee</div>
          </div>
        </div>

        {/* Card 4: Recent Updates */}
        <div className="card" style={{ padding: '20px 22px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            backgroundColor: '#F5F3FF',
            color: '#8B5CF6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Clock size={24} />
          </div>
          <div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>Recent Updates</div>
            <div className="tabular-nums" style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', marginTop: 2 }}>
              {recentEmployees.length}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Active audit entries</div>
          </div>
        </div>
      </div>

      {/* Middle Row: Two Charts */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: 20,
        marginBottom: 28,
      }}>
        {/* Chart 1: Department-wise Employees */}
        <div className="card" style={{ padding: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20 }}>
            Department-wise Employees
          </h2>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 32, flexWrap: 'wrap' }}>
            {/* Donut SVG */}
            <div style={{ position: 'relative', width: 170, height: 170, flexShrink: 0 }}>
              <svg width="170" height="170" viewBox="0 0 42 42">
                <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#f1f5f9" strokeWidth="6" />
                {analytics?.department_breakdown.slice(0, 5).reduce((acc: any, dept) => {
                  const pct = (dept.employee_count / totalDeptHeadcount) * 100;
                  const strokeDasharray = `${pct} ${100 - pct}`;
                  const strokeDashoffset = 100 - acc.accumulatedOffset + 25;
                  const color = deptColors[dept.department] || '#94a3b8';

                  acc.elements.push(
                    <circle
                      key={dept.department}
                      cx="21"
                      cy="21"
                      r="15.91549430918954"
                      fill="transparent"
                      stroke={color}
                      strokeWidth="6"
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={strokeDashoffset}
                    />
                  );
                  acc.accumulatedOffset += pct;
                  return acc;
                }, { elements: [], accumulatedOffset: 0 }).elements}
              </svg>
              <div style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <span className="tabular-nums" style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>
                  {analytics ? analytics.department_breakdown.length : '10'}
                </span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Depts</span>
              </div>
            </div>

            {/* Department Breakdown Legend */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1, minWidth: 160 }}>
              {analytics?.department_breakdown.slice(0, 5).map((dept) => {
                const color = deptColors[dept.department] || '#94a3b8';
                const pct = Math.round((dept.employee_count / totalDeptHeadcount) * 100);

                return (
                  <div key={dept.department} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: color }} />
                      <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{dept.department}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className="tabular-nums" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {dept.employee_count.toLocaleString()}
                      </span>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)', width: 32, textAlign: 'right' }}>
                        {pct}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Chart 2: Salary Distribution Bar Chart */}
        <div className="card" style={{ padding: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20 }}>
            Salary Distribution
          </h2>

          <div style={{
            height: 180,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: 12,
            paddingBottom: 28,
            position: 'relative',
            borderBottom: '1px solid var(--border-color)',
          }}>
            {cohorts.map((cohort) => {
              const heightPct = Math.round((cohort.count / maxCohortCount) * 100);

              return (
                <div
                  key={cohort.label}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    height: '100%',
                    justifyContent: 'flex-end',
                  }}
                >
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>
                    {cohort.count}
                  </div>
                  <div
                    style={{
                      width: '80%',
                      maxWidth: 42,
                      height: `${heightPct}%`,
                      backgroundColor: '#3B82F6',
                      borderRadius: '6px 6px 0 0',
                      transition: 'height 0.3s ease',
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 4,
                      fontSize: 10.5,
                      color: 'var(--text-secondary)',
                      fontWeight: 500,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {cohort.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent Salary Updates */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{
          padding: '18px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border-color)',
        }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
            Recent Salary Updates
          </h2>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => onNavigateTab('employees')}
            style={{ color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}
          >
            <span>View All</span>
            <ArrowUpRight size={15} />
          </button>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Department</th>
                <th>Location</th>
                <th>Current Salary (USD)</th>
                <th>Effective Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>
                    Loading updates...
                  </td>
                </tr>
              ) : recentEmployees.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>
                    No recent updates recorded yet.
                  </td>
                </tr>
              ) : (
                recentEmployees.map((emp) => (
                  <tr key={emp.id}>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      <div>{emp.full_name}</div>
                      <span className="tabular-nums" style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        {emp.employee_code}
                      </span>
                    </td>
                    <td>
                      <span className={`dept-badge dept-${emp.department.replace(/\s+/g, '-')}`}>
                        {emp.department}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{emp.country}</td>
                    <td className="tabular-nums" style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--primary)' }}>
                      ${Number(emp.current_salary).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>
                      {emp.created_at ? new Date(emp.created_at).toLocaleDateString() : 'Active'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
