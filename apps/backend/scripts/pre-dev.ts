import { execSync } from 'child_process';

// Service name from docker-compose.yml
const DB_SERVICE_NAME = 'postgres';
const COMPOSE_FILE = 'docker-compose.yml';

function isContainerRunning(serviceName) {
  try {
    const output = execSync(`docker-compose -f ${COMPOSE_FILE} ps -q ${serviceName}`, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });

    if (!output.trim()) {
      return false;
    }

    // Check if the container is actually running
    const containerId = output.trim();
    const status = execSync(`docker inspect ${containerId} --format='{{.State.Running}}'`, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });

    return status.trim() === 'true';
  } catch {
    return false;
  }
}

async function startContainer(serviceName) {
  console.log(`🚀 Starting container ${serviceName}...`);

  try {
    execSync(`docker-compose -f ${COMPOSE_FILE} up -d ${serviceName}`, {
      stdio: 'inherit',
    });

    // Wait for the container to be ready (optional - you can customize)
    console.log('⏳ Waiting for the database to be ready...');
    await waitForDatabase();

    console.log('✅ Container is ready!');
  } catch (error) {
    console.error('❌ Error starting container:', (error as Error).message);
    process.exit(1);
  }
}

async function waitForDatabase() {
  const maxAttempts = 3;
  const delay = 1000;

  for (let i = 0; i < maxAttempts; i++) {
    try {
      // Check if the database is responding (example for PostgreSQL)
      execSync(`docker-compose -f ${COMPOSE_FILE} exec -T ${DB_SERVICE_NAME} pg_isready`, {
        stdio: 'ignore',
      });
      return;
    } catch {
      if (i === maxAttempts - 1) {
        throw new Error('Timeout: Database is not responding');
      }
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

async function main() {
  console.log(`🔍 Checking if container ${DB_SERVICE_NAME} is running...`);

  const isRunning = isContainerRunning(DB_SERVICE_NAME);

  if (isRunning) {
    console.log('✅ Container is already running!');
  } else {
    console.log('⚠️ Container not running, starting...');
    await startContainer(DB_SERVICE_NAME);
  }

  console.log('🚀 Running database setup (db:setup)...');
  try {
    execSync('pnpm db:setup', { stdio: 'inherit' });
    console.log('✅ Database setup completed successfully!');
  } catch (error) {
    console.error('❌ Error running database setup:', (error as Error).message);
    process.exit(1);
  }
}

main().catch(error => {
  console.error('❌ Error:', (error as Error).message);
  process.exit(1);
});
