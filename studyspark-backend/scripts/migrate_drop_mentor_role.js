// Migration: Drop 'mentor' from StudyGroupMember.role enum in MySQL
// Steps:
// 1) Update any existing 'mentor' rows to 'member'
// 2) Alter the column to ENUM('member')
// Usage: node scripts/migrate_drop_mentor_role.js
import dotenv from 'dotenv';
dotenv.config();

import mysql from 'mysql2/promise';

async function run(){
  const { DB_HOST, DB_USER, DB_PASS, DB_NAME } = process.env;
  const conn = await mysql.createConnection({ host: DB_HOST, user: DB_USER, password: DB_PASS, database: DB_NAME, multipleStatements: true });
  try {
    console.log('🔧 Updating existing mentor roles to member...');
    await conn.execute("UPDATE `study_group_members` SET `role`='member' WHERE `role`='mentor'");

    console.log("🔧 Altering enum to drop 'mentor'...");
    await conn.execute("ALTER TABLE `study_group_members` MODIFY `role` ENUM('member') NOT NULL DEFAULT 'member'");

    console.log('✅ Migration complete.');
  } catch (err) {
    console.error('❌ Migration failed:', err.message || err);
    process.exit(1);
  } finally {
    await conn.end();
  }
}

run();
