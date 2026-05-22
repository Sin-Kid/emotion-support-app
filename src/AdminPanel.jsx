import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';

const API_URL = '';

const moodLabel = (m) => {
  if (m >= 4.5) return 'Excellent';
  if (m >= 3.5) return 'Good';
  if (m >= 2.5) return 'Neutral';
  if (m >= 1.5) return 'Low';
  return 'Very Low';
};

const moodColor = (m) => {
  if (m >= 4.5) return '#10b981';
  if (m >= 3.5) return '#84cc16';
  if (m >= 2.5) return '#f59e0b';
  if (m >= 1.5) return '#f97316';
  return '#ef4444';
};

const emotionColors = {
  anxiety: '#f87171', fear: '#fb923c', worry: '#fbbf24',
  tension: '#a78bfa', anguish: '#f472b6', agony: '#e11d48',
  shock: '#60a5fa', suffering: '#c084fc',
};

// ──────────────────────────────────────────────
// Stat Card
// ──────────────────────────────────────────────
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

// ──────────────────────────────────────────────
// Patient Row
// ──────────────────────────────────────────────
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

// ──────────────────────────────────────────────
// Patient Detail Drawer
// ──────────────────────────────────────────────
const PatientDrawer = ({ patientId, token, onClose }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!patientId) return;
    setLoading(true);
    fetch(`/api/admin/patients/${patientId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [patientId, token]);

  const moodChartData = data?.checkins?.slice(0, 14).reverse().map(c => ({
    date: new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    mood: c.mood,
  })) || [];

  const emotionRadarData = data?.surveys?.[0]?.analysis_data?.emotionalScores
    ? Object.entries(data.surveys[0].analysis_data.emotionalScores).map(([k, v]) => ({
        emotion: k.charAt(0).toUpperCase() + k.slice(1),
        score: v,
      }))
    : [];

  return (
    <div style={{
      position: 'fixed', right: 0, top: 0, bottom: 0, width: 480,
      background: '#0f0d1e', borderLeft: '1px solid #1e1b4b',
      overflowY: 'auto', zIndex: 100, padding: 28,
      boxShadow: '-8px 0 40px rgba(0,0,0,0.5)',
      animation: 'slideIn 0.25s ease',
    }}>
      <style>{`@keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h3 style={{ margin: 0, color: '#e0e7ff', fontSize: 18, fontWeight: 700 }}>Patient Detail</h3>
        <button
          onClick={onClose}
          style={{
            background: '#1e1b4b', border: 'none', color: '#a5b4fc',
            borderRadius: 8, padding: '6px 14px', cursor: 'pointer', fontSize: 14,
          }}
        >✕ Close</button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', color: '#6366f1', paddingTop: 80 }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>⟳</div>
          <div style={{ color: '#a5b4fc' }}>Loading patient data…</div>
        </div>
      ) : data ? (
        <>
          {/* Patient header */}
          <div style={{
            background: 'linear-gradient(135deg, #1e1b4b, #312e81)',
            borderRadius: 12, padding: 20, marginBottom: 24,
            border: '1px solid #3730a3',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
              <div style={{
                width: 52, height: 52, borderRadius: '50%',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22, fontWeight: 800, color: '#fff',
              }}>
                {data.patient.username.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#e0e7ff' }}>{data.patient.username}</div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>
                  Joined {new Date(data.patient.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 16 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#a5b4fc' }}>{data.surveys.length}</div>
                <div style={{ fontSize: 11, color: '#6b7280' }}>Surveys</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#60a5fa' }}>{data.checkins.length}</div>
                <div style={{ fontSize: 11, color: '#6b7280' }}>Check-ins</div>
              </div>
            </div>
          </div>

          {/* Mood chart */}
          {moodChartData.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <h4 style={{ color: '#a5b4fc', fontSize: 13, fontWeight: 600, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
                Mood Trend
              </h4>
              <div style={{ background: '#1a1730', borderRadius: 12, padding: 16 }}>
                <ResponsiveContainer width="100%" height={160}>
                  <LineChart data={moodChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e1b4b" />
                    <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 10 }} />
                    <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fill: '#6b7280', fontSize: 10 }} />
                    <Tooltip
                      contentStyle={{ background: '#0f0d1e', border: '1px solid #3730a3', borderRadius: 8 }}
                      labelStyle={{ color: '#a5b4fc' }}
                      itemStyle={{ color: '#10b981' }}
                    />
                    <Line type="monotone" dataKey="mood" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Emotion radar */}
          {emotionRadarData.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <h4 style={{ color: '#a5b4fc', fontSize: 13, fontWeight: 600, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
                Latest Emotional Profile
              </h4>
              <div style={{ background: '#1a1730', borderRadius: 12, padding: 16 }}>
                <ResponsiveContainer width="100%" height={220}>
                  <RadarChart data={emotionRadarData}>
                    <PolarGrid stroke="#1e1b4b" />
                    <PolarAngleAxis dataKey="emotion" tick={{ fill: '#6b7280', fontSize: 10 }} />
                    <PolarRadiusAxis tick={{ fill: '#4b5563', fontSize: 9 }} domain={[0, 3]} />
                    <Radar name="Score" dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Survey history */}
          {data.surveys.length > 0 && (
            <div>
              <h4 style={{ color: '#a5b4fc', fontSize: 13, fontWeight: 600, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
                Survey History ({data.surveys.length})
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {data.surveys.map((s, i) => (
                  <div key={s.id} style={{
                    background: '#1a1730', borderRadius: 10, padding: '12px 16px',
                    border: '1px solid #1e1b4b',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ color: '#a5b4fc', fontSize: 12, fontWeight: 600 }}>
                        Survey #{data.surveys.length - i}
                      </span>
                      <span style={{ color: '#4b5563', fontSize: 11 }}>
                        {new Date(s.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {s.identified_problems?.length > 0 && (
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {s.identified_problems.map(p => (
                          <span key={p} style={{
                            background: `${emotionColors[p] || '#6366f1'}22`,
                            color: emotionColors[p] || '#a5b4fc',
                            border: `1px solid ${emotionColors[p] || '#6366f1'}44`,
                            borderRadius: 10, padding: '2px 8px', fontSize: 11,
                          }}>{p}</span>
                        ))}
                      </div>
                    )}
                    {s.analysis_data?.assessment && (
                      <div style={{ color: '#6b7280', fontSize: 11, marginTop: 6, lineHeight: 1.5 }}
                        dangerouslySetInnerHTML={{ __html: s.analysis_data.assessment.replace(/\*\*(.*?)\*\*/g, '<b style="color:#a5b4fc">$1</b>') }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.surveys.length === 0 && data.checkins.length === 0 && (
            <div style={{ color: '#4b5563', textAlign: 'center', paddingTop: 40 }}>
              No data recorded yet for this patient.
            </div>
          )}
        </>
      ) : (
        <div style={{ color: '#ef4444', textAlign: 'center', paddingTop: 80 }}>
          Failed to load patient data.
        </div>
      )}
    </div>
  );
};

// ──────────────────────────────────────────────
// AdminPanel (main export)
// ──────────────────────────────────────────────
const AdminPanel = ({ token, onLogout }) => {
  const [stats, setStats] = useState(null);
  const [patients, setPatients] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'patients'

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const r = await fetch('/api/admin/stats', { headers: { Authorization: `Bearer ${token}` } });
      const d = await r.json();
      setStats(d);
    } catch (e) { console.error(e); }
    finally { setStatsLoading(false); }
  }, [token]);

  const fetchPatients = useCallback(async (q = '') => {
    setLoading(true);
    try {
      const r = await fetch(`/api/admin/patients?search=${encodeURIComponent(q)}&limit=50`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const d = await r.json();
      setPatients(d.patients || []);
      setTotal(d.total || 0);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => {
    fetchStats();
    fetchPatients();
  }, [fetchStats, fetchPatients]);

  useEffect(() => {
    const timer = setTimeout(() => fetchPatients(search), 400);
    return () => clearTimeout(timer);
  }, [search, fetchPatients]);

  const handleExportCSV = () => {
    if (!patients.length) return;
    const headers = ['ID', 'Username', 'Total Surveys', 'Total Checkins', 'Avg Mood', 'Dominant Emotions', 'Last Activity'];
    const rows = patients.map(p => [
      p.id, p.username, p.total_surveys, p.total_checkins,
      parseFloat(p.avg_mood || 0).toFixed(2),
      (p.dominant_emotions || []).join('; '),
      p.last_activity ? new Date(p.last_activity).toLocaleDateString() : 'Never',
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'mindcare_patients.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  // Emotion distribution chart data
  const emotionBarData = stats?.emotionDistribution
    ? Object.entries(stats.emotionDistribution)
        .sort(([, a], [, b]) => b - a)
        .map(([k, v]) => ({ name: k.charAt(0).toUpperCase() + k.slice(1), score: v, fill: emotionColors[k] || '#6366f1' }))
    : [];

  const moodTrendData = stats?.moodTrend?.map(d => ({
    date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    'Avg Mood': parseFloat(d.avg_mood),
    'Check-ins': parseInt(d.count),
  })) || [];

  return (
    <div style={{
      minHeight: '100vh', background: '#0a0818', color: '#e0e7ff',
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
    }}>
      {/* Header */}
      <header style={{
        background: 'linear-gradient(90deg, #0f0d1e 0%, #1a1730 100%)',
        borderBottom: '1px solid #1e1b4b', padding: '0 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 64, position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18,
          }}>🧠</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16, color: '#e0e7ff' }}>MindCare Admin</div>
            <div style={{ fontSize: 11, color: '#6b7280' }}>Patient Monitoring Dashboard</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            background: '#1e1b4b', borderRadius: 20, padding: '4px 12px',
            fontSize: 12, color: '#a5b4fc', border: '1px solid #3730a3',
          }}>
            🔴 Live
          </div>
          <button
            onClick={onLogout}
            style={{
              background: 'transparent', border: '1px solid #3730a3',
              color: '#a5b4fc', borderRadius: 8, padding: '6px 16px',
              cursor: 'pointer', fontSize: 13, fontWeight: 600,
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#1e1b4b'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            Sign Out
          </button>
        </div>
      </header>

      <div style={{ padding: '32px', maxWidth: 1400, margin: '0 auto' }}>
        {/* Tab nav */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 32 }}>
          {[{ key: 'overview', label: '📊 Overview' }, { key: 'patients', label: '👥 Patients' }].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                background: activeTab === tab.key
                  ? 'linear-gradient(135deg, #6366f1, #4f46e5)'
                  : '#1a1730',
                border: activeTab === tab.key ? 'none' : '1px solid #1e1b4b',
                color: activeTab === tab.key ? '#fff' : '#a5b4fc',
                borderRadius: 10, padding: '10px 24px', cursor: 'pointer',
                fontWeight: 600, fontSize: 14, transition: 'all 0.2s',
              }}
            >{tab.label}</button>
          ))}
        </div>

        {/* ── OVERVIEW TAB ── */}
        {activeTab === 'overview' && (
          <>
            {/* Stat cards */}
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 32 }}>
              <StatCard icon="👥" label="Total Patients" value={statsLoading ? '…' : stats?.totalPatients ?? 0} color="#6366f1" />
              <StatCard icon="📋" label="Surveys Submitted" value={statsLoading ? '…' : stats?.totalSurveys ?? 0} color="#8b5cf6" />
              <StatCard icon="📅" label="Daily Check-ins" value={statsLoading ? '…' : stats?.totalCheckins ?? 0} color="#60a5fa" />
              <StatCard
                icon="😊"
                label="Avg Mood Score"
                value={statsLoading ? '…' : (stats?.avgMood ? stats.avgMood.toFixed(1) : '—')}
                sub={stats?.avgMood ? moodLabel(stats.avgMood) : ''}
                color={stats?.avgMood ? moodColor(stats.avgMood) : '#6b7280'}
              />
              <StatCard icon="⚡" label="Active This Week" value={statsLoading ? '…' : stats?.activeUsersThisWeek ?? 0} color="#10b981" />
            </div>

            {/* Charts row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
              {/* Emotion distribution */}
              <div style={{
                background: 'linear-gradient(135deg, #1a1730, #0f0d1e)',
                borderRadius: 16, padding: 24, border: '1px solid #1e1b4b',
              }}>
                <h3 style={{ margin: '0 0 20px', fontSize: 15, fontWeight: 700, color: '#e0e7ff' }}>
                  Emotion Distribution (All Patients)
                </h3>
                {emotionBarData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={emotionBarData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e1b4b" />
                      <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 11 }} />
                      <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} />
                      <Tooltip
                        contentStyle={{ background: '#0f0d1e', border: '1px solid #3730a3', borderRadius: 8 }}
                        labelStyle={{ color: '#a5b4fc' }}
                        cursor={{ fill: 'rgba(99,102,241,0.1)' }}
                      />
                      <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                        {emotionBarData.map((entry, i) => (
                          <rect key={i} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ color: '#4b5563', textAlign: 'center', paddingTop: 80 }}>
                    No survey data yet
                  </div>
                )}
              </div>

              {/* Mood trend */}
              <div style={{
                background: 'linear-gradient(135deg, #1a1730, #0f0d1e)',
                borderRadius: 16, padding: 24, border: '1px solid #1e1b4b',
              }}>
                <h3 style={{ margin: '0 0 20px', fontSize: 15, fontWeight: 700, color: '#e0e7ff' }}>
                  Platform Mood Trend (30 Days)
                </h3>
                {moodTrendData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={240}>
                    <LineChart data={moodTrendData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e1b4b" />
                      <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 10 }} />
                      <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fill: '#6b7280', fontSize: 11 }} />
                      <Tooltip
                        contentStyle={{ background: '#0f0d1e', border: '1px solid #3730a3', borderRadius: 8 }}
                        labelStyle={{ color: '#a5b4fc' }}
                      />
                      <Legend wrapperStyle={{ color: '#6b7280', fontSize: 12 }} />
                      <Line type="monotone" dataKey="Avg Mood" stroke="#10b981" strokeWidth={2} dot={{ r: 3, fill: '#10b981' }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ color: '#4b5563', textAlign: 'center', paddingTop: 80 }}>
                    No mood check-in data yet
                  </div>
                )}
              </div>
            </div>

            {/* Recent patients preview */}
            <div style={{
              background: 'linear-gradient(135deg, #1a1730, #0f0d1e)',
              borderRadius: 16, padding: 24, border: '1px solid #1e1b4b',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#e0e7ff' }}>
                  Recently Active Patients
                </h3>
                <button
                  onClick={() => setActiveTab('patients')}
                  style={{
                    background: 'transparent', border: '1px solid #3730a3',
                    color: '#a5b4fc', borderRadius: 8, padding: '6px 14px',
                    cursor: 'pointer', fontSize: 12,
                  }}
                >View All →</button>
              </div>
              {patients.slice(0, 5).map(p => (
                <div key={p.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 0', borderBottom: '1px solid #1e1b4b',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%',
                      background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 13, fontWeight: 700, color: '#fff',
                    }}>
                      {p.username.charAt(0).toUpperCase()}
                    </div>
                    <span style={{ color: '#e0e7ff', fontSize: 14 }}>{p.username}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                    <span style={{ color: '#6b7280', fontSize: 12 }}>{p.total_surveys} surveys</span>
                    {p.avg_mood > 0 && (
                      <span style={{ color: moodColor(parseFloat(p.avg_mood)), fontWeight: 700, fontSize: 14 }}>
                        {parseFloat(p.avg_mood).toFixed(1)} ★
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {patients.length === 0 && !loading && (
                <div style={{ color: '#4b5563', textAlign: 'center', padding: '24px 0' }}>
                  No patients registered yet.
                </div>
              )}
            </div>
          </>
        )}

        {/* ── PATIENTS TAB ── */}
        {activeTab === 'patients' && (
          <div style={{
            background: 'linear-gradient(135deg, #1a1730, #0f0d1e)',
            borderRadius: 16, border: '1px solid #1e1b4b', overflow: 'hidden',
          }}>
            {/* Toolbar */}
            <div style={{
              padding: '20px 24px', display: 'flex', gap: 12,
              alignItems: 'center', borderBottom: '1px solid #1e1b4b',
              flexWrap: 'wrap',
            }}>
              <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
                <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }}>🔍</span>
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search patients by username…"
                  style={{
                    width: '100%', background: '#0f0d1e', border: '1px solid #1e1b4b',
                    borderRadius: 10, padding: '10px 12px 10px 36px', color: '#e0e7ff',
                    fontSize: 14, outline: 'none', boxSizing: 'border-box',
                  }}
                />
              </div>
              <div style={{ color: '#4b5563', fontSize: 13 }}>
                {total} patient{total !== 1 ? 's' : ''}
              </div>
              <button
                onClick={handleExportCSV}
                style={{
                  background: 'linear-gradient(135deg, #065f46, #047857)',
                  border: 'none', color: '#fff', borderRadius: 10,
                  padding: '10px 20px', cursor: 'pointer', fontWeight: 600, fontSize: 13,
                  display: 'flex', alignItems: 'center', gap: 6,
                }}
              >
                ⬇ Export CSV
              </button>
              <button
                onClick={() => fetchPatients(search)}
                style={{
                  background: '#1e1b4b', border: '1px solid #3730a3',
                  color: '#a5b4fc', borderRadius: 10, padding: '10px 16px',
                  cursor: 'pointer', fontSize: 13,
                }}
              >↻ Refresh</button>
            </div>

            {/* Table */}
            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: '#6366f1' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>⟳</div>
                <div style={{ color: '#a5b4fc' }}>Loading patients…</div>
              </div>
            ) : patients.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: '#4b5563' }}>
                {search ? `No patients found matching "${search}"` : 'No patients registered yet.'}
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'auto' }}>
                  <thead>
                    <tr style={{ background: '#0f0d1e', borderBottom: '2px solid #1e1b4b' }}>
                      {['Patient', 'Surveys', 'Check-ins', 'Avg Mood', 'Dominant Emotions', 'Last Active', ''].map(h => (
                        <th key={h} style={{
                          padding: '12px 16px', textAlign: h === 'Patient' ? 'left' : 'center',
                          fontSize: 11, fontWeight: 700, color: '#4b5563',
                          textTransform: 'uppercase', letterSpacing: 1, whiteSpace: 'nowrap',
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {patients.map(p => (
                      <PatientRow
                        key={p.id}
                        patient={p}
                        onClick={setSelectedPatient}
                        selected={selectedPatient?.id === p.id}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Patient detail drawer */}
      {selectedPatient && (
        <PatientDrawer
          patientId={selectedPatient.id}
          token={token}
          onClose={() => setSelectedPatient(null)}
        />
      )}
    </div>
  );
};

export default AdminPanel;
