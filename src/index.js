import 'express-async-errors';
import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import helmet from 'helmet';

import routes from './routes/routes.js';

// my middlewares
import authMiddleware from './middlewares/auth.middleware.js';
import errorMiddleware from './middlewares/errors.middleware.js';

import logger from './utils/logger.js';
import config from './config/config.js';

const app = express();

const { PORT } = config;

// using middlewares
app.use(cors());
app.use(express.json());
app.use(morgan('dev', { stream: logger.stream }));
app.use(helmet());

// using unless to conditionally skip a middleware when a condition is met
app.use(authMiddleware.unless({
  path: [
    // when used the string in url: "/api/login", if I request /api/login/, the route is
    // not going to be skipped. that's why I'm using regex to match (api/login)
    // independently of the '/' after it escape '\' in '\/' allows to use the '/' in regex.
    { url: /api\/login/ },
    { url: /api\/users/, methods: ['POST'] },
    { url: '/' },
  ],
}));

app.use('/api', routes);

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Cinema API' });
});

// The error-handling middleware must be the last among other
// middleware and routes for it to function correctly.
app.use(errorMiddleware);

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    logger.info(`Server started at port ${PORT}.`);
  });
}

export default app;
