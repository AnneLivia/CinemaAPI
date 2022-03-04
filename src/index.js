import logger from './utils/logger.js';
import config from './config/config.js';
import app from './app.js';

const { PORT } = config;

app.listen(PORT, () => {
  logger.info(`Server started at port ${PORT}.`);
});
