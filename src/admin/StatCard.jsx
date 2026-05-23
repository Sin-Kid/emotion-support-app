import React from 'react';

const StatCard = ({ icon, label, value, sub, color }) => (
  <div style={{
    background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
    borderRadius: 16, padding: '20px 24px', flex: 1, minWidth: 160,
    border: `1px solid ${color}33`, position: 'relative', overflow: 'hidden',
  }}>
    <div style={{ position: 'absolute', top: -10, right: -10, fontSize: 60, opacity: 0.07 }}>{icon}</div>
    <div style={{ fontSize: 28, marginBottom: 4 }}>{icon}</div>
    <div style={{ fontSize: 32, fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
    <div style={{ fontSize: 13, color: '#a5b4fc', marginTop: 4 }}>{label}</div>
    {sub && <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>{sub}</div>}
  </div>
);

export default StatCard;
