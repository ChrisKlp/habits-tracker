import { execSync } from 'child_process';

export default async () => {
  console.log('\n🧹 Cleaning up test database...');
  try {
    execSync('docker-compose -f docker-compose.test.yml down -v', {
      stdio: 'inherit',
      cwd: './test/config',
    });
    console.log('✅ Test database cleanup complete!');
  } catch (error) {
    console.error('❌ Error during test database cleanup:', error.message);
  }
};
