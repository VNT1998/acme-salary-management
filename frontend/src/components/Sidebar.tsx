import React from 'react';
import { LayoutDashboard, Users, BarChart2, User as UserIcon, X, LogOut } from 'lucide-react';
import type { User } from '../types';

export type NavTab = 'dashboard' | 'employees' | 'analytics' | 'profile';

interface SidebarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onLogout: () => void;
  user: User;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  isOpenMobile,
  onCloseMobile,
  onLogout,
  user,
}) => {
  const handleNavClick = (tab: NavTab) => {
    onTabChange(tab);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.4)',
            zIndex: 48,
          }}
        />
      )}

      {/* Left Sidebar */}
      <aside className={`sidebar ${isOpenMobile ? 'open' : ''}`}>
        {/* Brand Header */}
        <div className="sidebar-header" style={{ justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img
              src="/acme-hrms-logo.png"
              alt="ACME HRMS Logo"
              className="sidebar-logo"
            />
          </div>
          <button
            type="button"
            className="mobile-only btn btn-ghost btn-sm"
            onClick={onCloseMobile}
            style={{ padding: 4 }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="sidebar-nav">
          <button
            type="button"
            className={`sidebar-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => handleNavClick('dashboard')}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </button>

          <button
            type="button"
            className={`sidebar-item ${activeTab === 'employees' ? 'active' : ''}`}
            onClick={() => handleNavClick('employees')}
          >
            <Users size={18} />
            <span>Employees</span>
          </button>

          <button
            type="button"
            className={`sidebar-item ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => handleNavClick('analytics')}
          >
            <BarChart2 size={18} />
            <span>Analytics</span>
          </button>

          <button
            type="button"
            className={`sidebar-item ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => handleNavClick('profile')}
          >
            <UserIcon size={18} />
            <span>Profile</span>
          </button>
        </nav>

        {/* Footer info / Logout */}
        <div style={{
          padding: '16px 16px 20px',
          borderTop: '1px solid var(--border-color)',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 10,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
              <div className="user-avatar-circle" style={{ width: 32, height: 32, fontSize: 12 }}>
                A
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  Admin User
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user.email}
                </div>
              </div>
            </div>

            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={onLogout}
              title="Logout"
              style={{ padding: 6, color: 'var(--text-secondary)' }}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
