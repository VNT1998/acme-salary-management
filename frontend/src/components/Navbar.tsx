import React from 'react';
import { Users, BarChart3, LogOut, Shield } from 'lucide-react';
import type { User } from '../types';


interface NavbarProps {
  user: User;
  activeTab: 'employees' | 'analytics';
  onTabChange: (tab: 'employees' | 'analytics') => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  activeTab,
  onTabChange,
  onLogout,
}) => {
  return (
    <header style={{
      backgroundColor: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border-color)',
      position: 'sticky',
      top: 0,
      zIndex: 40,
    }}>
      <div style={{
        maxWidth: 1400,
        margin: '0 auto',
        padding: '0 32px',
        height: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        {/* Brand / Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            backgroundColor: 'var(--primary)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: 16,
          }}>
            AC
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 16, lineHeight: 1.2 }}>ACME HR</div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Compensation & Salary Portal</div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 6, backgroundColor: 'var(--bg-subtle)', padding: 4, borderRadius: 8 }}>
          <button
            type="button"
            className="btn"
            style={{
              backgroundColor: activeTab === 'employees' ? 'var(--bg-surface)' : 'transparent',
              color: activeTab === 'employees' ? 'var(--primary)' : 'var(--text-secondary)',
              boxShadow: activeTab === 'employees' ? 'var(--shadow-sm)' : 'none',
              padding: '6px 16px',
              fontSize: 14,
              border: 'none',
            }}
            onClick={() => onTabChange('employees')}
          >
            <Users size={16} />
            <span>Employees</span>
          </button>

          <button
            type="button"
            className="btn"
            style={{
              backgroundColor: activeTab === 'analytics' ? 'var(--bg-surface)' : 'transparent',
              color: activeTab === 'analytics' ? 'var(--primary)' : 'var(--text-secondary)',
              boxShadow: activeTab === 'analytics' ? 'var(--shadow-sm)' : 'none',
              padding: '6px 16px',
              fontSize: 14,
              border: 'none',
            }}
            onClick={() => onTabChange('analytics')}
          >
            <BarChart3 size={16} />
            <span>Analytics</span>
          </button>
        </nav>

        {/* User Account & Logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 12px',
            backgroundColor: 'var(--bg-subtle)',
            borderRadius: 6,
            fontSize: 13,
            color: 'var(--text-secondary)',
          }}>
            <Shield size={14} color="var(--primary)" />
            <span>{user.email}</span>
          </div>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onLogout}
            title="Sign out"
          >
            <LogOut size={14} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};
