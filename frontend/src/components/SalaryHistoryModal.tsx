import React, { useEffect, useState } from 'react';
import { X, History, ArrowRight } from 'lucide-react';
import type { Employee, SalaryHistoryItem } from '../types';

import { api } from '../services/api';

interface SalaryHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
}

export const SalaryHistoryModal: React.FC<SalaryHistoryModalProps> = ({
  isOpen,
  onClose,
  employee,
}) => {
  const [history, setHistory] = useState<SalaryHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (employee && isOpen) {
      loadHistory();
    }
  }, [employee, isOpen]);

  const loadHistory = async () => {
    if (!employee) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.getSalaryHistory(employee.id);
      setHistory(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !employee) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: 680 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <History size={18} color="var(--primary)" />
            <h3 style={{ fontSize: 16 }}>Salary History Audit Trail</h3>
          </div>
          <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="modal-body">
          {/* Employee Banner */}
          <div style={{
            backgroundColor: 'var(--bg-subtle)',
            padding: 14,
            borderRadius: 'var(--radius-md)',
            marginBottom: 16,
            display: 'flex',
            flexWrap: 'wrap',
            gap: 12,
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <div>
              <div style={{ fontWeight: 600 }}>{employee.full_name} ({employee.employee_code})</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                {employee.department} • {employee.job_title} • {employee.country}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>CURRENT SALARY</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--primary)' }}>
                ${Number(employee.current_salary).toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
              </div>
            </div>
          </div>

          {loading ? (
            <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-secondary)' }}>
              Loading audit records...
            </div>
          ) : error ? (
            <div className="alert alert-error">{error}</div>
          ) : history.length === 0 ? (
            <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-secondary)' }}>
              No salary history found.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Effective Date</th>
                    <th>Compensation Change</th>
                    <th>New Salary</th>
                    <th>Recorded Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((item) => {

                    const isInitial = item.previous_salary === null;
                    const prevNum = item.previous_salary ? Number(item.previous_salary) : null;
                    const newNum = Number(item.new_salary);
                    const diff = prevNum !== null ? newNum - prevNum : 0;
                    const pct = prevNum && prevNum > 0 ? ((diff / prevNum) * 100).toFixed(1) : null;

                    return (
                      <tr key={item.id}>
                        <td style={{ fontWeight: 500 }}>{item.effective_date}</td>
                        <td>
                          {isInitial ? (
                            <span className="badge badge-primary">Initial Salary</span>
                          ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span style={{ color: 'var(--text-muted)' }}>
                                ${prevNum?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                              </span>
                              <ArrowRight size={12} color="var(--text-muted)" />
                              <span style={{
                                color: diff >= 0 ? 'var(--success)' : 'var(--error)',
                                fontWeight: 500,
                              }}>
                                {diff >= 0 ? `+${diff.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : diff.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                {pct && ` (${pct}%)`}
                              </span>
                            </div>
                          )}
                        </td>
                        <td style={{ fontWeight: 600 }}>
                          ${newNum.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
                        </td>
                        <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                          {item.recorded_at.replace('T', ' ').substring(0, 19)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
