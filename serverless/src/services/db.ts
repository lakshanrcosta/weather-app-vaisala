import { AppDataSource } from '@project/shared/ormconfig';
import { User } from '@project/shared/entities/User';
import { logger } from '../utils/logger';

export async function initializeDatabase(): Promise<void> {
  if (!AppDataSource.isInitialized) {
    try {
      await AppDataSource.initialize();
      logger.info('Database initialized');
    } catch (err) {
      logger.error({ err }, 'Failed to initialize database');
      throw err;
    }
  } else {
    logger.debug('Database already initialized');
  }
}

export async function ensureDemoUser(): Promise<number> {
  const userRepo = AppDataSource.getRepository(User);

  const name = process.env.DEMO_USER_NAME;
  const email = process.env.DEMO_USER_EMAIL;
  const passwordHash = process.env.DEMO_USER_PASSWORD_HASHED;

  if (!name || !email || !passwordHash) {
    logger.error(
      {
        name,
        email,
        password_hash: passwordHash
      },
      'Critical: Cannot proceed without test user email and password hash'
    );
    throw new Error('Missing essential env vars for test user creation');
  }

  try {
    const demoUser = await userRepo.findOneBy({ email });

    if (!demoUser) {
      const newUser = userRepo.create({
        name,
        email,
        password_hash: passwordHash
      });

      const savedUser = await userRepo.save(newUser);
      logger.info({ userId: savedUser.id }, 'Test user created with ID');
      return savedUser.id;
    } else {
      logger.info(`Users already exists in the database. DemoUserId : ${demoUser.id}`);
      return demoUser.id;
    }
  } catch (err) {
    logger.error({ err }, 'Failed to ensure initial user');
    throw err;
  }
}
