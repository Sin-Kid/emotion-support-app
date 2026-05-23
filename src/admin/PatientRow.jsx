import React from 'react';
import { moodLabel, moodColor, emotionColors } from './utils';

const PatientRow = ({ patient, onClick, selected }) => {
  const mood = parseFloat(patient.avg_mood) || 0;
  const emotions = patient.dominant_emotions || [];
  const lastActivity = patient.last_activity
    ? new Date(patient.last_activity).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Never';

  return (
    <tr
      onClick={() => onClick(patient)}
      style={{
        cursor: 'pointer',
        background: selected ? 'rgba(99,102,241,0.15)' : 'transparent',
        transition: 'background 0.15s',
        borderBottom: '1px solid #1e1b4b',
      }}
      onMouseEnter={e => { if (!selected) e.currentTarget.style.background = 'rgba(99,102,241,0.08)'; }}
      onMouseLeave={e => { if (!selected) e.currentTarget.style.background = 'transparent'; }}
    >
      <td style={{ padding: '12px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: 14, color: '#fff', flexShrink: 0,
          }}>
            {patient.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 600, color: '#e0e7ff', fontSize: 14 }}>{patient.username}</div>
            <div style={{ fontSize: 11, color: '#6b7280' }}>ID #{patient.id}</div>
          </div>
        </div>
      </td>
      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
        <span style={{
          background: '#312e81', borderRadius: 20, padding: '3px 12px',
          fontSize: 13, color: '#a5b4fc', fontWeight: 600,
        }}>
          {patient.total_surveys}
        </span>
      </td>
      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
        <span style={{
          background: '#1e3a5f', borderRadius: 20, padding: '3px 12px',
          fontSize: 13, color: '#60a5fa', fontWeight: 600,
        }}>
          {patient.total_checkins}
        </span>
      </td>
      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
        {mood > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <span style={{ fontSize: 16, fontWeight: 800, color: moodColor(mood) }}>{mood.toFixed(1)}</span>
            <span style={{ fontSize: 10, color: moodColor(mood), opacity: 0.8 }}>{moodLabel(mood)}</span>
          </div>
        ) : <span style={{ color: '#4b5563', fontSize: 12 }}>No data</span>}
      </td>
      <td style={{ padding: '12px 16px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, maxWidth: 200 }}>
          {emotions.slice(0, 2).map(e => (
            <span key={e} style={{
              background: `${emotionColors[e] || '#6366f1'}22`,
              color: emotionColors[e] || '#a5b4fc',
              border: `1px solid ${emotionColors[e] || '#6366f1'}44`,
              borderRadius: 12, padding: '2px 8px', fontSize: 11, fontWeight: 600,
            }}>
              {e}
            </span>
          ))}
          {emotions.length === 0 && <span style={{ color: '#4b5563', fontSize: 12 }}>—</span>}
        </div>
      </td>
      <td style={{ padding: '12px 16px', color: '#6b7280', fontSize: 12 }}>{lastActivity}</td>
      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
        <span style={{ fontSize: 16, color: '#6366f1' }}>›</span>
      </td>
    </tr>
  );
};

export default PatientRow;
