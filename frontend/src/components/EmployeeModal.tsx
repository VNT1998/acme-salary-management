import React, { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import type { Employee, FilterOptions } from '../types';

import { api } from '../services/api';

interface EmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  employeeToEdit?: Employee | null;
  filterOptions: FilterOptions;
}

export const EmployeeModal: React.FC<EmployeeModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  employeeToEdit,
  filterOptions,
}) => {
  const isEditing = Boolean(employeeToEdit);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [country, setCountry] = useState('');
  const [initialSalary, setInitialSalary] = useState('');
  const [effectiveDate, setEffectiveDate] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (employeeToEdit) {
      setFullName(employeeToEdit.full_name);
      setEmail(employeeToEdit.email);
      setDepartment(employeeToEdit.department);
      setJobTitle(employeeToEdit.job_title);
      setCountry(employeeToEdit.country);
      setInitialSalary('');
      setEffectiveDate('');
    } else {
      setFullName('');
      setEmail('');
      setDepartment(filterOptions.departments[0] || 'Engineering');
      setJobTitle(filterOptions.job_titles[0] || 'Software Engineer');
      setCountry(filterOptions.countries[0] || 'United States');
      setInitialSalary('100000.00');
      setEffectiveDate(new Date().toISOString().split('T')[0]);
    }
    setError(null);
  }, [employeeToEdit, filterOptions, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isEditing && employeeToEdit) {
        await api.updateEmployee(employeeToEdit.id, {
          full_name: fullName,
          email,
          department,
          job_title: jobTitle,
          country,
        });
      } else {
        await api.createEmployee({
          full_name: fullName,
          email,
          department,
          job_title: jobTitle,
          country,
          initial_salary: initialSalary,
          effective_date: effectiveDate,
        });
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 style={{ fontSize: 16 }}>{isEditing ? 'Edit Employee Details' : 'Add New Employee'}</h3>
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

            {isEditing && (
              <div className="alert" style={{ backgroundColor: 'var(--bg-subtle)', color: 'var(--text-secondary)' }}>
                <span>Note: Salary information cannot be modified here. Use the dedicated "Update Salary" action to preserve audit history.</span>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="input"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Jane Doe"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="input"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. jane.doe@acme.test"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Department</label>
                <select
                  className="select"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  required
                >
                  {filterOptions.departments.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Country</label>
                <select
                  className="select"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  required
                >
                  {filterOptions.countries.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Job Title</label>
              <input
                type="text"
                className="input"
                required
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. Senior Software Engineer"
              />
            </div>

            {!isEditing && (
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Initial Salary (USD)</label>
                  <input
                    type="text"
                    className="input"
                    required
                    value={initialSalary}
                    onChange={(e) => setInitialSalary(e.target.value)}
                    placeholder="e.g. 120000.00"
                  />
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
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Employee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
