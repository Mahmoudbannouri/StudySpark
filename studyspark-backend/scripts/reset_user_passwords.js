// Reset passwords for specific users and ensure quotas
// Usage: node scripts/reset_user_passwords.js
import dotenv from 'dotenv';
dotenv.config();

import bcrypt from 'bcryptjs';
import sequelize from '../src/config/db.js';
import User from '../src/models/userModel.js';
import Quota from '../src/models/Quota.js';

const TARGETS = [
  { email: 'smart@student.test', fullname: 'Smart Student' },
  { email: 'avg@student.test', fullname: 'Average Student' },
  { email: 'weak@student.test', fullname: 'Weak Student' },
];

async function main() {
  try {
    console.log('🔧 Resetting passwords for seeded users...');
    await sequelize.authenticate();
    await User.sync();
    await Quota.sync();

    const password = 'Password123!';
    const hash = await bcrypt.hash(password, 10);

    for (const t of TARGETS) {
      const user = await User.findOne({ where: { email: t.email } });
      if (!user) {
        console.log(`⚠️  Not found, creating: ${t.email}`);
        const created = await User.create({ fullname: t.fullname, email: t.email, password: hash, role: 'student' });
        await Quota.findOrCreate({ where: { userId: created.id }, defaults: { userId: created.id } });
        console.log(`✅ Created ${t.email} (id=${created.id})`);
      } else {
        user.password = hash;
        if (!user.role) user.role = 'student';
        await user.save();
        await Quota.findOrCreate({ where: { userId: user.id }, defaults: { userId: user.id } });
        console.log(`✅ Reset password for ${t.email} (id=${user.id})`);
      }
    }

    await sequelize.close();
    console.log('✅ Done. Try logging in with Password123!');
  } catch (err) {
    console.error('❌ Failed:', err);
    process.exit(1);
  }
}

main();
