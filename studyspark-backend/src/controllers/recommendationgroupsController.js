// Rabie: Controller that uses mlService to request study-group recommendations from the AI service
import { predict, predictBatch } from '../services/mlService.js';
import { buildAggregatedFeatures } from '../services/studyGroupFeatureAggregator.js';
import StudyGroup from '../models/StudyGroup.js';
import StudyGroupMember from '../models/StudyGroupMember.js';
import { Op } from 'sequelize';
import RecommendationFeedback from '../models/RecommendationFeedback.js';
import User from '../models/userModel.js';

/**
 * Create study group recommendations for a single item/user
 */
export async function recommendGroups(req, res) {
  try {
    const userId = req.user?.id;
    const { item } = req.body; // item could be document id, topic, etc.

    if (!item) return res.status(400).json({ error: 'Missing item to base recommendations on.' });

  // prepare payload for ML service using the aggregator (Phase 1)
  const agg = await buildAggregatedFeatures({ userId, item });
  const payload = { userId, item, features: agg.features, context: agg.context };

    // If the user is already a member of a group for this subject, return that group as the top recommendation.
    const hintTopic = agg?.context?.hintTopic || null;
    if (userId && hintTopic) {
      // Find active groups for this topic
      const topicGroups = await StudyGroup.findAll({ where: { topic: hintTopic, status: 'active' }, order: [['updatedAt','DESC']] });
      if (topicGroups && topicGroups.length) {
        const ids = topicGroups.map(g => g.id);
        const mem = await StudyGroupMember.findAll({ where: { userId, groupId: { [Op.in]: ids } } });
        if (mem && mem.length) {
          // Pick the most recently updated group among the ones the user belongs to
          const memberGroupIds = new Set(mem.map(m => m.groupId));
          const myGroup = topicGroups.find(g => memberGroupIds.has(g.id)) || topicGroups[0];
          // Compute stats from a small sample of members
          const members = await StudyGroupMember.findAll({ where: { groupId: myGroup.id } });
          const sample = members.slice(0, 6);
          const skills=[]; const interests=[]; const avails=[];
          for (const m of sample) {
            try {
              const a = await buildAggregatedFeatures({ userId: m.userId, item: `topic:${hintTopic}` });
              const s = Number(a?.context?.normalized?.quizzes ?? 0.5);
              const iv = Number(a?.context?.normalized?.interests ?? 0.5);
              const av = Number(a?.context?.normalized?.availability ?? 0.5);
              skills.push(isNaN(s) ? 0.5 : s);
              interests.push(isNaN(iv) ? 0.5 : iv);
              avails.push(isNaN(av) ? 0.5 : av);
            } catch { skills.push(0.5); interests.push(0.5); avails.push(0.5); }
          }
          const avgSkill = skills.length ? skills.reduce((a,b)=>a+b,0)/skills.length : 0.5;
          const avgInterest = interests.length ? interests.reduce((a,b)=>a+b,0)/interests.length : 0.5;
          const avgAvail = avails.length ? avails.reduce((a,b)=>a+b,0)/avails.length : 0.5;
          const userSkill = Number(agg?.context?.normalized?.quizzes ?? 0.5);
          const userAvail = Number(agg?.context?.normalized?.availability ?? 0.5);
          const userInterest = Number(agg?.context?.normalized?.interests ?? 0.5);
          const diff = Math.abs(userSkill - avgSkill);
          const size = members.length;
          const sizeScore = size <= 1 ? 0.3 : size <= 3 ? 0.8 : size <= 5 ? 1.0 : 0.8;
          const w1 = Number(process.env.REC_W_SKILL || 0.4);
          const w2 = Number(process.env.REC_W_SIZE || 0.2);
          const w3 = Number(process.env.REC_W_ACTIVITY || 0.15);
          const w4 = Number(process.env.REC_W_INTEREST || 0.15);
          const w5 = Number(process.env.REC_W_AVAIL || 0.1);
          const skillProximity = 1 - Math.min(1, diff);
          const activity = Math.max(0, Math.min(1, (new Date(myGroup.updatedAt || myGroup.createdAt).getTime() / Date.now())));
          const interestAlignScore = 1 - Math.abs(userInterest - avgInterest);
          const availAlignScore = 1 - Math.abs(userAvail - avgAvail);
          let blended = w1*skillProximity + w2*sizeScore + w3*activity + w4*interestAlignScore + w5*availAlignScore;
          blended = Math.max(0, Math.min(1, blended));
          const labelFromAvg = (avg) => (avg < 0.4 ? 'Low Score' : (avg < 0.7 ? 'Medium Score' : 'High Score'));
          const persona = (myGroup.cluster === 'structured')
            ? 'Structured Learners: prefer organized, scheduled sessions with clear agendas'
            : 'Flexible Collaborators: prefer adaptive, interest-driven sessions and discussion-based work';
          const displayName = `${myGroup.topic} - ${labelFromAvg(avgSkill)}`;
          const recommendedMinSkill = Math.max(0, Math.min(1, Number((avgSkill - 0.1).toFixed(3))));

          const reasons = [
            'You are already a member of this group',
            `topic match: ${hintTopic}`,
            `your skill vs group: ${userSkill.toFixed(2)} vs ${avgSkill.toFixed(2)}`,
            `cluster: ${myGroup.cluster || 'n/a'} — ${persona}`,
            `availability alignment: you ${userAvail.toFixed(2)} vs group ${avgAvail.toFixed(2)}`,
            `interest alignment: you ${userInterest.toFixed(2)} vs group ${avgInterest.toFixed(2)}`,
            `target to maintain: skill >= ${recommendedMinSkill.toFixed(2)}`
          ];

          const top = {
            groupId: myGroup.id,
            groupName: displayName,
            topic: myGroup.topic,
            score: blended,
            label: 'Current group',
            cluster: myGroup.cluster || null,
            probabilities: [Math.min(0.99, blended), Math.max(0.01, 1 - Math.min(0.99, blended))],
            userSkill: Number(userSkill.toFixed(3)),
            groupAvgSkill: Number(avgSkill.toFixed(3)),
            recommendedMinSkill,
            groupSize: size,
            userAvailability: Number(userAvail.toFixed(3)),
            groupAvgAvailability: Number(avgAvail.toFixed(3)),
            userInterest: Number(userInterest.toFixed(3)),
            groupAvgInterest: Number(avgInterest.toFixed(3)),
            confidence: Math.min(0.99, blended),
            confidenceMargin: 0.0,
            alreadyMember: true
          };
          const recommendations = [{ groupId: myGroup.id, displayName, topic: myGroup.topic, score: blended, reasons }];
          return res.json({ success: true, recommendations, top, debug: { context: agg.context, note: 'returned current membership group' } });
        }
      }
    }

    // Try calling the ML service with the natural payload. Some local
    // StudyGroupAi implementations expect a `features` or `rows` key. If the
    // ML service rejects the payload, retry with a small fallback features
    // vector so developers can demo the end-to-end flow locally.
    let mlResp;
    try {
      mlResp = await predict(payload);
    } catch (err) {
      console.error('❌ mlService.predict failed for payload, attempting fallback:', err.response?.data || err.message || err);
      try {
        // Fallback: use derived features from aggregated signals instead of [1,1,1]
        const n = agg?.context?.normalized || {};
        const derived = [
          Number(n.quizzes ?? 0.6),
          Number(n.availability ?? 0.6),
          Number(n.interests ?? 0.6)
        ].map(v => isNaN(v) ? 0.6 : Math.max(0, Math.min(1, v)));
        mlResp = await predict({ features: derived });
      } catch (err2) {
        console.error('❌ mlService.predict fallback also failed, switching to offline heuristic:', err2.response?.data || err2.message || err2);
        // OFFLINE MODE: proceed without ML; provide a neutral probability and mark offline
        mlResp = { prediction: 1, probabilities: [[0.5, 0.5]], offline: true };
      }
    }

    // Adapt ML response into recommendations/top when possible
    const ml = mlResp || {};
    let recommendations = [];
    let top = null;
    if (Array.isArray(ml.recommendations)) {
      recommendations = ml.recommendations;
      top = ml.top || null;
  } else if (typeof ml.prediction !== 'undefined' || Array.isArray(ml.probabilities)) {
      // Map ML response to real groups when possible using the hint topic
  let probs = Array.isArray(ml.probabilities) && ml.probabilities.length ? ml.probabilities[0] : [0.5, 0.5];
  // Normalize and avoid degenerate 1.0 by slight clamping for display consistency
  const sum = probs.reduce((a,b)=>a+(Number(b)||0),0) || 1;
  probs = probs.map(p => Math.max(0, Math.min(0.99, (Number(p)||0)/sum)));
      const score = Math.max(...probs);
  const label = score >= 0.85 ? 'Excellent' : score >= 0.7 ? 'Good' : score >= 0.5 ? 'Fair' : 'Low';
  const hintTopic = agg?.context?.hintTopic || null;
      let groups = [];
      if (hintTopic) {
        // Determine predicted cluster label from ML (if online); if offline, do not constrain by cluster
        const labelIdx = (Array.isArray(probs) && probs.length) ? (probs[1] >= probs[0] ? 1 : 0) : (ml.prediction ?? 0);
        let predictedCluster = labelIdx === 0 ? 'structured' : 'flexible';
        if (ml.offline) predictedCluster = null;
        const where = { topic: hintTopic, status: 'active' };
        if (predictedCluster) where.cluster = predictedCluster;
        groups = await StudyGroup.findAll({ where, order: [['createdAt','DESC']], limit: 3 });
      }
  if (groups.length > 0) {
        // Compute a simple per-group score adjustment based on user's skill vs group's average skill
        const userSkill = Number(agg?.context?.normalized?.quizzes ?? 0.5);
        const userAvail = Number(agg?.context?.normalized?.availability ?? 0.5);
        const userInterest = Number(agg?.context?.normalized?.interests ?? 0.5);
        const items = [];
  const labelFromAvg = (avg) => (avg < 0.4 ? 'Low Score' : (avg < 0.7 ? 'Medium Score' : 'High Score'));
  for (const g of groups) {
          const members = await StudyGroupMember.findAll({ where: { groupId: g.id } });
          // Limit to first few members for performance
          const sample = members.slice(0, 6);
          const skills = [];
          const interests = [];
          const avails = [];
          for (const m of sample) {
            try {
              const a = await buildAggregatedFeatures({ userId: m.userId, item: `topic:${hintTopic}` });
              const s = Number(a?.context?.normalized?.quizzes ?? 0.5);
              const iv = Number(a?.context?.normalized?.interests ?? 0.5);
              const av = Number(a?.context?.normalized?.availability ?? 0.5);
              skills.push(isNaN(s) ? 0.5 : s);
              interests.push(isNaN(iv) ? 0.5 : iv);
              avails.push(isNaN(av) ? 0.5 : av);
            } catch (e) {
              skills.push(0.5);
              interests.push(0.5);
              avails.push(0.5);
            }
          }
          const avgSkill = skills.length ? skills.reduce((a,b)=>a+b,0)/skills.length : 0.5;
          const avgInterest = interests.length ? interests.reduce((a,b)=>a+b,0)/interests.length : 0.5;
          const avgAvail = avails.length ? avails.reduce((a,b)=>a+b,0)/avails.length : 0.5;
          const diff = Math.abs(userSkill - avgSkill); // 0..1, smaller is better
          // size factor: modest boost for 3-5 members
          const size = members.length;
          const sizeFactor = size <= 1 ? 0.9 : size <= 3 ? 1.02 : size <= 5 ? 1.05 : 1.0;
          // final per-group score: base score adjusted by skill proximity and size
          // Blended scoring with interpretable signals; weights from env with safe defaults
          const w1 = Number(process.env.REC_W_SKILL || 0.4);
          const w2 = Number(process.env.REC_W_SIZE || 0.2);
          const w3 = Number(process.env.REC_W_ACTIVITY || 0.15);
          const w4 = Number(process.env.REC_W_INTEREST || 0.15);
          const w5 = Number(process.env.REC_W_AVAIL || 0.1);
          const skillProximity = 1 - Math.min(1, diff);
          const activity = Math.max(0, Math.min(1, (new Date(g.updatedAt || g.createdAt).getTime() / Date.now()))); // coarse proxy
          const interestAlignScore = 1 - Math.abs(userInterest - avgInterest);
          const availAlignScore = 1 - Math.abs(userAvail - avgAvail);
          const sizeScore = size <= 1 ? 0.3 : size <= 3 ? 0.8 : size <= 5 ? 1.0 : 0.8;
          let blended = w1*skillProximity + w2*sizeScore + w3*activity + w4*interestAlignScore + w5*availAlignScore;
          blended = Math.max(0, Math.min(1, blended));
          const clusterMatch = (g.cluster && top?.cluster) ? (g.cluster === top.cluster ? 1.0 : 0.9) : 1.0;
          const groupScore = Math.max(0, Math.min(1, blended * clusterMatch));
          const recommendedMinSkill = Math.max(0, Math.min(1, Number((avgSkill - 0.1).toFixed(3))));
          // Hard filter: if user's skill is below group avg, do not include in recommendations
          if (userSkill < avgSkill) continue;
          // Soft filter: only keep groups within +/- 0.1 skill difference; relax to 0.15 if none remain
          const withinTight = diff <= 0.10;
          // Explanation tailored to cluster personas
          const persona = (g.cluster === 'structured')
            ? 'Structured Learners: prefer organized, scheduled sessions with clear agendas'
            : 'Flexible Collaborators: prefer adaptive, interest-driven sessions and discussion-based work';

          // Confidence rationale based on margin between top two probabilities
          let confidencePct = Math.round(score * 100);
          if (confidencePct >= 100) confidencePct = 99;
          const sorted = probs.slice().sort((a,b)=>b-a);
          const margin = Number(((sorted[0] - (sorted[1] ?? 0)).toFixed(2)));

          // Additional fit factors
          const availAlign = 1 - Math.abs(userAvail - avgAvail);
          const interestAlign = 1 - Math.abs(userInterest - avgInterest);

          const displayName = `${g.topic} - ${labelFromAvg(avgSkill)}`;
          items.push({
            groupId: g.id,
            displayName,
            topic: g.topic,
            score: groupScore,
            reasons: [
              `topic match: ${hintTopic}`,
              `your skill vs group: ${(userSkill).toFixed(2)} vs ${(avgSkill).toFixed(2)}`,
              `cluster: ${g.cluster} — ${persona}`,
              `confidence: ${confidencePct}% (margin ${Math.round(margin*100)}%)`,
              `availability alignment: you ${(userAvail).toFixed(2)} vs group ${(avgAvail).toFixed(2)}`,
              `interest alignment: you ${(userInterest).toFixed(2)} vs group ${(avgInterest).toFixed(2)}`,
              `target to join: skill >= ${recommendedMinSkill.toFixed(2)}`
            ],
            _meta: { avgSkill, avgInterest, avgAvail, recommendedMinSkill, size, diff }
          });
        }
        // Apply closeness filter then diversify with simple MMR to avoid near-duplicates
        let filtered = items.filter(it => it._meta.diff <= 0.10);
        if (filtered.length === 0) filtered = items.filter(it => it._meta.diff <= 0.15);
        // MMR: greedy selection based on score and dissimilarity in avgSkill/size/cluster
        const mmrLambda = Number(process.env.REC_MMR_LAMBDA || 0.75);
        const similarity = (a,b) => {
          const skillSim = 1 - Math.min(1, Math.abs(a._meta.avgSkill - b._meta.avgSkill));
          const sizeSim = 1 - Math.min(1, Math.abs((a._meta.size||0)-(b._meta.size||0))/10);
          const clusterSim = (a.cluster === b.cluster) ? 1 : 0;
          return 0.5*skillSim + 0.3*sizeSim + 0.2*clusterSim;
        };
        const selected = [];
        const K = Math.min(3, filtered.length);
        const pool = filtered.slice().sort((a,b)=>b.score - a.score);
        while (selected.length < K && pool.length) {
          let bestIdx = 0; let bestVal = -Infinity;
          for (let i=0; i<pool.length; i++) {
            const cand = pool[i];
            const simToSel = selected.length ? Math.max(...selected.map(s => similarity(cand, s))) : 0;
            const mmr = mmrLambda * cand.score - (1 - mmrLambda) * simToSel;
            if (mmr > bestVal) { bestVal = mmr; bestIdx = i; }
          }
          selected.push(pool.splice(bestIdx,1)[0]);
        }
        recommendations = selected.map(s => ({ groupId: s.groupId, displayName: s.displayName, topic: s.topic, score: s.score, reasons: s.reasons }));
        const best = selected[0];
        const lowConfidence = (best?.score ?? 0) < Number(process.env.REC_LOWCONF_THRESH || 0.55);
        if (best) top = {
          groupId: best.groupId,
          groupName: best.displayName,
          topic: best.topic,
          score: best.score,
          label,
          cluster: (ml.offline ? (groups.find(g=>g.id===best.groupId)?.cluster || null) : (labelIdx === 0 ? 'structured' : 'flexible')),
          probabilities: probs,
          userSkill: Number(userSkill.toFixed(3)),
          groupAvgSkill: Number(best._meta?.avgSkill?.toFixed?.(3) ?? best._meta?.avgSkill ?? 0.5),
          recommendedMinSkill: Number((best._meta?.avgSkill - 0.1).toFixed(3)),
          groupSize: best._meta?.size ?? null,
          userAvailability: Number(userAvail.toFixed(3)),
          groupAvgAvailability: Number((best._meta?.avgAvail ?? 0.5).toFixed?.(3) ?? 0.5),
          userInterest: Number(userInterest.toFixed(3)),
          groupAvgInterest: Number((best._meta?.avgInterest ?? 0.5).toFixed?.(3) ?? 0.5),
          confidence: Math.min(0.99, score),
          confidenceMargin: Number(((Math.max(...probs) - (probs.length>1? probs.sort((a,b)=>b-a)[1] : 0))).toFixed(3))
        };
        if (!best) {
          return res.json({ success: true, recommendations: [], top: null, noGroupsAvailable: true, debug: { context: agg.context, raw: ml, lowConfidence: false } });
        }
      } else {
        // No groups exist yet for this topic — signal none available, let UI offer create
        return res.json({ success: true, recommendations: [], top: null, noGroupsAvailable: true, debug: { context: agg.context, raw: ml, lowConfidence: false } });
      }
    }

    return res.json({ success: true, recommendations, top, debug: { context: agg.context, raw: ml, lowConfidence: (top?.score ?? 0) < Number(process.env.REC_LOWCONF_THRESH || 0.55) } });
  } catch (err) {
    console.error('❌ Error in recommendGroups:', err.message || err);
    return res.status(500).json({ error: 'Server error' });
  }
}

/**
 * Create study group recommendations for multiple items (batch)
 */
export async function recommendGroupsBatch(req, res) {
  try {
    const userId = req.user?.id;
    const { items } = req.body; // array of items

    if (!Array.isArray(items) || items.length === 0)
      return res.status(400).json({ error: 'Missing items array for batch recommendation.' });

  const aggRows = await Promise.all(items.map(item => buildAggregatedFeatures({ userId, item })));
  const rows = aggRows.map(a => a.features);
  const payload = { userId, items, rows, contexts: aggRows.map(a => a.context) };
    let mlResp;
    try {
      mlResp = await predictBatch(payload);
    } catch (err) {
      console.error('❌ mlService.predictBatch failed for payload, attempting fallback rows:', err.response?.data || err.message || err);
      try {
        // Fallback rows derived from normalized signals to avoid degenerate 100% confidence
        const fallbackRows = (payload.contexts || []).map((c) => {
          const n = c?.normalized || {};
          const f = [
            Number(n.quizzes ?? 0.6),
            Number(n.availability ?? 0.6),
            Number(n.interests ?? 0.6)
          ].map(v => isNaN(v) ? 0.6 : Math.max(0, Math.min(1, v)));
          return f;
        });
        mlResp = await predictBatch({ rows: fallbackRows });
      } catch (err2) {
        console.error('❌ mlService.predictBatch fallback also failed:', err2.response?.data || err2.message || err2);
        throw err2;
      }
    }

    // Batch adaptation
    const ml = mlResp || {};
    let recommendations = [];
    let probabilitiesOut = [];
    if (Array.isArray(ml.recommendations)) {
      recommendations = ml.recommendations;
      probabilitiesOut = Array.isArray(ml.probabilities) ? ml.probabilities : [];
    } else if (Array.isArray(ml.predictions) || Array.isArray(ml.probabilities)) {
  const probs = Array.isArray(ml.probabilities) ? ml.probabilities : [];
  const hintTopics = (payload.contexts || []).map(c => c?.hintTopic || null);
      const out = [];
  for (let i = 0; i < probs.length; i++) {
        const row = (probs[i] || []).slice();
        // Clamp and renormalize to avoid 100%
        const eps = 0.01;
        const rsum = row.reduce((a,b)=>a+(Number(b)||0),0) || 1;
        let norm = row.map(p => Math.max(eps, Math.min(1-eps, (Number(p)||0)/rsum)));
        const nsum = norm.reduce((a,b)=>a+b,0) || 1; norm = norm.map(p => p/nsum);
        const scRaw = Math.max(...norm);
        const sc = Math.min(0.99, scRaw);
        const hint = hintTopics[i];

        let best = null;
        // Prefer current membership if user already in a group for this topic
        if (userId && hint) {
          const topicGroups = await StudyGroup.findAll({ where: { topic: hint, status: 'active' }, order: [['updatedAt','DESC']] });
          if (topicGroups && topicGroups.length) {
            const ids = topicGroups.map(g => g.id);
            const mem = await StudyGroupMember.findAll({ where: { userId, groupId: { [Op.in]: ids } } });
            if (mem && mem.length) {
              const memberIds = new Set(mem.map(m => m.groupId));
              const myGroup = topicGroups.find(g => memberIds.has(g.id)) || topicGroups[0];
              best = { groupId: myGroup.id, displayName: `${myGroup.topic} - current group`, topic: myGroup.topic, score: sc, reasons: ['You are already a member of this group', `topic match: ${hint}`] };
            }
          }
        }
        if (hint) {
          // Choose best group for this topic and predicted cluster
          const labelIdx = (norm[1] >= norm[0] ? 1 : 0);
          const predictedCluster = labelIdx === 0 ? 'structured' : 'flexible';
          const groups = await StudyGroup.findAll({ where: { topic: hint, status: 'active', cluster: predictedCluster }, order: [['createdAt','DESC']], limit: 3 });
          const userId = req.user?.id;
          const userAgg = await buildAggregatedFeatures({ userId, item: `topic:${hint}` });
          const userSkill = Number(userAgg?.context?.normalized?.quizzes ?? 0.5);
          const userAvail = Number(userAgg?.context?.normalized?.availability ?? 0.5);
          const userInterest = Number(userAgg?.context?.normalized?.interests ?? 0.5);
          const labelFromAvg = (avg) => (avg < 0.4 ? 'Low Score' : (avg < 0.7 ? 'Medium Score' : 'High Score'));
          const candidates = [];
          for (const g of groups) {
            const members = await StudyGroupMember.findAll({ where: { groupId: g.id } });
            const sample = members.slice(0, 6);
            let skills=[], interests=[], avails=[];
            for (const m of sample) {
              try {
                const a = await buildAggregatedFeatures({ userId: m.userId, item: `topic:${hint}` });
                skills.push(Number(a?.context?.normalized?.quizzes ?? 0.5));
                interests.push(Number(a?.context?.normalized?.interests ?? 0.5));
                avails.push(Number(a?.context?.normalized?.availability ?? 0.5));
              } catch { skills.push(0.5); interests.push(0.5); avails.push(0.5); }
            }
            const avgSkill = skills.length ? skills.reduce((a,b)=>a+b,0)/skills.length : 0.5;
            const avgInterest = interests.length ? interests.reduce((a,b)=>a+b,0)/interests.length : 0.5;
            const avgAvail = avails.length ? avails.reduce((a,b)=>a+b,0)/avails.length : 0.5;
            const size = members.length;
            const sizeFactor = size <= 1 ? 0.9 : size <= 3 ? 1.02 : size <= 5 ? 1.05 : 1.0;
            const diff = Math.abs(userSkill - avgSkill);
            const gscore = Math.max(0, Math.min(1, sc * (1 - 0.6 * diff) * sizeFactor));
            const recommendedMinSkill = Math.max(0, Math.min(1, Number((avgSkill - 0.1).toFixed(3))));
            const persona = (g.cluster === 'structured')
              ? 'Structured Learners: prefer organized, scheduled sessions with clear agendas'
              : 'Flexible Collaborators: prefer adaptive, interest-driven sessions and discussion-based work';
            const sorted = norm.slice().sort((a,b)=>b-a);
            const margin = Number(((sorted[0] - (sorted[1] ?? 0)).toFixed(2)));
            const confPct = Math.min(99, Math.round(sc*100));
            const displayName = `${g.topic} - ${labelFromAvg(avgSkill)}`;
            candidates.push({
              g, gscore, avgSkill, avgInterest, avgAvail, size, recommendedMinSkill,
              displayName,
              reasons: [
                `topic match: ${hint}`,
                `your skill vs group: ${userSkill.toFixed(2)} vs ${avgSkill.toFixed(2)}`,
                `cluster: ${g.cluster} — ${persona}`,
                `confidence: ${confPct}% (margin ${Math.round(margin*100)}%)`,
                `availability alignment: you ${userAvail.toFixed(2)} vs group ${avgAvail.toFixed(2)}`,
                `interest alignment: you ${userInterest.toFixed(2)} vs group ${avgInterest.toFixed(2)}`,
                `target to join: skill >= ${recommendedMinSkill.toFixed(2)}`
              ]
            });
          }
          candidates.sort((a,b)=>b.gscore - a.gscore);
          if (candidates[0]) {
            const c = candidates[0];
            best = { groupId: c.g.id, displayName: c.displayName, topic: c.g.topic, score: c.gscore, reasons: c.reasons };
          }
        }
        if (best) {
          out.push(best);
        } else {
          out.push({ groupId: null, score: sc, reasons: [], topic: hint, noGroupsAvailable: true });
        }
      }
      recommendations = out;
      probabilitiesOut = probs;
    }
    // Ensure probabilities always present for frontend compatibility
    if (!Array.isArray(probabilitiesOut) || probabilitiesOut.length === 0) {
      probabilitiesOut = (recommendations || []).map(r => [r.score ?? 0.5, Math.max(0, 1 - (r.score ?? 0.5))]);
    }
  return res.json({ success: true, recommendations, probabilities: probabilitiesOut, debug: { contexts: payload.contexts, raw: ml, notes: 'probabilities and contexts returned for diagnostics' } });
  } catch (err) {
    console.error('❌ Error in recommendGroupsBatch:', err.message || err);
    return res.status(500).json({ error: 'Server error' });
  }
}

/**
 * Simple health proxy to the ML service
 */
export async function mlHealth(req, res) {
  try {
    const { default: ml } = await import('../services/mlService.js');
    const h = await ml.health();
    return res.json({ success: true, ml: h });
  } catch (err) {
    console.error('❌ mlHealth error:', err.message || err);
    return res.status(500).json({ error: 'ML healthcheck failed' });
  }
}

/**
 * Capture simple user feedback signals for recommendations (impression/click/join/dismiss)
 */
export async function feedback(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const { groupId, subject, action, meta } = req.body || {};
    if (!action || !['impression','click','join','dismiss'].includes(action)) {
      return res.status(400).json({ error: 'Invalid action' });
    }
    const row = await RecommendationFeedback.create({ userId, groupId: groupId ?? null, subject: subject ?? null, action, meta: meta ?? null });
    return res.json({ success: true, id: row.id });
  } catch (err) {
    console.error('❌ feedback error:', err.message || err);
    return res.status(500).json({ error: 'Server error' });
  }
}
