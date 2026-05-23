export const moodLabel = (m) => {
  if (m >= 4.5) return 'Excellent';
  if (m >= 3.5) return 'Good';
  if (m >= 2.5) return 'Neutral';
  if (m >= 1.5) return 'Low';
  return 'Very Low';
};

export const moodColor = (m) => {
  if (m >= 4.5) return '#10b981';
  if (m >= 3.5) return '#84cc16';
  if (m >= 2.5) return '#f59e0b';
  if (m >= 1.5) return '#f97316';
  return '#ef4444';
};

export const emotionColors = {
  anxiety: '#f87171', fear: '#fb923c', worry: '#fbbf24',
  tension: '#a78bfa', anguish: '#f472b6', agony: '#e11d48',
  shock: '#60a5fa', suffering: '#c084fc',
};
