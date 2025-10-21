// Seed: three student users (smart, avg, weak) and three study groups per subject
// Usage: node scripts/seed_users_and_groups.js
import dotenv from 'dotenv';
dotenv.config();

import sequelize from '../src/config/db.js';
import User from '../src/models/userModel.js';
import StudyGroup from '../src/models/StudyGroup.js';
import StudyGroupMember from '../src/models/StudyGroupMember.js';

const SUBJECTS = ['calculus', 'biology', 'physics'];

async function upsertUser(fullname, email) {
  const [u] = await User.findOrCreate({
    where: { email },
    defaults: {
      fullname,
      email,
      // bcrypt hash for 'Password123!'
      password: '$2a$10$V/2Xn2b8sIuY8A0gYz3QkO8nFh4O5iZbIuN0m3w6qWf2kOQv0r9yS',
      role: 'student'
    }
  });
  return u;
}

async function main() {
  try {
    console.log('🔧 Seeding users and groups...');
    await sequelize.authenticate();
    await StudyGroup.sync();
    await StudyGroupMember.sync();

    // Users: smart, avg, weak
    const smart = await upsertUser('Smart Student', 'smart@student.test');
    const avg = await upsertUser('Average Student', 'avg@student.test');
    const weak = await upsertUser('Weak Student', 'weak@student.test');

    const created = [];
    for (const topic of SUBJECTS) {
      // Create three groups per subject
      const elite = await StudyGroup.findOrCreate({
        where: { topic, difficulty: 'elite', status: 'active' },
        defaults: { topic, difficulty: 'elite', status: 'active', cluster: 'structured', scheduleSlot: null }
      }).then(([g]) => g);
      const average = await StudyGroup.findOrCreate({
        where: { topic, difficulty: 'average', status: 'active' },
        defaults: { topic, difficulty: 'average', status: 'active', cluster: 'flexible', scheduleSlot: null }
      }).then(([g]) => g);
      const special = await StudyGroup.findOrCreate({
        where: { topic, difficulty: 'special-needs', status: 'active' },
        defaults: { topic, difficulty: 'special-needs', status: 'active', cluster: 'flexible', scheduleSlot: null }
      }).then(([g]) => g);

      // Add initial members (one per group to start)
      await StudyGroupMember.findOrCreate({ where: { groupId: elite.id, userId: smart.id }, defaults: { groupId: elite.id, userId: smart.id } });
      await StudyGroupMember.findOrCreate({ where: { groupId: average.id, userId: avg.id }, defaults: { groupId: average.id, userId: avg.id } });
      await StudyGroupMember.findOrCreate({ where: { groupId: special.id, userId: weak.id }, defaults: { groupId: special.id, userId: weak.id } });

      created.push({ topic, elite: elite.id, average: average.id, specialNeeds: special.id });
    }

    console.log('✅ Done. Users:', { smart: smart.id, avg: avg.id, weak: weak.id });
    console.log('Groups per subject:', created);
    await sequelize.close();
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  }
}

main();
