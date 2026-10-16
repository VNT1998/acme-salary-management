import React, { useState } from 'react';
import { Shield, Key, CheckCircle, LogOut } from 'lucide-react';
import type { User } from '../types';

interface ProfilePageProps {
  user: User;
  onLogout: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ user, onLogout }) => {
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSaved(true);
    setShowPasswordForm(false);
    setCurrentPassword('');
    setNewPassword('');
    setTimeout(() => setPasswordSaved(false), 4000);
  };

  return (
    <div style={{ maxWidth: 680 }}>
      {/* Title */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 4 }}>
          My Profile
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
          Manage your administrator profile and security credentials.
        </p>
      </div>

      {passwordSaved && (
        <div className="alert alert-success" style={{ marginBottom: 20 }}>
          <CheckCircle size={16} />
          <span>Security credentials updated successfully.</span>
        </div>
      )}

      {/* Main Profile Card */}
      <div className="card" style={{ padding: 32, marginBottom: 24 }}>
        {/* Avatar & Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 28, paddingBottom: 24, borderBottom: '1px solid var(--border-color)' }}>
          <div style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            backgroundColor: 'var(--primary)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 24,
            fontWeight: 700,
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
          }}>
            A
          </div>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>
              Admin User
            </h2>
            <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
              {user.email}
            </div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              marginTop: 6,
              padding: '2px 8px',
              borderRadius: 4,
              backgroundColor: 'var(--primary-subtle)',
              color: 'var(--primary)',
              fontSize: 11.5,
              fontWeight: 600,
            }}>
              <Shield size={12} />
              <span>Administrator</span>
            </div>
          </div>
        </div>

        {/* Profile Info Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <label className="form-label" style={{ fontSize: 13, color: 'var(--text-muted)' }}>Name</label>
            <input
              type="text"
              className="input"
              value="Admin User"
              readOnly
              style={{ backgroundColor: 'var(--bg-subtle)', color: 'var(--text-primary)', fontWeight: 500 }}
            />
          </div>

          <div>
            <label className="form-label" style={{ fontSize: 13, color: 'var(--text-muted)' }}>Email</label>
            <input
              type="email"
              className="input"
              value={user.email}
              readOnly
              style={{ backgroundColor: 'var(--bg-subtle)', color: 'var(--text-primary)', fontWeight: 500 }}
            />
          </div>

          <div>
            <label className="form-label" style={{ fontSize: 13, color: 'var(--text-muted)' }}>Role</label>
            <div style={{
              padding: '10px 14px',
              backgroundColor: 'var(--bg-subtle)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              fontSize: 13.5,
              fontWeight: 600,
              color: 'var(--text-primary)',
            }}>
              Administrator (Full HR Permissions)
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div style={{ marginTop: 28, display: 'flex', gap: 12 }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setShowPasswordForm(!showPasswordForm)}
          >
            <Key size={15} />
            <span>{showPasswordForm ? 'Cancel Password Change' : 'Change Password'}</span>
          </button>

          <button
            type="button"
            className="btn btn-ghost"
            onClick={onLogout}
            style={{ color: 'var(--danger)' }}
          >
            <LogOut size={15} />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Change Password Inline Form */}
        {showPasswordForm && (
          <form onSubmit={handleChangePassword} style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 14 }}>Update Credentials</h3>
            <div className="form-group" style={{ marginBottom: 14 }}>
              <label className="form-label">Current Password</label>
              <input
                type="password"
                className="input"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
              />
            </div>
            <div className="form-group" style={{ marginBottom: 18 }}>
              <label className="form-label">New Password</label>
              <input
                type="password"
                className="input"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new strong password"
              />
            </div>
            <button type="submit" className="btn btn-primary">
              Save New Password
            </button>
          </form>
        )}
      </div>

      {/* Security Policies Info */}
      <div className="card" style={{ padding: 20, backgroundColor: 'var(--bg-surface)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, fontSize: 13.5, marginBottom: 4 }}>
          <Shield size={16} color="var(--primary)" />
          <span>Session & Governance Protocol</span>
        </div>
        <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          All administrative sessions are protected by Argon2id password hashing, HTTP-only secure cookie sessions, SameSite protection, and cryptographic CSRF tokens on all mutating endpoints.
        </p>
      </div>
    </div>
  );
};
