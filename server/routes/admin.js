const express = require('express');
const pool = require('../db');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/admin/stats — platform-wide statistics
router.get('/stats', requireAdmin, async (req, res) => {
  try {
    const [totalPatients, totalSurveys, totalCheckins, avgMood, recentActivity] = await Promise.all([
      pool.query(`SELECT COUNT(*) FROM users WHERE role = 'patient'`),
      pool.query(`SELECT COUNT(*) FROM survey_results`),
      pool.query(`SELECT COUNT(*) FROM daily_checkins`),
      pool.query(`SELECT ROUND(AVG(mood)::numeric, 2) as avg_mood FROM daily_checkins`),
      pool.query(`
        SELECT COUNT(DISTINCT user_id) as active_users
        FROM (
          SELECT user_id FROM survey_results WHERE created_at >= NOW() - INTERVAL '7 days'
          UNION
          SELECT user_id FROM daily_checkins WHERE created_at >= NOW() - INTERVAL '7 days'
        ) active
      `),
    ]);

    // Emotion distribution across all surveys
    const emotionQuery = await pool.query(`
      SELECT
        analysis_data->'emotionalScores' as scores
      FROM survey_results
    `);

    const emotionTotals = {};
    emotionQuery.rows.forEach(row => {
      const scores = row.scores || {};
      Object.entries(scores).forEach(([emotion, score]) => {
        emotionTotals[emotion] = (emotionTotals[emotion] || 0) + Number(score);
      });
    });

    // Mood trend over last 30 days
    const moodTrend = await pool.query(`
      SELECT
        DATE(created_at) as date,
        ROUND(AVG(mood)::numeric, 2) as avg_mood,
        COUNT(*) as count
      FROM daily_checkins
      WHERE created_at >= NOW() - INTERVAL '30 days'
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `);

    res.json({
      totalPatients: parseInt(totalPatients.rows[0].count),
      totalSurveys: parseInt(totalSurveys.rows[0].count),
      totalCheckins: parseInt(totalCheckins.rows[0].count),
      avgMood: parseFloat(avgMood.rows[0].avg_mood) || 0,
      activeUsersThisWeek: parseInt(recentActivity.rows[0].active_users),
      emotionDistribution: emotionTotals,
      moodTrend: moodTrend.rows,
    });
  } catch (err) {
    console.error('Admin stats error:', err.message);
    res.status(500).json({ error: 'Failed to fetch statistics.' });
  }
});

// GET /api/admin/patients — list all patients with summary
router.get('/patients', requireAdmin, async (req, res) => {
  const { search = '', limit = 50, offset = 0 } = req.query;

  try {
    const patients = await pool.query(`
      SELECT
        u.id,
        u.username,
        u.created_at,
        u.last_login,
        COUNT(DISTINCT sr.id) as total_surveys,
        COUNT(DISTINCT dc.id) as total_checkins,
        ROUND(AVG(dc.mood)::numeric, 2) as avg_mood,
        MAX(GREATEST(
          COALESCE(sr.created_at, '1970-01-01'),
          COALESCE(dc.created_at, '1970-01-01')
        )) as last_activity,
        (
          SELECT analysis_data->'identifiedProblems'
          FROM survey_results
          WHERE user_id = u.id
          ORDER BY created_at DESC
          LIMIT 1
        ) as dominant_emotions
      FROM users u
      LEFT JOIN survey_results sr ON sr.user_id = u.id
      LEFT JOIN daily_checkins dc ON dc.user_id = u.id
      WHERE u.role = 'patient'
        AND ($1 = '' OR u.username ILIKE '%' || $1 || '%')
      GROUP BY u.id
      ORDER BY last_activity DESC NULLS LAST
      LIMIT $2 OFFSET $3
    `, [search, limit, offset]);

    const total = await pool.query(
      `SELECT COUNT(*) FROM users WHERE role = 'patient' AND ($1 = '' OR username ILIKE '%' || $1 || '%')`,
      [search]
    );

    res.json({
      patients: patients.rows,
      total: parseInt(total.rows[0].count),
    });
  } catch (err) {
    console.error('Admin patients error:', err.message);
    res.status(500).json({ error: 'Failed to fetch patients.' });
  }
});

// GET /api/admin/patients/:id — full patient detail
router.get('/patients/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const user = await pool.query(
      `SELECT id, username, created_at, last_login FROM users WHERE id = $1 AND role = 'patient'`,
      [id]
    );
    if (user.rows.length === 0) {
      return res.status(404).json({ error: 'Patient not found.' });
    }

    const surveys = await pool.query(
      `SELECT id, analysis_data, identified_problems, created_at
       FROM survey_results WHERE user_id = $1 ORDER BY created_at DESC`,
      [id]
    );
    const checkins = await pool.query(
      `SELECT id, mood, created_at FROM daily_checkins WHERE user_id = $1 ORDER BY created_at DESC`,
      [id]
    );

    res.json({
      patient: user.rows[0],
      surveys: surveys.rows,
      checkins: checkins.rows,
    });
  } catch (err) {
    console.error('Admin patient detail error:', err.message);
    res.status(500).json({ error: 'Failed to fetch patient details.' });
  }
});

module.exports = router;
