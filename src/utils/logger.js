import winston from 'winston';
import WinstonDailyRotateFile from 'winston-daily-rotate-file';

const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
    winston.format.colorize(),
    winston.format.align(),
  ),
  defaultMeta: { service: 'user-service' },
  transports: [
    new WinstonDailyRotateFile({
      auditFile: './log/audit.json',
      datePattern: 'YYYY-MM-DD',
      filename: './log/app-%DATE%.log',
      maxFiles: '3d',
      maxSize: '10m',
    }),
  ],
});

logger.stream = {
  write(message) {
    logger.info(message);
  },
};

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

export default logger;
