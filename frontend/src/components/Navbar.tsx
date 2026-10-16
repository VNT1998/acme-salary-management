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
      <div style={{
        maxWidth: 1440,
        margin: '0 auto',
        padding: '0 36px',
        height: 68,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        {/* Brand / Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px -2px rgba(67, 56, 202, 0.35)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
          }}>
            <Sparkles size={18} color="#a5b4fc" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontWeight: 800, fontSize: 17, letterSpacing: '-0.4px', color: 'var(--text-primary)' }}>
                ACME
              </span>
              <span style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                padding: '2px 6px',
                borderRadius: 4,
                backgroundColor: 'var(--primary-subtle)',
                color: 'var(--primary)',
              }}>
                Comp v1.0
              </span>
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--text-secondary)', fontWeight: 500, letterSpacing: '-0.1px' }}>
              Salary Management & Compensation Analytics
            </div>
          </div>
        </div>

        {/* Central Segmented Navigation Tabs */}
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          backgroundColor: '#f1f5f9',
          padding: 4,
          borderRadius: 10,
          border: '1px solid #e2e8f0',
        }}>
          <button
            type="button"
            className="btn"
            style={{
              backgroundColor: activeTab === 'employees' ? '#ffffff' : 'transparent',
              color: activeTab === 'employees' ? 'var(--primary)' : 'var(--text-secondary)',
              boxShadow: activeTab === 'employees' ? '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)' : 'none',
              padding: '7px 18px',
              fontSize: 13.5,
              fontWeight: 600,
              borderRadius: 8,
              border: 'none',
              transition: 'all 0.15s ease',
            }}
            onClick={() => onTabChange('employees')}
          >
            <Users size={15} />
            <span>Employees</span>
          </button>

          <button
            type="button"
            className="btn"
            style={{
              backgroundColor: activeTab === 'analytics' ? '#ffffff' : 'transparent',
              color: activeTab === 'analytics' ? 'var(--primary)' : 'var(--text-secondary)',
              boxShadow: activeTab === 'analytics' ? '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)' : 'none',
              padding: '7px 18px',
              fontSize: 13.5,
              fontWeight: 600,
              borderRadius: 8,
              border: 'none',
              transition: 'all 0.15s ease',
            }}
            onClick={() => onTabChange('analytics')}
          >
            <BarChart3 size={15} />
            <span>Analytics</span>
          </button>
        </nav>

        {/* Right Session & Account Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {/* Live DB Pill */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 12,
            fontWeight: 600,
            color: 'var(--text-secondary)',
            backgroundColor: '#ffffff',
            padding: '5px 12px',
            borderRadius: 9999,
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-xs)',
          }}>
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
            gap: 9,
            padding: '4px 10px 4px 6px',
            backgroundColor: '#ffffff',
            borderRadius: 8,
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-xs)',
          }}>
            <div style={{
              width: 26,
              height: 26,
              borderRadius: 6,
              backgroundColor: 'var(--primary-subtle)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 11,
              fontWeight: 700,
            }}>
              HR
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
              {user.email}
            </span>
          </div>

          {/* Logout */}
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={onLogout}
            title="Sign out of HR session"
            style={{ color: 'var(--text-secondary)', padding: '6px 10px' }}
          >
            <LogOut size={15} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};
