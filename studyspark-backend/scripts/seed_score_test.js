// Seed for score-test: three users (weak/avg/smart) and three groups (Low/Medium/High Score)
// Usage: node scripts/seed_score_test.js
import dotenv from 'dotenv';
dotenv.config();

import sequelize from '../src/config/db.js';
import User from '../src/models/userModel.js';
import StudyGroup from '../src/models/StudyGroup.js';
import StudyGroupMember from '../src/models/StudyGroupMember.js';
import Quiz from '../src/models/Quiz.js';
import Document from '../src/models/Document.js';
import bcrypt from 'bcryptjs';

const TOPIC = 'score-test';

async function ensureUser({ fullname, email, password }) {
  const existing = await User.findOne({ where: { email } });
  const hash = await bcrypt.hash(password, 10);
  if (existing) {
    existing.password = hash;
    if (!existing.fullname) existing.fullname = fullname;
    if (!existing.role) existing.role = 'student';
    await existing.save();
    return existing;
  }
  return await User.create({ fullname, email, password: hash, role: 'student' });
}

async function ensureGroup({ name, difficulty, cluster }) {
  const [g] = await StudyGroup.findOrCreate({
    where: { topic: TOPIC, difficulty: difficulty ?? name, status: 'active' },
    defaults: { topic: TOPIC, difficulty: difficulty ?? name, status: 'active', cluster: cluster ?? 'structured', scheduleSlot: null },
  });
  return g;
}

async function ensureMembership(groupId, userId) {
  await StudyGroupMember.findOrCreate({ where: { groupId, userId }, defaults: { groupId, userId, role: 'member' } });
}

async function ensureDummyDocument(userId) {
  const [doc] = await Document.findOrCreate({
    where: { userId, name: 'score-test-doc' },
    defaults: {
      userId,
      name: 'score-test-doc',
      originalName: 'score-test.pdf',
      filePath: 'uploads/documents/score-test.pdf',
      fileType: 'pdf',
      fileSize: 1234,
      status: 'ready',
      uploadedAt: new Date(),
    }
  });
  return doc;
}

async function upsertQuizSignal({ userId, title, totalQuestions, score }) {
  // Create a small quiz record to influence computed skill via studyGroupFeatureAggregator
  const doc = await ensureDummyDocument(userId);
  const [q] = await Quiz.findOrCreate({
    where: { userId, title },
    defaults: {
      userId,
      documentId: doc.id,
      title,
      questions: [],
      totalQuestions,
      score,
      completed: true,
      completedAt: new Date(),
    }
  });
  if (!q.completed || q.totalQuestions !== totalQuestions || q.score !== score) {
    q.totalQuestions = totalQuestions;
    q.score = score;
    q.completed = true;
    q.completedAt = new Date();
    if (!q.documentId) q.documentId = doc.id;
    await q.save();
  }
}

async function main() {
  try {
    console.log('🔧 Seeding score-test users and groups...');
    await sequelize.authenticate();
    await Promise.all([
      User.sync(), StudyGroup.sync(), StudyGroupMember.sync(), Quiz.sync(), Document.sync()
    ]);

    // Users
    const weak = await ensureUser({ fullname: 'Very Weak', email: 'weak@gmail.com', password: 'Password123!' });
    const avg = await ensureUser({ fullname: 'Medium Average', email: 'foravg@gmail.com', password: 'Password123!' });
    const smart = await ensureUser({ fullname: 'Very Smart', email: 'smart@gmail.com', password: 'Password123!' });

    // Inject quiz-based signals to control skill
    // Weak: 2/10, Avg: 5/10, Smart: 9/10 on a quiz mentioning score-test topic
    await upsertQuizSignal({ userId: weak.id, title: 'Quiz - score-test basics', totalQuestions: 10, score: 2 });
    await upsertQuizSignal({ userId: avg.id, title: 'Quiz - score-test basics', totalQuestions: 10, score: 5 });
    await upsertQuizSignal({ userId: smart.id, title: 'Quiz - score-test basics', totalQuestions: 10, score: 9 });

    // Groups
    const low = await ensureGroup({ name: 'Low Score', difficulty: 'low-score', cluster: 'flexible' });
    const mid = await ensureGroup({ name: 'Medium Score', difficulty: 'medium-score', cluster: 'flexible' });
    const high = await ensureGroup({ name: 'High Score', difficulty: 'high-score', cluster: 'structured' });

  // Assign each user to the matching score group
  await ensureMembership(low.id, weak.id);
  await ensureMembership(mid.id, avg.id);
  await ensureMembership(high.id, smart.id);

    console.log('✅ Done. Users:', { weak: weak.id, avg: avg.id, smart: smart.id });
    console.log('Groups:', { low: low.id, medium: mid.id, high: high.id, topic: TOPIC });
    await sequelize.close();
  } catch (err) {
    console.error('❌ Seed score-test failed:', err);
    process.exit(1);
  }
}

main();
