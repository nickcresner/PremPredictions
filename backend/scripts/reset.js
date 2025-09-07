#!/usr/bin/env node
/*
 * Reset the database to a clean slate.
 * Drops Users and Predictions collections. Optionally seeds a super admin.
 *
 * Usage:
 *  MONGODB_URI="<connection>" node scripts/reset.js [--seed-super-admin Nick [Team]]
 */

const mongoose = require('mongoose');

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('ERROR: MONGODB_URI is not set. Aborting.');
    process.exit(1);
  }

  const args = process.argv.slice(2);
  const seedIdx = args.indexOf('--seed-super-admin');
  const shouldSeed = seedIdx !== -1;
  const seedName = shouldSeed ? (args[seedIdx + 1] || 'Nick') : null;
  const seedTeam = shouldSeed ? (args[seedIdx + 2] || '') : '';

  console.log('Connecting to MongoDB...');
  await mongoose.connect(uri);
  const db = mongoose.connection.db;

  const toDrop = ['users', 'predictions'];
  const existing = (await db.listCollections().toArray()).map(c => c.name);
  for (const name of toDrop) {
    if (existing.includes(name)) {
      console.log(`Dropping collection: ${name}`);
      await db.dropCollection(name);
    } else {
      console.log(`Collection not found (skipping): ${name}`);
    }
  }

  if (shouldSeed) {
    console.log(`Seeding super admin user: ${seedName}`);
    const User = require('../models/User');
    await User.create({
      name: seedName,
      team: seedTeam,
      role: 'super_admin',
      isAdmin: true,
    });
    console.log('Super admin created.');
  }

  await mongoose.disconnect();
  console.log('Done. Database is clean.', shouldSeed ? '(Seeded super admin)' : '');
}

main().catch(err => {
  console.error('Reset failed:', err);
  process.exit(1);
});

