// Rabie: Seed a few biology-oriented users and signals so group formation for 'biology' can succeed.
// Usage: node scripts/seed_biology_candidates.js
import dotenv from 'dotenv';
dotenv.config();

import sequelize from '../src/config/db.js';
import User from '../src/models/userModel.js';
import Document from '../src/models/Document.js';
import Summary from '../src/models/Summary.js';
import Quiz from '../src/models/Quiz.js';

function randChoice(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

async function upsertStudent(i) {
  const email = `bio.student${i}@example.com`;
  const [user] = await User.findOrCreate({
    where: { email },
    defaults: {
      fullname: `Bio Student ${i}`,
      email,
      // bcrypt hash for 'Password123!'
      password: '$2a$10$V/2Xn2b8sIuY8A0gYz3QkO8nFh4O5iZbIuN0m3w6qWf2kOQv0r9yS',
      role: 'student',
    }
  });

  // Create 1-2 biology docs
  const doc = await Document.create({
    userId: user.id,
    name: randChoice(['Biology Notes - Cell Structure', 'Biology - Genetics Overview', 'Intro to Biology']),
    originalName: 'bio_notes.pdf',
    filePath: '/uploads/documents/bio_notes.pdf',
    fileType: 'pdf',
    fileSize: 2048,
    wordCount: 1500,
    extractedText: 'Biology introduction cell structure genetics DNA RNA protein synthesis.'
  });

  await Summary.create({
    documentId: doc.id,
    userId: user.id,
    type: 'short',
    content: 'Summary of biology basics: cell structure, genetics, DNA/RNA, protein synthesis.',
    keywords: ['biology', 'cell', 'genetics', 'dna', 'rna'],
    readabilityScore: 62,
    generatedAt: new Date(),
  });

  // A biology quiz with reasonable score
  const scores = [5, 6, 7, 8];
  await Quiz.create({
    documentId: doc.id,
    userId: user.id,
    title: 'Biology Quiz 1',
    questions: [{ q: 'What is DNA?', a: 'genetic material' }],
    totalQuestions: 10,
    score: randChoice(scores),
    completed: true,
    completedAt: new Date(),
  });

  return user.id;
}

async function main() {
  try {
    console.log('🔧 Seeding biology candidates...');
    await sequelize.authenticate();

    const ids = [];
    for (let i = 1; i <= 3; i++) {
      const id = await upsertStudent(i);
      ids.push(id);
    }

    console.log('✅ Seeded biology candidates (userIds):', ids);
    await sequelize.close();
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  }
}

main();
