import React, { useState, useEffect } from 'react';
import { X, AlertCircle, TrendingUp, History } from 'lucide-react';
import type { Employee } from '../types';

import { api } from '../services/api';

interface SalaryUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  employee: Employee | null;
}

export const SalaryUpdateModal: React.FC<SalaryUpdateModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  employee,
}) => {
  const [newSalary, setNewSalary] = useState('');
  const [effectiveDate, setEffectiveDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (employee) {
      setNewSalary(employee.current_salary);
      setEffectiveDate(new Date().toISOString().split('T')[0]);
      setError(null);
    }
  }, [employee, isOpen]);

  if (!isOpen || !employee) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await api.updateSalary(employee.id, newSalary, effectiveDate);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update salary');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <TrendingUp size={18} color="var(--primary)" />
            <h3 style={{ fontSize: 16 }}>Update Employee Salary</h3>
          </div>
          <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div className="alert alert-error">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {/* Current Employee Summary Banner */}
            <div style={{
              backgroundColor: 'var(--bg-subtle)',
              padding: 16,
              borderRadius: 'var(--radius-md)',
              marginBottom: 20,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{employee.full_name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                  {employee.employee_code} • {employee.department} • {employee.job_title}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Current Salary</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--primary)' }}>
                  ${Number(employee.current_salary).toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">New Annual Salary (USD)</label>
              <input
                type="text"
                className="input"
                required
                value={newSalary}
                onChange={(e) => setNewSalary(e.target.value)}
                placeholder="e.g. 135000.00"
                style={{ fontSize: 16, fontWeight: 600 }}
              />
              <span style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
                Enter the new compensation amount in US Dollars (two decimal places).
              </span>
            </div>

            <div className="form-group">
              <label className="form-label">Effective Date</label>
              <input
                type="date"
                className="input"
                required
                value={effectiveDate}
                onChange={(e) => setEffectiveDate(e.target.value)}
              />
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 12,
              color: 'var(--text-secondary)',
              marginTop: 12,
            }}>
              <History size={14} color="var(--primary)" />
              <span>The current salary will be archived automatically in the immutable audit trail.</span>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Processing...' : 'Confirm Salary Change'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
