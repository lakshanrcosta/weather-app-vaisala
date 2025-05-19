import 'reflect-metadata';
import { S3Handler } from 'aws-lambda';
import { AppDataSource } from '@project/shared/ormconfig';
import { User } from '@project/shared/entities/User';
import { initializeDatabase, ensureDemoUser } from './services/db';
import { fetchS3Json, archiveFile } from './services/s3-service';
import { processWeatherData } from './services/weather-processor';
import { IUser } from './types';
import { logger } from './utils/logger';

export const handler: S3Handler = async (event) => {
  const record = event.Records[0];
  const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));
  const fileName = key.split('/').pop()!;
  const match = fileName.match(/^([a-f0-9\-]+)_(\d+)\.json$/);
  const isLambdaDemoMode = process.env.LAMBDA_DEMO_MODE === 'true';

  try {
    await initializeDatabase();

    let userId: number | undefined;

    if (isLambdaDemoMode) {
      logger.info({ fileName }, 'Demo mode enabled – using or creating demo user');
      userId = await ensureDemoUser();
    } else if (match) {
      userId = parseInt(match[2]);
    } else {
      logger.warn({ fileName }, 'Invalid filename format (expected <uuid>_<userId>.json)');
      return;
    }

    logger.info({ key, userId, fileName }, 'S3 event received');

    const userRepo = AppDataSource.getRepository(User);
    const user = (await userRepo.findOneBy({ id: userId })) as IUser;
    if (!user) {
      logger.error({ userId }, 'User not found');
      return;
    }

    const json = await fetchS3Json(key);
    const parsed = JSON.parse(json);
    if (!Array.isArray(parsed)) {
      logger.error({ key }, 'Invalid JSON: expected an array');
      return;
    }

    const wasProcessed = await processWeatherData(parsed, fileName, user, AppDataSource);
    if (wasProcessed) {
      await archiveFile(key);
    } else {
      logger.info({ fileName }, 'Skipping archive: file already processed');
    }
  } catch (err) {
    logger.error({ err }, 'Processing failed');
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      logger.info('DB connection closed');
    }
  }
};
