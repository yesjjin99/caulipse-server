import express from 'express';
import 'reflect-metadata';
import dotenv from 'dotenv';
import { createConnection } from 'typeorm';
dotenv.config();
import swaggerUI from 'swagger-ui-express';
import swaggerOption from './config/swagger';
import swaggerJSDoc from 'swagger-jsdoc';

import { db } from './config/db';
import rootRouter from './routes';

const swaggerSpec = swaggerJSDoc(swaggerOption);

const app = express();
app.use('/', rootRouter);
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec));

createConnection(db)
  .then(() => {
    app.listen(3000, () => console.log('listening'));
  })
  .catch((err) => {
    console.log(err);
  });
