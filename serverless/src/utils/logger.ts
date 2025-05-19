import pino from 'pino';

const isLocal = process.env.NODE_ENV !== 'production';

export const logger = pino(
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
