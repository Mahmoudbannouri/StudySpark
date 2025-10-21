// Rabie: StudyGroup controller — join endpoint
import StudyGroup from '../models/StudyGroup.js';
import StudyGroupMember from '../models/StudyGroupMember.js';
import { buildAggregatedFeatures } from '../services/studyGroupFeatureAggregator.js';
import User from '../models/userModel.js';

export async function joinGroup(req, res) {
  try {
    const userId = req.user?.id;
    const groupId = Number(req.params.groupId);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    if (!groupId || Number.isNaN(groupId)) return res.status(400).json({ error: 'Invalid groupId' });

    const group = await StudyGroup.findByPk(groupId);
    if (!group) return res.status(404).json({ error: 'Group not found' });
    if (group.status !== 'active') return res.status(404).json({ error: 'Group is not active' });

    const existing = await StudyGroupMember.findOne({ where: { groupId, userId } });
    if (existing) return res.status(409).json({ error: 'Already a member' });

    // Enforce skill threshold: if user's estimated skill for this topic is below the group's average, block join
    const members = await StudyGroupMember.findAll({ where: { groupId } });
    if (members.length > 0 && group.topic) {
      let skillSum = 0;
      let count = 0;
      for (const m of members.slice(0, 12)) {
        try {
          const agg = await buildAggregatedFeatures({ userId: m.userId, item: `topic:${group.topic}` });
          const s = Number(agg?.context?.normalized?.quizzes ?? 0.5);
          if (!Number.isNaN(s)) { skillSum += s; count++; }
        } catch {}
      }
      const avgSkill = count ? (skillSum / count) : 0.5;
      const userAgg = await buildAggregatedFeatures({ userId, item: `topic:${group.topic}` });
      const userSkill = Number(userAgg?.context?.normalized?.quizzes ?? 0.5);
      // Rule: if strictly below average, cannot join
      if (userSkill < avgSkill) {
        return res.status(403).json({ error: `Join blocked: your estimated skill (${userSkill.toFixed(2)}) is below the group's average (${avgSkill.toFixed(2)}).` });
      }
    }

    const membership = await StudyGroupMember.create({ groupId, userId, role: 'member', joinedAt: new Date() });
    return res.json({ success: true, membership });
  } catch (err) {
    console.error('❌ joinGroup error:', err.message || err);
    return res.status(500).json({ error: 'Server error' });
  }
}

export default { joinGroup };

// Create a new group for the current user for a given topic
export async function createGroupForUser(req, res) {
  try {
    const userId = req.user?.id;
    const { topic, cluster } = req.body || {};
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    if (!topic || typeof topic !== 'string') return res.status(400).json({ error: 'topic required' });
    const group = await StudyGroup.create({ topic, difficulty: null, scheduleSlot: null, status: 'active', cluster: cluster || 'flexible' });
    const membership = await StudyGroupMember.create({ groupId: group.id, userId, role: 'member', joinedAt: new Date() });
    return res.json({ success: true, group, membership });
  } catch (err) {
    console.error('❌ createGroupForUser error:', err.message || err);
    return res.status(500).json({ error: 'Server error' });
  }
}

// List groups the current user has joined, with members and basic metrics
export async function listMyGroups(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const memberships = await StudyGroupMember.findAll({ where: { userId } });
    const groupIds = memberships.map(m => m.groupId);

    // Load user's groups if any; otherwise keep empty and still compute improvement
    const groups = groupIds.length ? await StudyGroup.findAll({ where: { id: groupIds } }) : [];

    const out = [];
    for (const g of groups) {
  const members = await StudyGroupMember.findAll({ where: { groupId: g.id } });
  // Attach light user identity for display
  const memberUsers = await User.findAll({ where: { id: members.map(m => m.userId) } });
  const userById = new Map(memberUsers.map(u => [u.id, u]));
  const membersDto = members.map(m => ({ ...m.toJSON(), user: (()=>{ const u=userById.get(m.userId); return u? { id: u.id, name: u.name, email: u.email }: undefined; })() }));
      // Compute simple metrics similar to listGroupsWithMembers
      let skills = [];
      let mySkill = null;
      for (const m of members.slice(0, 12)) {
        try {
          const agg = await buildAggregatedFeatures({ userId: m.userId, item: g.topic ? `topic:${g.topic}` : 'topic:general' });
          const s = Number(agg?.context?.normalized?.quizzes ?? 0.5);
          skills.push(isNaN(s) ? 0.5 : s);
        } catch {
          skills.push(0.5);
        }
      }
      // Compute current user's skill for this group's topic
      try {
        const myAgg = await buildAggregatedFeatures({ userId, item: g.topic ? `topic:${g.topic}` : 'topic:general' });
        const s = Number(myAgg?.context?.normalized?.quizzes ?? 0.5);
        mySkill = isNaN(s) ? null : Number(s.toFixed(3));
      } catch { mySkill = null; }
      const avgSkill = skills.length ? skills.reduce((a,b)=>a+b,0)/skills.length : 0.5;
      const recommendedMinSkill = Math.max(0, Math.min(1, Number((avgSkill - 0.1).toFixed(3))));
      const metrics = { avgSkill, recommendedMinSkill, memberCount: members.length, userSkill: mySkill, membersAvgSkill: avgSkill };

      // Provide a banded display name if none present
      const band = avgSkill < 0.4 ? 'Low Score' : (avgSkill < 0.7 ? 'Medium Score' : 'High Score');
      const groupDto = {
        id: g.id,
        topic: g.topic,
        status: g.status,
        createdAt: g.createdAt,
        updatedAt: g.updatedAt,
        cluster: g.cluster,
        name: g.name || (g.topic ? `${g.topic} - ${band}` : undefined)
      };

      out.push({ group: groupDto, members: membersDto, metrics });
    }

    // Improvement guidance: for each subject, find the best higher group the user cannot yet join and how much to improve
    // Topics: use user's group topics if any, else derive from all active groups
    let topics = Array.from(new Set(out.map(r => r.group.topic).filter(Boolean)));
    if (!topics.length) {
      const allActive = await StudyGroup.findAll({ where: { status: 'active' } });
      topics = Array.from(new Set(allActive.map(g => g.topic).filter(Boolean)));
    }
    // Fallback: if still no topics, use a default common subjects list
    if (!topics.length) {
      topics = ['algebra','biology','calculus','chemistry','computer-science','physics'];
    }

    const improvement = {};
    for (const topic of topics) {
      // User skill for topic
  let userSkillTopic = null;
      try {
        const a = await buildAggregatedFeatures({ userId, item: `topic:${topic}` });
        const s = Number(a?.context?.normalized?.quizzes ?? 0.5);
        userSkillTopic = isNaN(s) ? null : Number(s.toFixed(3));
      } catch { userSkillTopic = null; }

      // Fetch all groups for the topic
      const allTopicGroups = await StudyGroup.findAll({ where: { topic, status: 'active' } });
      const targets = [];
      for (const g of allTopicGroups) {
        const mems = await StudyGroupMember.findAll({ where: { groupId: g.id } });
        const skills = [];
        for (const m of mems.slice(0, 12)) {
          try {
            const agg = await buildAggregatedFeatures({ userId: m.userId, item: `topic:${topic}` });
            const s = Number(agg?.context?.normalized?.quizzes ?? 0.5);
            skills.push(isNaN(s) ? 0.5 : s);
          } catch { skills.push(0.5); }
        }
  const avg = skills.length ? skills.reduce((a,b)=>a+b,0)/skills.length : 0.5;
  const needed = (userSkillTopic == null) ? null : Math.max(0, Number((avg - userSkillTopic).toFixed(3)));
  // Build a friendly fallback name if none is stored on the group
  const band = avg < 0.4 ? 'Low Score' : (avg < 0.7 ? 'Medium Score' : 'High Score');
  const displayName = g.name || (topic ? `${topic} - ${band}` : `Group ${g.id}`);
  // Keep 'needed' as null if userSkill is unknown so the UI can show 'n/a'
        targets.push({
          groupId: g.id,
          name: displayName,
          avgSkill: Number(avg.toFixed(3)),
          needed,
          difficulty: g.difficulty || (band.toLowerCase().replace(' ', '-')), // e.g., 'medium-score'
          cluster: g.cluster || null
        });
      }
      // Sort by avg ascending for a ladder view
      targets.sort((a,b) => a.avgSkill - b.avgSkill);
      improvement[topic] = { currentSkill: userSkillTopic, targets };
    }

    return res.json({ success: true, groups: out, improvement });
  } catch (err) {
    console.error('❌ listMyGroups error:', err.message || err);
    return res.status(500).json({ error: 'Server error' });
  }
}
