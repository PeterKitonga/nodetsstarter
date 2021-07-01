import 'reflect-metadata';
import express, { NextFunction, Request, Response, Application } from 'express';

import configs from './configs';
import { publicPath } from './utils/path';
import { logger } from './loaders/winston';
import { mongoConnect } from './loaders/mongoose';
import { CustomError } from './interfaces/errors';

const app: Application = express();

app.use(express.json());
app.use(express.static(publicPath()));

app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');

  next();
});

app.get('/', (req: Request, res: Response) => {
  res.status(200).json({ message: `Hello There! Running at: ${process.env.APP_BASE_URL}` });
});

app.use((err: CustomError, req: Request, res: Response) => {
  const { status_code, message, data } = err;
  const code = status_code || 500;

  res.status(code).json({ status: 'error', message, data });
});

(async () => {
  try {
    const { status, message } = await mongoConnect();

    if (status === 'success') {
      logger.info(message);
      app.listen(configs.app.port);
    } else {
      logger.error(message);
      process.exit(1);
    }
  } catch (err) {
    logger.error(err.message);
  }
})();
