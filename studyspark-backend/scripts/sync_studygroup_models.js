// Rabie: Manual sync script for StudyGroup AI tables only.
// Usage: node scripts/sync_studygroup_models.js
import dotenv from 'dotenv';
dotenv.config();

import sequelize from '../src/config/db.js';
import StudyGroup from '../src/models/StudyGroup.js';
import StudyGroupMember from '../src/models/StudyGroupMember.js';
import GroupRefreshEvent from '../src/models/GroupRefreshEvent.js';

async function main() {
  try {
    console.log('🔧 Syncing StudyGroup AI models...');
    await StudyGroup.sync();
    await StudyGroupMember.sync();
    await GroupRefreshEvent.sync();
    console.log('✅ StudyGroup AI tables are in sync.');
    await sequelize.close();
  } catch (err) {
    console.error('❌ Sync failed:', err);
    process.exit(1);
  }
}

main();
