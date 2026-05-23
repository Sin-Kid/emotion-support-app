import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { moodLabel, moodColor, emotionColors } from './utils';
import { supabase } from '../supabaseClient';

const PatientDrawer = ({ patientId, token, onClose }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!patientId) return;
    setLoading(true);

    const fetchPatientDetail = async () => {
      try {
        // 1. Fetch patient profile
        const { data: patient, error: profileErr } = await supabase
          .from('profiles')
          .select('id, username, created_at, last_login')
          .eq('id', patientId)
          .eq('role', 'patient')
          .single();

        if (profileErr) throw profileErr;

        // 2. Fetch survey results
        const { data: surveys, error: surveyErr } = await supabase
          .from('survey_results')
          .select('id, analysis_data, identified_problems, created_at')
          .eq('user_id', patientId)
          .order('created_at', { ascending: false });

        if (surveyErr) throw surveyErr;

        // 3. Fetch checkins
        const { data: checkins, error: checkinErr } = await supabase
          .from('daily_checkins')
          .select('id, mood, created_at')
          .eq('user_id', patientId)
          .order('created_at', { ascending: false });

        if (checkinErr) throw checkinErr;

        setData({
          patient,
          surveys: surveys || [],
          checkins: checkins || [],
        });
      } catch (err) {
        console.error('Patient detail error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPatientDetail();
  }, [patientId]);

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

export default PatientDrawer;
