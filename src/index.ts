import express from 'express';
import 'reflect-metadata';
import dotenv from 'dotenv';
import { createConnection } from 'typeorm';
dotenv.config();
import swaggerUI from 'swagger-ui-express';
import swaggerOption from './config/swagger';
import swaggerJSDoc from 'swagger-jsdoc';

import { db } from './config/db';

const swaggerSpec = swaggerJSDoc(swaggerOption);

const app = express();
app.get('/', (req, res) => {
  res.send('ok');
});
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec));

createConnection(db)
  .then(() => {
    app.listen(3000, () => console.log('listening'));
  })
  .catch((err) => {
    console.log(err);
  });
