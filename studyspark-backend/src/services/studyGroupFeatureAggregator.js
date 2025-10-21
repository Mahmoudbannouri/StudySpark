// Rabie: StudyGroup Feature Aggregator (Phase 1)
// Gathers signals (courses, availability, interests, quizzes, summaries) from DB when available,
// falls back to small static defaults, normalizes and applies weights, and emits a compact feature vector
// and a descriptive context object. No DB schema changes required.

import Summary from '../models/Summary.js';
import Quiz from '../models/Quiz.js';
import Document from '../models/Document.js';

// Weights (env overrideable)
const W = {
  courses: Number(process.env.W_COURSES ?? 0.25),
  availability: Number(process.env.W_AVAILABILITY ?? 0.20),
  interests: Number(process.env.W_INTERESTS ?? 0.20),
  quizzes: Number(process.env.W_QUIZZES ?? 0.25),
  summaries: Number(process.env.W_SUMMARIES ?? 0.10),
};

// Small static defaults (kept inline)
const STATIC_DEFAULTS = {
  courses: ['math', 'physics'],
  availability: ['Mon 18:00-20:00', 'Sat 10:00-12:00'],
  interests: ['calculus', 'algebra'],
  quizzes: { calculus: 0.6, algebra: 0.4 },
  summaries: [
    'Basics of calculus: limits, derivatives, integrals.',
    'Linear algebra fundamentals: vectors, matrices.'
  ],
};

function clamp01(x) { return Math.max(0, Math.min(1, x)); }

// Normalize helpers (very light heuristics to produce [0,1] signals)
function normalizeCourses(courses, hintTopic) {
  // score up if any course matches the hint/topic
  if (!courses?.length) return 0.3;
  const match = hintTopic ? courses.some(c => (''+c).toLowerCase().includes((''+hintTopic).toLowerCase())) : false;
  return clamp01(match ? 0.9 : 0.6);
}

function normalizeAvailability(slots) {
  // more slots => higher score, tiny heuristic
  const n = Array.isArray(slots) ? slots.length : 0;
  if (n === 0) return 0.4;
  if (n === 1) return 0.55;
  if (n === 2) return 0.7;
  return 0.85;
}

function normalizeInterests(interests, hintTopic) {
  if (!interests?.length) return 0.4;
  const match = hintTopic ? interests.some(t => (''+t).toLowerCase().includes((''+hintTopic).toLowerCase())) : false;
  return clamp01(match ? 0.9 : 0.6);
}

function normalizeQuizzes(topicAccuracyMap, hintTopic) {
  if (!topicAccuracyMap || typeof topicAccuracyMap !== 'object') return 0.5;
  const vals = Object.values(topicAccuracyMap).map(v => Number(v)).filter(v => !isNaN(v));
  if (vals.length === 0) return 0.5;
  const avg = vals.reduce((a,b)=>a+b,0) / vals.length; // 0..1
  // Boost a bit if hint topic is strong
  const hint = hintTopic && topicAccuracyMap[hintTopic] ? Number(topicAccuracyMap[hintTopic]) : null;
  const boosted = hint != null ? (0.7 * avg + 0.3 * hint) : avg;
  return clamp01(boosted);
}

function normalizeSummaries(summaries, hintTopic) {
  if (!summaries?.length) return 0.4;
  const joined = summaries.join(' ').toLowerCase();
  const hit = hintTopic ? joined.includes((''+hintTopic).toLowerCase()) : false;
  // crude proxy for “semantic” overlap
  return clamp01(hit ? 0.85 : 0.6);
}

function topicFromItem(item) {
  if (!item) return null;
  const s = (''+item).toLowerCase();
  // item could be `topic:calculus` or `document:123` etc.
  if (s.startsWith('topic:')) return s.split(':')[1] || null;
  return null;
}

async function fetchSignalsFromDB(userId) {
  try {
    const out = { courses: [], availability: [], interests: [], quizzes: {}, summaries: [] };
    // Derive courses from document names (very light heuristic)
    if (userId) {
      const docs = await Document.findAll({ where: { userId }, limit: 5, order: [['uploadedAt','DESC']] });
      out.courses = docs.map(d => (d.name || '').toLowerCase()).filter(Boolean);
    }
    // Summaries content / keywords
    if (userId) {
      const sums = await Summary.findAll({ where: { userId }, limit: 5, order: [['generatedAt','DESC']] });
      out.summaries = sums.map(s => (s.content || '').slice(0, 400));
      // Use keywords as interests when present
      const kw = sums.flatMap(s => Array.isArray(s.keywords) ? s.keywords : []);
      out.interests = Array.from(new Set(kw.map(k => (''+k).toLowerCase()))).slice(0, 6);
    }
    // Quiz accuracy per topic (very simple: score/totalQuestions)
    if (userId) {
      const quizzes = await Quiz.findAll({ where: { userId }, limit: 20, order: [['createdAt','DESC']] });
      const topicAcc = {};
      quizzes.forEach(q => {
        // Try to infer topic from title or doc name
        const title = (q.title || '').toLowerCase();
        let topic = 'general';
        if (title.includes('calculus')) topic = 'calculus';
        else if (title.includes('algebra')) topic = 'algebra';
        else if (title.includes('biology') || title.includes('bio ')) topic = 'biology';
        else if (title.includes('physics')) topic = 'physics';
        const total = Number(q.totalQuestions || 0);
        const score = Number(q.score || 0);
        const acc = total > 0 ? clamp01(score/total) : 0.5;
        topicAcc[topic] = topicAcc[topic] != null ? (0.5 * topicAcc[topic] + 0.5 * acc) : acc;
      });
      out.quizzes = topicAcc;
    }
    // Availability: no explicit table → leave empty for now (fallback will fill)
    return out;
  } catch (err) {
    console.error('Aggregator DB fetch error:', err.message || err);
    return { ...STATIC_DEFAULTS }; // fallback entirely on error
  }
}

export async function buildAggregatedFeatures({ userId, item }) {
  const hint = topicFromItem(item);
  const dbSignals = await fetchSignalsFromDB(userId);
  const signals = {
    courses: dbSignals.courses?.length ? dbSignals.courses : STATIC_DEFAULTS.courses,
    availability: dbSignals.availability?.length ? dbSignals.availability : STATIC_DEFAULTS.availability,
    interests: dbSignals.interests?.length ? dbSignals.interests : STATIC_DEFAULTS.interests,
    quizzes: (dbSignals.quizzes && Object.keys(dbSignals.quizzes).length) ? dbSignals.quizzes : STATIC_DEFAULTS.quizzes,
    summaries: dbSignals.summaries?.length ? dbSignals.summaries : STATIC_DEFAULTS.summaries,
  };

  // Normalize each channel to [0,1]
  const n = {
    courses: normalizeCourses(signals.courses, hint),
    availability: normalizeAvailability(signals.availability),
    interests: normalizeInterests(signals.interests, hint),
    quizzes: normalizeQuizzes(signals.quizzes, hint ?? Object.keys(signals.quizzes)[0]),
    summaries: normalizeSummaries(signals.summaries, hint),
  };

  // Weighted combination → a tiny feature vector (you can expand later)
  const scalar = clamp01(
    W.courses * n.courses +
    W.availability * n.availability +
    W.interests * n.interests +
    W.quizzes * n.quizzes +
    W.summaries * n.summaries
  );

  const features = [ Number(scalar.toFixed(3)), Number(n.quizzes.toFixed(3)), Number(n.courses.toFixed(3)) ];

  return {
    features,
    context: { signals, normalized: n, weights: W, hintTopic: hint }
  };
}

export default { buildAggregatedFeatures };
