import React from 'react';
import { Link } from 'react-router-dom';

export default function Breadcrumbs({ paths }) {
  return (
    <nav className="breadcrumbs container" style={{ padding: '10px 0', fontSize: '13px', color: 'var(--text-muted)' }}>
      <Link to="/" style={{ color: 'var(--color-accent)', textDecoration: 'none' }}>Home</Link>
      {paths.map((p, idx) => (
        <span key={idx}>
          <span style={{ margin: '0 8px' }}>/</span>
          {p.active ? (
            <span style={{ fontWeight: 'bold', color: 'var(--color-primary)' }}>{p.label}</span>
          ) : (
            <Link to={p.url} style={{ color: 'var(--color-accent)', textDecoration: 'none' }}>{p.label}</Link>
          )}
        </span>
      ))}
    </nav>
  );
}
