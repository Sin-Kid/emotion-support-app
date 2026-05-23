import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import StatCard from './StatCard';
import PatientRow from './PatientRow';
import PatientDrawer from './PatientDrawer';
import { moodLabel, moodColor, emotionColors } from './utils';
import { supabase } from '../supabaseClient';

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
      // 1. Total Patients count
      const { count: patientCount, error: err1 } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'patient');

      // 2. Total Surveys count
      const { count: surveyCount, error: err2 } = await supabase
        .from('survey_results')
        .select('*', { count: 'exact', head: true });

      // 3. Total Checkins count
      const { count: checkinCount, error: err3 } = await supabase
        .from('daily_checkins')
        .select('*', { count: 'exact', head: true });

      // 4. Avg Mood & Mood Trend over last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data: allCheckins, error: err4 } = await supabase
        .from('daily_checkins')
        .select('mood, created_at');

      if (err1 || err2 || err3 || err4) {
        throw new Error('Supabase stats fetch error');
      }

      // Compute avg mood
      let avgMood = 0;
      if (allCheckins && allCheckins.length > 0) {
        const sum = allCheckins.reduce((acc, c) => acc + c.mood, 0);
        avgMood = parseFloat((sum / allCheckins.length).toFixed(2));
      }

      // Compute mood trend over 30 days (grouped by date)
      const trendMap = {};
      allCheckins.forEach(c => {
        const dateStr = new Date(c.created_at).toISOString().split('T')[0];
        if (new Date(c.created_at) >= thirtyDaysAgo) {
          if (!trendMap[dateStr]) {
            trendMap[dateStr] = { sum: 0, count: 0 };
          }
          trendMap[dateStr].sum += c.mood;
          trendMap[dateStr].count += 1;
        }
      });
      const moodTrend = Object.entries(trendMap)
        .map(([date, val]) => ({
          date: date,
          avg_mood: (val.sum / val.count).toFixed(2),
          count: val.count
        }))
        .sort((a, b) => new Date(a.date) - new Date(b.date));

      // 5. Active users this week
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: recentSurveys, error: err5 } = await supabase
        .from('survey_results')
        .select('user_id')
        .gte('created_at', sevenDaysAgo.toISOString());

      const { data: recentCheckins, error: err6 } = await supabase
        .from('daily_checkins')
        .select('user_id')
        .gte('created_at', sevenDaysAgo.toISOString());

      const activeUsersSet = new Set();
      (recentSurveys || []).forEach(s => activeUsersSet.add(s.user_id));
      (recentCheckins || []).forEach(c => activeUsersSet.add(c.user_id));
      const activeUsersThisWeek = activeUsersSet.size;

      // 6. Emotion distribution
      const { data: surveys, error: err7 } = await supabase
        .from('survey_results')
        .select('analysis_data');

      const emotionTotals = {};
      (surveys || []).forEach(row => {
        const scores = row.analysis_data?.emotionalScores || {};
        Object.entries(scores).forEach(([emotion, score]) => {
          emotionTotals[emotion] = (emotionTotals[emotion] || 0) + Number(score);
        });
      });

      setStats({
        totalPatients: patientCount || 0,
        totalSurveys: surveyCount || 0,
        totalCheckins: checkinCount || 0,
        avgMood,
        activeUsersThisWeek,
        emotionDistribution: emotionTotals,
        moodTrend,
      });
    } catch (e) {
      console.error('fetchStats error:', e);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const fetchPatients = useCallback(async (q = '') => {
    setLoading(true);
    try {
      // 1. Fetch patient profiles
      let query = supabase
        .from('profiles')
        .select('*')
        .eq('role', 'patient');
      
      if (q) {
        query = query.ilike('username', `%${q}%`);
      }

      const { data: patientProfiles, error: profileErr } = await query;
      if (profileErr) throw profileErr;

      if (!patientProfiles || patientProfiles.length === 0) {
        setPatients([]);
        setTotal(0);
        return;
      }

      // 2. Fetch all survey results and daily checkins for these patients to aggregate
      const patientIds = patientProfiles.map(p => p.id);

      const { data: allSurveys, error: surveyErr } = await supabase
        .from('survey_results')
        .select('*')
        .in('user_id', patientIds);

      const { data: allCheckins, error: checkinErr } = await supabase
        .from('daily_checkins')
        .select('*')
        .in('user_id', patientIds);

      if (surveyErr) throw surveyErr;
      if (checkinErr) throw checkinErr;

      // Group surveys and checkins by user_id
      const surveysByPatient = {};
      const checkinsByPatient = {};
      patientIds.forEach(id => {
        surveysByPatient[id] = [];
        checkinsByPatient[id] = [];
      });

      (allSurveys || []).forEach(s => {
        surveysByPatient[s.user_id]?.push(s);
      });
      (allCheckins || []).forEach(c => {
        checkinsByPatient[c.user_id]?.push(c);
      });

      // 3. Aggregate patient summary metrics
      const aggregatedPatients = patientProfiles.map(p => {
        const surveys = surveysByPatient[p.id] || [];
        const checkins = checkinsByPatient[p.id] || [];

        // Sort surveys & checkins by created_at DESC
        surveys.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        checkins.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        // total surveys and checkins
        const total_surveys = surveys.length;
        const total_checkins = checkins.length;

        // avg mood
        let avg_mood = 0;
        if (checkins.length > 0) {
          const sum = checkins.reduce((acc, c) => acc + c.mood, 0);
          avg_mood = (sum / checkins.length).toFixed(2);
        }

        // dominant emotions from latest survey
        const dominant_emotions = surveys.length > 0 ? (surveys[0].analysis_data?.identifiedProblems || []) : [];

        // last activity
        const latestSurveyTime = surveys.length > 0 ? new Date(surveys[0].created_at) : new Date(0);
        const latestCheckinTime = checkins.length > 0 ? new Date(checkins[0].created_at) : new Date(0);
        const greatestTime = latestSurveyTime > latestCheckinTime ? latestSurveyTime : latestCheckinTime;
        const last_activity = greatestTime.getTime() > 0 ? greatestTime.toISOString() : null;

        return {
          id: p.id,
          username: p.username,
          created_at: p.created_at,
          last_login: p.last_login,
          total_surveys,
          total_checkins,
          avg_mood,
          dominant_emotions,
          last_activity
        };
      });

      // Sort by last_activity DESC (nulls last)
      aggregatedPatients.sort((a, b) => {
        if (!a.last_activity) return 1;
        if (!b.last_activity) return -1;
        return new Date(b.last_activity) - new Date(a.last_activity);
      });

      setPatients(aggregatedPatients);
      setTotal(aggregatedPatients.length);
    } catch (e) {
      console.error('fetchPatients error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

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
