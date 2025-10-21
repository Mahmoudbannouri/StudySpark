// Rabie: Seed mock data for StudyGroup tests (user, group, doc/summary/quiz)
// Usage: node scripts/seed_studygroup_mock.js
import dotenv from 'dotenv';
dotenv.config();

import sequelize from '../src/config/db.js';
import User from '../src/models/userModel.js';
import Document from '../src/models/Document.js';
import Summary from '../src/models/Summary.js';
import Quiz from '../src/models/Quiz.js';
import StudyGroup from '../src/models/StudyGroup.js';

async function main() {
  try {
    console.log('🔧 Seeding StudyGroup mock data...');
    // Ensure core tables exist (server normally syncs, but we ensure here)
    await sequelize.authenticate();
    await StudyGroup.sync();

    // Upsert a test user
    const [user] = await User.findOrCreate({
      where: { email: 'test.student@example.com' },
      defaults: {
        fullname: 'Test Student',
        email: 'test.student@example.com',
        password: '$2a$10$V/2Xn2b8sIuY8A0gYz3QkO8nFh4O5iZbIuN0m3w6qWf2kOQv0r9yS', // bcrypt for 'Password123!'
        role: 'student',
      }
    });

    // Create a study group
    const group = await StudyGroup.create({
      topic: 'calculus',
      difficulty: 'beginner',
      scheduleSlot: 'Mon 18:00-20:00',
      status: 'active',
    });

    // Minimal document, summary, quiz to feed aggregator
    const doc = await Document.create({
      userId: user.id,
      name: 'Calculus Notes',
      originalName: 'calc_notes.pdf',
      filePath: '/uploads/documents/calc_notes.pdf',
      fileType: 'pdf',
      fileSize: 1024,
      wordCount: 2000,
      extractedText: 'Limits derivatives integrals fundamentals.'
    });

    await Summary.create({
      documentId: doc.id,
      userId: user.id,
      type: 'short',
      content: 'Summary of calculus basics: limits, derivatives, integrals.',
      keywords: ['calculus', 'derivatives', 'integrals'],
      readabilityScore: 60,
      generatedAt: new Date(),
    });

    await Quiz.create({
      documentId: doc.id,
      userId: user.id,
      title: 'Calculus Quiz 1',
      questions: [{ q: 'What is a derivative?', a: 'rate of change' }],
      totalQuestions: 10,
      score: 7,
      completed: true,
      completedAt: new Date(),
    });

    console.log('✅ Seed complete:', { userId: user.id, groupId: group.id, documentId: doc.id });
    await sequelize.close();
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  }
}

main();
