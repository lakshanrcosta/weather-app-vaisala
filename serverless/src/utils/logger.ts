import pino from 'pino';

const isTest = process.env.NODE_ENV === 'test';
const isLocal = process.env.NODE_ENV !== 'production' && !isTest;

export const logger = isTest
  ? pino({ level: 'silent' }) // or 'info', or write to process.stdout
  : pino(
      isLocal
        ? {
            transport: {
              target: 'pino-pretty',
              options: {
                colorize: true,
                translateTime: 'SYS:standard',
                ignore: 'pid,hostname'
              }
            }
          }
        : {
            level: process.env.LOG_LEVEL || 'info'
          }
    );
