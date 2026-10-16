import React, { useState, useEffect } from 'react';
import { api } from './services/api';
import type { User } from './types';

import { Navbar } from './components/Navbar';
import { LoginView } from './components/LoginView';
import { EmployeesPage } from './pages/EmployeesPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import './styles/theme.css';

export const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'employees' | 'analytics'>('employees');

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
      }}>
        Initializing ACME Portal...
      </div>
    );
  }

  if (!currentUser) {
    return <LoginView onLoginSuccess={(user) => setCurrentUser(user)} />;
  }

  return (
    <div className="app-container">
      <Navbar
        user={currentUser}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={handleLogout}
      />

      <main className="main-content">
        {activeTab === 'employees' ? <EmployeesPage /> : <AnalyticsPage />}
      </main>
    </div>
  );
};

export default App;
