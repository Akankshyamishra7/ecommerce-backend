import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { connectDb } from '../config/db.js';
import { env } from '../config/env.js';
import { User } from '../models/User.js';

const run = async () => {
  try {
    console.log('--- AP Enterprises Admin Seeder ---');
    await connectDb();

    const adminEmail = (env.admin.email || 'akankshyam4@gmail.com').trim().toLowerCase();
    const adminPassword = env.admin.password || 'astha2003';
    const adminName = env.admin.name || 'AP Enterprises Admin';
    const adminCompany = env.admin.companyName || 'AP Enterprises';

    console.log(`Configuring Admin: ${adminEmail}`);

    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Upsert admin user
    const existing = await User.findOne({ email: adminEmail });

    if (existing) {
      existing.password = hashedPassword;
      existing.role = 'admin';
      existing.isActive = true;
      existing.name = adminName;
      existing.companyName = adminCompany;
      await existing.save();
      console.log(`[OK] Admin account verified & updated: ${adminEmail}`);
    } else {
      const created = await User.create({
        name: adminName,
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
        companyName: adminCompany,
        isActive: true
      });
      console.log(`[OK] Admin account created fresh: ${created.email} (ID: ${created._id})`);
    }

    // Double check verification
    const verified = await User.findOne({ email: adminEmail }).lean();
    console.log('\n--- Seed Status Summary ---');
    console.log('ID:         ', verified._id);
    console.log('Email:      ', verified.email);
    console.log('Role:       ', verified.role);
    console.log('Active:     ', verified.isActive);
    console.log('Company:    ', verified.companyName);
    console.log('Status:      READY FOR LOGIN');
    console.log('---------------------------\n');

    process.exit(0);
  } catch (error) {
    console.error('[Seeder Error]:', error);
    process.exit(1);
  }
};

run();
