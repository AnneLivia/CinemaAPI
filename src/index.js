import express from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import cors from 'cors';
import helmet from 'helmet';

import routes from './routes/routes.js';

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;

// using middlewares
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use(helmet());

app.use('/api', routes);

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Cinema API' });
});

app.listen(PORT, () => {
  console.log(`Server started at port ${PORT}!`);
});
