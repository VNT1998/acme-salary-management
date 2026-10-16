import React from 'react';
import { Search, Menu, ChevronDown, LogOut, User as UserIcon } from 'lucide-react';
import type { User } from '../types';

interface TopbarProps {
  user: User;
  onOpenMobileSidebar: () => void;
  onLogout: () => void;
  onNavigateProfile: () => void;
  searchTerm?: string;
  onSearchChange?: (val: string) => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  user,
  onOpenMobileSidebar,
  onLogout,
  onNavigateProfile,
  searchTerm = '',
  onSearchChange,
}) => {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  return (
    <header className="topbar">
      {/* Left: Mobile Toggle & Search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <button
          type="button"
          className="mobile-only btn btn-ghost btn-sm"
          onClick={onOpenMobileSidebar}
          style={{ padding: 6 }}
          aria-label="Open sidebar"
        >
          <Menu size={20} color="var(--text-primary)" />
        </button>

        <div className="topbar-search">
          <Search size={16} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
          />
        </div>
      </div>

      {/* Right: User Profile & Dropdown */}
      <div className="topbar-right">
        <div style={{ position: 'relative' }}>
          <div
            className="user-badge"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <div className="user-avatar-circle">
              A
            </div>
            <div className="desktop-only" style={{ textAlign: 'left', lineHeight: 1.2 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                Admin User
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                {user.email}
              </div>
            </div>
            <ChevronDown size={14} color="var(--text-secondary)" className="desktop-only" />
          </div>

          {dropdownOpen && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: 48,
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-lg)',
                width: 180,
                zIndex: 60,
                overflow: 'hidden',
              }}
            >
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => {
                  setDropdownOpen(false);
                  onNavigateProfile();
                }}
                style={{
                  width: '100%',
                  justifyContent: 'flex-start',
                  padding: '10px 14px',
                  borderRadius: 0,
                  fontSize: 13,
                  borderBottom: '1px solid var(--border-subtle)',
                }}
              >
                <UserIcon size={15} />
                <span>My Profile</span>
              </button>

              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => {
                  setDropdownOpen(false);
                  onLogout();
                }}
                style={{
                  width: '100%',
                  justifyContent: 'flex-start',
                  padding: '10px 14px',
                  borderRadius: 0,
                  fontSize: 13,
                  color: 'var(--danger)',
                }}
              >
                <LogOut size={15} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
