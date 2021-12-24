import express from 'express';
import 'reflect-metadata';
import dotenv from 'dotenv';
import { createConnection } from 'typeorm';
dotenv.config();

import { db } from './config/db';

const app = express();
app.get('/', (req, res) => {
  res.send('ok');
});

createConnection(db)
  .then(() => {
    app.listen(3000, () => console.log('listening'));
  })
  .catch((err) => {
    console.log(err);
  });
