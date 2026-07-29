import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as path from 'path';
import { config } from 'dotenv';

config({ path: path.resolve(__dirname, '..', '.env') });

async function seed() {
  const ds = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: true },
    entities: [path.resolve(__dirname, '..', 'dist', '**', '*.entity.js')],
  });

  await ds.initialize();
  console.log('Database connected');

  const userRepo = ds.getRepository('User');

  const seeds = [
    { email: 'admin@founderlink.io', password: 'Admin@1234', fullName: 'Platform Admin', role: 'admin' },
    { email: 'super@founderlink.io', password: 'Super@1234', fullName: 'Super Admin', role: 'super_admin' },
  ];

  for (const s of seeds) {
    const exists = await userRepo.findOne({ where: { email: s.email } });
    if (exists) {
      console.log(`  SKIP ${s.email} — already exists`);
      continue;
    }

    const passwordHash = await bcrypt.hash(s.password, 10);
    await userRepo.save({
      email: s.email,
      password: passwordHash,
      fullName: s.fullName,
      systemRole: s.role,
    });
    console.log(`  CREATED ${s.email} (${s.role})`);
  }

  await ds.destroy();
  console.log('Done');
}

async function main() {
  try {
    await seed();
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
}

void main();