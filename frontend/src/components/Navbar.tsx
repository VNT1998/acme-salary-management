import React from 'react';
import { Users, BarChart3, LogOut, Sparkles } from 'lucide-react';
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
      backgroundColor: 'rgba(255, 255, 255, 0.85)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border-color)',
      position: 'sticky',
      top: 0,
      zIndex: 40,
    }}>
      {/* Desktop Single-Row Navbar */}
      <div className="navbar-inner desktop-only">
        {/* Brand / Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34,
            height: 34,
            borderRadius: 8,
            background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px -2px rgba(67, 56, 202, 0.35)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            flexShrink: 0,
          }}>
            <Sparkles size={16} color="#a5b4fc" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontWeight: 800, fontSize: 16, letterSpacing: '-0.3px', color: 'var(--text-primary)' }}>
                ACME
              </span>
              <span style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                padding: '2px 5px',
                borderRadius: 4,
                backgroundColor: 'var(--primary-subtle)',
                color: 'var(--primary)',
              }}>
                Comp v1.0
              </span>
            </div>
            <div className="navbar-brand-subtitle">
              Salary Management & Compensation Analytics
            </div>
          </div>
        </div>

        {/* Central Segmented Navigation Tabs */}
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          gap: 3,
          backgroundColor: '#f1f5f9',
          padding: 3,
          borderRadius: 8,
          border: '1px solid #e2e8f0',
        }}>
          <button
            type="button"
            className="btn"
            style={{
              backgroundColor: activeTab === 'employees' ? '#ffffff' : 'transparent',
              color: activeTab === 'employees' ? 'var(--primary)' : 'var(--text-secondary)',
              boxShadow: activeTab === 'employees' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              padding: '6px 14px',
              fontSize: 13,
              fontWeight: 600,
              borderRadius: 6,
              border: 'none',
              transition: 'all 0.15s ease',
            }}
            onClick={() => onTabChange('employees')}
          >
            <Users size={14} />
            <span>Employees</span>
          </button>

          <button
            type="button"
            className="btn"
            style={{
              backgroundColor: activeTab === 'analytics' ? '#ffffff' : 'transparent',
              color: activeTab === 'analytics' ? 'var(--primary)' : 'var(--text-secondary)',
              boxShadow: activeTab === 'analytics' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              padding: '6px 14px',
              fontSize: 13,
              fontWeight: 600,
              borderRadius: 6,
              border: 'none',
              transition: 'all 0.15s ease',
            }}
            onClick={() => onTabChange('analytics')}
          >
            <BarChart3 size={14} />
            <span>Analytics</span>
          </button>
        </nav>

        {/* Right Session & Account Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Live DB Pill */}
          <div className="navbar-stats-pill">
            <span style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              backgroundColor: '#10b981',
              boxShadow: '0 0 6px #10b981',
            }} />
            <span>10,000 Records</span>
          </div>

          {/* User Profile */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 7,
            padding: '3px 8px 3px 5px',
            backgroundColor: '#ffffff',
            borderRadius: 7,
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-xs)',
          }}>
            <div style={{
              width: 24,
              height: 24,
              borderRadius: 5,
              backgroundColor: 'var(--primary-subtle)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 10.5,
              fontWeight: 700,
            }}>
              HR
            </div>
            <span className="navbar-user-email">
              {user.email}
            </span>
          </div>

          {/* Logout */}
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={onLogout}
            title="Sign out of HR session"
            style={{ color: 'var(--text-secondary)', padding: '5px 8px' }}
          >
            <LogOut size={14} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Mobile-Optimized Double Row Header */}
      <div className="mobile-only" style={{ padding: '10px 14px 10px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          {/* Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 28,
              height: 28,
              borderRadius: 7,
              background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Sparkles size={14} color="#a5b4fc" />
            </div>
            <span style={{ fontWeight: 800, fontSize: 16, color: 'var(--text-primary)' }}>ACME</span>
            <span style={{
              fontSize: 9.5,
              fontWeight: 700,
              padding: '2px 5px',
              borderRadius: 4,
              backgroundColor: 'var(--primary-subtle)',
              color: 'var(--primary)',
            }}>
              Comp v1.0
            </span>
          </div>

          {/* User Avatar & Logout */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 26,
              height: 26,
              borderRadius: 6,
              backgroundColor: 'var(--primary-subtle)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 10.5,
              fontWeight: 700,
            }}>
              HR
            </div>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={onLogout}
              title="Logout"
              style={{ padding: '4px 8px', fontSize: 12 }}
            >
              <LogOut size={14} />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Full-width segmented tab controls */}
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: '#f1f5f9',
          padding: 3,
          borderRadius: 8,
          border: '1px solid #e2e8f0',
        }}>
          <button
            type="button"
            className="btn"
            style={{
              flex: 1,
              backgroundColor: activeTab === 'employees' ? '#ffffff' : 'transparent',
              color: activeTab === 'employees' ? 'var(--primary)' : 'var(--text-secondary)',
              boxShadow: activeTab === 'employees' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              padding: '7px 0',
              fontSize: 13,
              fontWeight: 600,
              borderRadius: 6,
              border: 'none',
              transition: 'all 0.15s ease',
            }}
            onClick={() => onTabChange('employees')}
          >
            <Users size={14} />
            <span>Employees</span>
          </button>

          <button
            type="button"
            className="btn"
            style={{
              flex: 1,
              backgroundColor: activeTab === 'analytics' ? '#ffffff' : 'transparent',
              color: activeTab === 'analytics' ? 'var(--primary)' : 'var(--text-secondary)',
              boxShadow: activeTab === 'analytics' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              padding: '7px 0',
              fontSize: 13,
              fontWeight: 600,
              borderRadius: 6,
              border: 'none',
              transition: 'all 0.15s ease',
            }}
            onClick={() => onTabChange('analytics')}
          >
            <BarChart3 size={14} />
            <span>Analytics</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
