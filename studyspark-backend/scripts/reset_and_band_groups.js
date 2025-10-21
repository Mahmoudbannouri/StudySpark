// Reset study groups and create 3 banded groups (high/avg/low) per subject
// Usage: node scripts/reset_and_band_groups.js [subjects=calculus,biology,physics]
import dotenv from 'dotenv';
dotenv.config();

import sequelize from '../src/config/db.js';
import { Op } from 'sequelize';
import User from '../src/models/userModel.js';
import StudyGroup from '../src/models/StudyGroup.js';
import StudyGroupMember from '../src/models/StudyGroupMember.js';
import Quiz from '../src/models/Quiz.js';

function clamp01(x){ return Math.max(0, Math.min(1, x)); }

async function computeUserSkill(userId, subject){
  // Derive skill from quizzes titled with subject: score/total average
  const quizzes = await Quiz.findAll({ where: { userId }, order: [['createdAt','DESC']], limit: 50 });
  const scores = [];
  for (const q of quizzes) {
    const title = (q.title || '').toLowerCase();
    let topic = 'general';
    if (title.includes('calculus')) topic = 'calculus';
    else if (title.includes('algebra')) topic = 'algebra';
    else if (title.includes('biology') || title.includes('bio ')) topic = 'biology';
    else if (title.includes('physics')) topic = 'physics';
    else if (title.includes('chemistry')) topic = 'chemistry';
    if (topic === subject) {
      const total = Number(q.totalQuestions||0);
      const sc = Number(q.score||0);
      if (total>0) scores.push(clamp01(sc/total));
    }
  }
  if (!scores.length) return 0.5;
  return scores.reduce((a,b)=>a+b,0)/scores.length;
}

async function main(){
  try {
    const arg = process.argv[2] || 'calculus,biology,physics';
    const subjects = arg.split(',').map(s=>s.trim().toLowerCase()).filter(Boolean);

    await sequelize.authenticate();

    console.log('🧹 Deleting existing study groups and memberships...');
    await StudyGroupMember.destroy({ where: {}, truncate: true });
    await StudyGroup.destroy({ where: {}, truncate: true });

    const users = await User.findAll({ order: [['createdAt','DESC']], limit: 200 });
    if (!users.length) {
      throw new Error('No users found. Seed users first.');
    }

    for (const subject of subjects) {
      console.log(`\n📚 Subject: ${subject}`);
      // Compute skills for all users for this subject
      const rows = [];
      for (const u of users) {
        const skill = await computeUserSkill(u.id, subject);
        rows.push({ userId: u.id, skill });
      }
      // Partition into bands
      rows.sort((a,b)=>b.skill-a.skill);
      const n = rows.length;
      const bandSize = Math.max(1, Math.floor(n/3));
      const high = rows.slice(0, bandSize);
      const mid = rows.slice(bandSize, bandSize*2);
      const low = rows.slice(bandSize*2);

      const bands = [ { name: 'high', list: high }, { name: 'average', list: mid }, { name: 'low', list: low } ];
      for (const band of bands) {
        if (!band.list.length) continue;
        const g = await StudyGroup.create({ topic: subject, difficulty: band.name, scheduleSlot: null, status: 'active' });
        for (const m of band.list) {
          await StudyGroupMember.create({ groupId: g.id, userId: m.userId, role: 'member', joinedAt: new Date() });
        }
        console.log(`  ➕ Created ${subject}/${band.name} group #${g.id} with ${band.list.length} members`);
      }
    }

    console.log('\n✅ Done.');
    await sequelize.close();
  } catch (err) {
    console.error('❌ Error:', err.message || err);
    process.exit(1);
  }
}

main();
