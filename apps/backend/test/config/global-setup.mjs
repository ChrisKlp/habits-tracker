import { execSync } from 'child_process';

export default async () => {
  const url = new URL(process.env.DATABASE_URL);
  const hostAndPort = `${url.hostname}:${url.port}`;

  console.log('\n🚀 Starting test database on ' + hostAndPort + '...');
  try {
    // Clean up any existing test database
    execSync('docker-compose -f docker-compose.test.yml down -v', {
      stdio: 'inherit',
      cwd: './test/config',
    });

    // Start the test database
    execSync('docker-compose -f docker-compose.test.yml up -d', {
      stdio: 'inherit',
      cwd: './test/config',
    });

    execSync(`pnpm --filter backend wait-port ${hostAndPort}`, {
      stdio: 'inherit',
    });
    console.log('⏳ Waiting for PostgreSQL to fully initialize...');
    await new Promise(resolve => setTimeout(resolve, 500));

    console.log('✅ Test database is ready!');
  } catch (error) {
    console.error('❌ Failed to start test database:', error.message);
    process.exit(1);
  }
};
