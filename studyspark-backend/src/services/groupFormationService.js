// Rabie: Group formation and refresh service
import sequelize from '../config/db.js';
import { Op } from 'sequelize';
import User from '../models/userModel.js';
import StudyGroup from '../models/StudyGroup.js';
import StudyGroupMember from '../models/StudyGroupMember.js';
import GroupRefreshEvent from '../models/GroupRefreshEvent.js';
import { buildAggregatedFeatures } from './studyGroupFeatureAggregator.js';
import { predict } from './mlService.js';

function topicFromItem(item) {
  if (!item) return null;
  const s = ('' + item).toLowerCase();
  if (s.startsWith('topic:')) return s.split(':')[1] || null;
  return s;
}

function bandForSkill(x) {
  const v = Number(x);
  if (!isFinite(v)) return { label: 'Unknown', slug: 'unknown' };
  if (v < 0.4) return { label: 'Low Score', slug: 'low-score' };
  if (v < 0.7) return { label: 'Medium Score', slug: 'medium-score' };
  return { label: 'High Score', slug: 'high-score' };
}

async function computeUserTopicSignals(userId, topic) {
  const item = `topic:${topic}`;
  const agg = await buildAggregatedFeatures({ userId, item });
  const n = agg?.context?.normalized || {};
  const weights = agg?.context?.weights || {};
  // Skill: emphasize quizzes; interest: emphasize interests & courses; availability: as-is
  const skill = Number((n.quizzes ?? 0.5).toFixed(3));
  const interest = Number(((0.6 * (n.interests ?? 0.5)) + (0.4 * (n.courses ?? 0.5))).toFixed(3));
  const availability = Number((n.availability ?? 0.5).toFixed(3));
  return { userId, skill, interest, availability, weights, normalized: n };
}

function interleaveBalanced(sortedHighToLow, size) {
  // Split into two halves and interleave elements to balance groups
  const mid = Math.ceil(sortedHighToLow.length / 2);
  const high = sortedHighToLow.slice(0, mid);
  const low = sortedHighToLow.slice(mid).reverse();
  const mix = [];
  let i = 0, j = 0;
  while (i < high.length || j < low.length) {
    if (i < high.length) mix.push(high[i++]);
    if (j < low.length) mix.push(low[j++]);
  }
  // Chunk into groups of target size
  const groups = [];
  for (let k = 0; k < mix.length; k += size) groups.push(mix.slice(k, k + size));
  return groups;
}

export async function formGroupsForTopic({ topic, groupSize = 4, minMembers = 3, maxUsers = 100 }) {
  if (!topic) throw new Error('topic required');
  // Enforce diversity-friendly bounds: cap group size between 3 and 5
  groupSize = Math.max(3, Math.min(5, Number(groupSize) || 4));
  minMembers = Math.max(3, Math.min(groupSize, Number(minMembers) || 3));
  const t = await sequelize.transaction();
  try {
    // Pick candidate users (basic: recent users with some activity; here all users up to maxUsers)
    const users = await User.findAll({ limit: maxUsers, order: [['createdAt', 'DESC']] });
    const rows = [];
    for (const u of users) {
      const sig = await computeUserTopicSignals(u.id, topic);
      // Require some interest alignment
      if (sig.interest >= 0.55) rows.push(sig);
    }
    if (rows.length < minMembers) {
      await t.rollback();
      return { created: [], reason: 'not-enough-candidates', candidates: rows.length };
    }

    // Cluster users using ML (Structured vs Flexible) and then balance by skill within each cluster
    const clusterA = []; // structured learners
    const clusterB = []; // flexible collaborators
    for (const sig of rows) {
      // Try ML predict with weights as features; fallback to heuristic
      let cluster = null;
      try {
        const resp = await predict({ features: [sig.skill, sig.availability, sig.interest] });
        const proba = Array.isArray(resp?.probabilities) ? resp.probabilities[0] : null;
        const label = (Array.isArray(proba) ? (proba[1] >= proba[0] ? 1 : 0) : (resp?.prediction ?? 0));
        cluster = label === 0 ? 'structured' : 'flexible';
      } catch (_) {
        // Heuristic: higher availability+skill => structured
        cluster = (sig.availability + sig.skill) / 2 >= 0.55 ? 'structured' : 'flexible';
      }
      (cluster === 'structured' ? clusterA : clusterB).push(sig);
    }

    // Sort by skill desc within each cluster and interleave-balance
    clusterA.sort((a, b) => b.skill - a.skill);
    clusterB.sort((a, b) => b.skill - a.skill);
    const chunksA = interleaveBalanced(clusterA, groupSize).filter(g => g.length >= minMembers);
    const chunksB = interleaveBalanced(clusterB, groupSize).filter(g => g.length >= minMembers);

    const created = [];
    for (const chunk of chunksA) {
      const avgSkillChunk = chunk.length ? (chunk.reduce((a,b)=>a + (Number(b.skill)||0), 0) / chunk.length) : 0.5;
      const band = bandForSkill(avgSkillChunk);
      const group = await StudyGroup.create({ topic, difficulty: band.slug, scheduleSlot: null, status: 'active', cluster: 'structured' }, { transaction: t });
      for (const member of chunk) {
        await StudyGroupMember.create({ groupId: group.id, userId: member.userId, role: 'member', joinedAt: new Date() }, { transaction: t });
      }
      created.push({ id: group.id, topic, cluster: 'structured', size: chunk.length, difficulty: band.slug });
    }
    for (const chunk of chunksB) {
      const avgSkillChunk = chunk.length ? (chunk.reduce((a,b)=>a + (Number(b.skill)||0), 0) / chunk.length) : 0.5;
      const band = bandForSkill(avgSkillChunk);
      const group = await StudyGroup.create({ topic, difficulty: band.slug, scheduleSlot: null, status: 'active', cluster: 'flexible' }, { transaction: t });
      for (const member of chunk) {
        await StudyGroupMember.create({ groupId: group.id, userId: member.userId, role: 'member', joinedAt: new Date() }, { transaction: t });
      }
      created.push({ id: group.id, topic, cluster: 'flexible', size: chunk.length, difficulty: band.slug });
    }

    await t.commit();
    return { created };
  } catch (err) {
    await t.rollback();
    throw err;
  }
}

export async function listGroupsWithMembers({ topic }) {
  const where = topic ? { topic, status: 'active' } : { status: 'active' };
  const groups = await StudyGroup.findAll({ where, order: [['createdAt', 'DESC']] });
  const result = [];
  for (const g of groups) {
    const members = await StudyGroupMember.findAll({ where: { groupId: g.id } });
    // Compute group average skill using a small sample for performance
    const sample = members.slice(0, 8);
    const skills = [];
    for (const m of sample) {
      try {
        const sig = await computeUserTopicSignals(m.userId, g.topic);
        const s = Number(sig?.skill ?? 0.5);
        skills.push(isNaN(s) ? 0.5 : s);
      } catch (_) {
        skills.push(0.5);
      }
    }
  const avgSkill = skills.length ? (skills.reduce((a,b)=>a+b,0) / skills.length) : 0.5;
  const band = bandForSkill(avgSkill);
    // Fine-tune threshold: structured groups are a bit stricter, flexible a bit looser;
    // if difficulty present, adjust: advanced stricter, beginner looser
    let delta = 0.10;
    const cluster = g.cluster || null;
    if (cluster === 'structured') delta = 0.08;
    else if (cluster === 'flexible') delta = 0.12;
    const difficulty = g.difficulty || null;
    if (difficulty) {
      const d = ('' + difficulty).toLowerCase();
      if (d.includes('advanced') || d.includes('hard')) delta -= 0.05; // stricter
      if (d.includes('beginner') || d.includes('easy')) delta += 0.05; // looser
    }
    delta = Math.max(0.02, Math.min(0.2, delta));
    const recommendedMinSkill = Math.max(0, Math.min(1, Number((avgSkill - delta).toFixed(3))));
    const groupJson = g.toJSON();
    groupJson.name = `${g.topic} - ${band.label}`;
    result.push({
      group: groupJson,
      members: members.map(m => m.toJSON()),
      metrics: { avgSkill: Number(avgSkill.toFixed(3)), recommendedMinSkill, memberCount: members.length }
    });
  }
  return result;
}

export async function refreshGroupsForTopic({ topic, groupSize = 4, minMembers = 3, maxUsers = 100, trigger = 'manual' }) {
  if (!topic) throw new Error('topic required');
  // Enforce bounds
  groupSize = Math.max(3, Math.min(5, Number(groupSize) || 4));
  minMembers = Math.max(3, Math.min(groupSize, Number(minMembers) || 3));
  const before = await listGroupsWithMembers({ topic });
  // New strategy: keep existing active groups; form additional groups if enough candidates
  const formed = await formGroupsForTopic({ topic, groupSize, minMembers, maxUsers });
  const after = await listGroupsWithMembers({ topic });
  await GroupRefreshEvent.create({ trigger, topic, beforeSnapshot: before, afterSnapshot: after });
  return { before, after, formed };
}

/**
 * Rebalance by moving one member from the highest-average group to the lowest-average group
 * if it reduces the overall imbalance and respects size constraints [3,5].
 */
export async function rebalanceForTopic({ topic, cluster = null }) {
  if (!topic) throw new Error('topic required');
  const where = cluster ? { topic, status: 'active', cluster } : { topic, status: 'active' };
  const groups = await StudyGroup.findAll({ where, order: [['createdAt','ASC']] });
  if (groups.length < 2) return { moved: false, reason: 'not-enough-groups' };

  const profile = [];
  for (const g of groups) {
    const members = await StudyGroupMember.findAll({ where: { groupId: g.id } });
    const skills = [];
    for (const m of members) {
      try {
        const sig = await computeUserTopicSignals(m.userId, g.topic);
        skills.push(Number(sig?.skill ?? 0.5));
      } catch { skills.push(0.5); }
    }
    const avg = skills.length ? skills.reduce((a,b)=>a+b,0)/skills.length : 0.5;
    profile.push({ group: g, members, skills, avg });
  }

  // Identify extremes
  profile.sort((a,b)=>a.avg - b.avg);
  const low = profile[0];
  const high = profile[profile.length - 1];
  if (!low || !high || low.group.id === high.group.id) return { moved: false, reason: 'insufficient-variance' };

  // Respect size constraints
  if (high.members.length <= 3) return { moved: false, reason: 'donor-too-small' };
  if (low.members.length >= 5) return { moved: false, reason: 'receiver-too-large' };

  // Choose candidate in donor (highest skill to bring low up) and ensure improvement
  let bestIdx = -1;
  let bestDelta = 0;
  for (let i = 0; i < high.members.length; i++) {
    const s = Number(high.skills[i] ?? 0.5);
    // Hypothetical new avgs after move
    const highNewAvg = (high.avg * high.members.length - s) / (high.members.length - 1);
    const lowNewAvg = (low.avg * low.members.length + s) / (low.members.length + 1);
    // Objective: reduce spread between groups
    const beforeSpread = high.avg - low.avg;
    const afterSpread = highNewAvg - lowNewAvg;
    const delta = beforeSpread - afterSpread; // positive is improvement
    if (delta > bestDelta) { bestDelta = delta; bestIdx = i; }
  }

  if (bestIdx < 0 || bestDelta <= 0) return { moved: false, reason: 'no-beneficial-move' };

  // Apply the move
  const memberToMove = high.members[bestIdx];
  await StudyGroupMember.update(
    { groupId: low.group.id },
    { where: { id: memberToMove.id } }
  );

  return {
    moved: true,
    fromGroupId: high.group.id,
    toGroupId: low.group.id,
    userId: memberToMove.userId,
    improvement: Number(bestDelta.toFixed(3))
  };
}

export default { formGroupsForTopic, listGroupsWithMembers, refreshGroupsForTopic, rebalanceForTopic };
