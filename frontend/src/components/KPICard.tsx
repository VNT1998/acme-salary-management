import React from 'react';

interface KPICardProps {
  title: string;
  value: string | null;
  subtitle?: string;
  icon?: React.ReactNode;
}

export const KPICard: React.FC<KPICardProps> = ({ title, value, subtitle, icon }) => {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>{title}</span>
        {icon && <div style={{ color: 'var(--primary)' }}>{icon}</div>}
      </div>

      <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
        {value !== null ? value : '—'}
      </div>

      {subtitle && (
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{subtitle}</span>
      )}
    </div>
  );
};
