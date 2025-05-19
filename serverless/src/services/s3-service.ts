import AWS from 'aws-sdk';
import { logger } from '../utils/logger';

const s3 = new AWS.S3({ httpOptions: { timeout: 5000 } });
const BUCKET_NAME = process.env.BUCKET_NAME!;
const PROCESSED_FOLDER = 'processed/';

export async function fetchS3Json(key: string): Promise<string> {
  logger.info({ bucket: BUCKET_NAME, key }, 'Fetching file from S3');
  try {
    const object = await s3.getObject({ Bucket: BUCKET_NAME, Key: key }).promise();

    if (!object.Body) {
      logger.error({ key }, 'S3 object has no body');
      throw new Error('Empty or missing file body');
    }

    logger.debug({ key }, 'S3 object fetched successfully');
    return object.Body.toString('utf-8');
  } catch (err) {
    logger.error({ err, key }, 'Failed to fetch file from S3');
    throw err;
  }
}

export async function archiveFile(key: string): Promise<void> {
  const filename = key.split('/').pop()!;
  const targetKey = `${PROCESSED_FOLDER}${filename}`;

  logger.info({ key, targetKey }, 'Archiving file to processed folder');

  try {
    await s3
      .copyObject({
        Bucket: BUCKET_NAME,
        CopySource: `${BUCKET_NAME}/${key}`,
        Key: targetKey
      })
      .promise();

    await s3.deleteObject({ Bucket: BUCKET_NAME, Key: key }).promise();

    logger.info({ key, targetKey }, 'File archived and deleted from original location');
  } catch (err) {
    logger.error({ err, key, targetKey }, 'Failed to archive file');
    throw err;
  }
}
