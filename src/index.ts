import express from 'express';
import cookieParser from 'cookie-parser';
import 'reflect-metadata';
import dotenv from 'dotenv';
import { createConnection } from 'typeorm';
dotenv.config();
import swaggerUI from 'swagger-ui-express';
import swaggerOption from './config/swagger';
import swaggerJSDoc from 'swagger-jsdoc';

import { db } from './config/db';
import rootRouter from './routes';
import { checkToken } from './middlewares/auth';

const swaggerSpec = swaggerJSDoc(swaggerOption);

const app = express();
app.use(express.json());
app.use(cookieParser());

app.use('/', checkToken, rootRouter);
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec));

if (process.env.NODE_ENV !== 'test') {
  createConnection(db)
    .then(() => {
      app.listen(3000, () => console.log('listening'));
    })
    .catch((err) => {
      console.log(err);
    });
}

export default app;
