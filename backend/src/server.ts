import app from './app.js';
import { logger } from './utils/logger.js';

const PORT = process.env.PORT || 3333;

app.listen(PORT, () => {
  logger.info({ port: PORT }, 'api_started');
  logger.info({ url: `/health` }, 'health_endpoint_ready');
});



