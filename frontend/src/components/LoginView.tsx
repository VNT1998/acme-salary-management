import React, { useState } from 'react';
import { Lock, Mail, AlertCircle, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';
import type { User } from '../types';

interface LoginViewProps {
  onLoginSuccess: (user: User) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await api.login(email, password);
      onLoginSuccess(data.user);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      backgroundColor: '#ffffff',
    }}>
      {/* Left Column: Login Form */}
      <div style={{
        flex: '1 1 50%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '40px 24px',
        maxWidth: '100%',
      }}>
        <div style={{ width: '100%', maxWidth: 420 }}>
          {/* Logo */}
          <div style={{ marginBottom: 36, textAlign: 'left' }}>
            <img
              src="/acme-hrms-logo.png"
              alt="ACME HRMS Logo"
              style={{ height: 46, objectFit: 'contain' }}
            />
          </div>

          {/* Heading */}
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6, letterSpacing: '-0.02em' }}>
              Welcome back
            </h1>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
              Sign in to your ACME HRMS account
            </p>
          </div>

          {error && (
            <div className="alert alert-error" style={{ marginBottom: 20 }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: 18 }}>
              <label className="form-label" style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                Email
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  className="input"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@acme.com"
                  style={{ paddingLeft: 38, height: 44, fontSize: 14, borderRadius: 8 }}
                />
                <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 14, top: 14 }} />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 18 }}>
              <label className="form-label" style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  style={{ paddingLeft: 38, paddingRight: 40, height: 44, fontSize: 14, borderRadius: 8 }}
                />
                <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 14, top: 14 }} />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: 12,
                    top: 13,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                    padding: 0,
                  }}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {/* Remember me & Forgot Password */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 24,
              fontSize: 13,
            }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: 'var(--text-secondary)' }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ accentColor: 'var(--primary)', width: 16, height: 16, borderRadius: 4 }}
                />
                <span>Remember me</span>
              </label>
              <a
                href="#forgot"
                onClick={(e) => { e.preventDefault(); alert('Please contact the ACME IT department or HR System Administrator to reset your credentials.'); }}
                style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}
              >
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{
                width: '100%',
                height: 44,
                fontSize: 15,
                fontWeight: 600,
                borderRadius: 8,
                backgroundColor: 'var(--primary)',
                boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)',
              }}
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Quick Demo Credentials */}
          <div style={{
            marginTop: 28,
            padding: '12px 16px',
            backgroundColor: 'var(--bg-subtle)',
            borderRadius: 8,
            border: '1px solid var(--border-color)',
            fontSize: 12,
            color: 'var(--text-secondary)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>
              <ShieldCheck size={14} color="var(--primary)" />
              <span>HR Administrator Access</span>
            </div>
            <div>Credentials: <code>hr@acme.test</code> / <code>AcmeAdmin2026!</code></div>
          </div>
        </div>
      </div>

      {/* Right Column: Hero Architecture Panel (Hidden on mobile) */}
      <div className="desktop-only" style={{
        flex: '1 1 50%',
        position: 'relative',
        background: 'linear-gradient(135deg, #091730 0%, #0f2b5c 50%, #173f8a 100%)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '60px 72px',
        color: '#ffffff',
      }}>
        {/* Decorative Skyscraper SVG overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.18,
          backgroundImage: `radial-gradient(circle at 70% 30%, #3b82f6 0%, transparent 60%),
            linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)`,
          backgroundSize: '100% 100%, 36px 36px, 36px 36px',
          pointerEvents: 'none',
        }} />

        {/* Hero Geometric Glow */}
        <div style={{
          position: 'absolute',
          bottom: -80,
          right: -80,
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(37,99,235,0.45) 0%, rgba(37,99,235,0) 70%)',
          filter: 'blur(40px)',
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 480 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 10px',
            borderRadius: 9999,
            backgroundColor: 'rgba(255, 255, 255, 0.12)',
            backdropFilter: 'blur(6px)',
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            marginBottom: 28,
            border: '1px solid rgba(255, 255, 255, 0.15)',
          }}>
            <span>ACME Enterprise HRMS</span>
          </div>

          <h2 style={{
            fontSize: 52,
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: '-0.03em',
            marginBottom: 24,
            color: '#ffffff',
          }}>
            People<br />
            Payroll<br />
            Progress
          </h2>

          <p style={{
            fontSize: 17,
            lineHeight: 1.6,
            color: 'rgba(255, 255, 255, 0.8)',
            fontWeight: 400,
          }}>
            Manage your team, streamline salaries, and build a better workplace with ACME HRMS.
          </p>
        </div>
      </div>
    </div>
  );
};
