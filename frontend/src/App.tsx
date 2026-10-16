import React, { useState, useEffect } from 'react';
import { api } from './services/api';
import type { User } from './types';

import { Sidebar, type NavTab } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { LoginView } from './components/LoginView';
import { DashboardPage } from './pages/DashboardPage';
import { EmployeesPage } from './pages/EmployeesPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { ProfilePage } from './pages/ProfilePage';
import './styles/theme.css';

export const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Check if user already has an active session cookie
    api.getMe()
      .then((res) => {
        setCurrentUser(res.user);
      })
      .catch(() => {
        setCurrentUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setCurrentUser(null);
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--bg-page)',
        color: 'var(--text-secondary)',
        fontFamily: 'var(--font-sans)',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <img src="/acme-hrms-logo.png" alt="ACME HRMS" style={{ height: 40 }} />
          <span>Initializing ACME HRMS...</span>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginView onLoginSuccess={(user) => setCurrentUser(user)} />;
  }

  return (
    <div className="app-sidebar-layout">
      {/* Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        onLogout={handleLogout}
        user={currentUser}
      />

      {/* Main Content Area */}
      <div className="main-wrapper">
        <Topbar
          user={currentUser}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onLogout={handleLogout}
          onNavigateProfile={() => setActiveTab('profile')}
          searchTerm={searchTerm}
          onSearchChange={(val) => {
            setSearchTerm(val);
            if (activeTab !== 'employees') setActiveTab('employees');
          }}
        />

        <main className="content-container">
          {activeTab === 'dashboard' && (
            <DashboardPage
              onNavigateTab={setActiveTab}
            />
          )}

          {activeTab === 'employees' && (
            <EmployeesPage initialSearch={searchTerm} />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsPage />
          )}

          {activeTab === 'profile' && (
            <ProfilePage
              user={currentUser}
              onLogout={handleLogout}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
