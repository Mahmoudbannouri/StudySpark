// Rabie: Lightweight scheduler to refresh groups periodically without extra deps
import { refreshGroupsForTopic } from '../services/groupFormationService.js';

function parseTopics(val) {
  return (val || '').split(',').map(s => s.trim()).filter(Boolean);
}

export function startGroupRefreshJob() {
  const enabled = (process.env.REFRESH_ENABLED || 'false').toLowerCase() === 'true';
  if (!enabled) return () => {};
  const topics = parseTopics(process.env.REFRESH_TOPICS || 'calculus');
  const minutes = Number(process.env.REFRESH_INTERVAL_MINUTES || 720); // default 12h
  const intervalMs = Math.max(5, minutes) * 60 * 1000;

  console.log(`⏱️  Group refresh job enabled. Topics=[${topics.join(', ')}], every ${minutes} min`);

  const tick = async () => {
    for (const topic of topics) {
      try {
        console.log(`🔁 Refreshing groups for topic=${topic} ...`);
        await refreshGroupsForTopic({ topic, trigger: 'schedule' });
        console.log(`✅ Refresh complete for topic=${topic}`);
      } catch (err) {
        console.error(`❌ Refresh failed for topic=${topic}:`, err.message || err);
      }
    }
  };

  // Kick off immediately then on interval
  tick();
  const handle = setInterval(tick, intervalMs);
  return () => clearInterval(handle);
}

export default { startGroupRefreshJob };
