import dataSource from '../data-source';
import { seedFirstAids } from './firstAid.seeder';

async function runSeeders() {
  try {
    await dataSource.initialize();
    console.log('📦 Database connected');

    await seedFirstAids();

    console.log('🌱 Seeding completed');
    await dataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed', error);
    process.exit(1);
  }
}

runSeeders();
