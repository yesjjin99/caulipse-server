import express from 'express';
import dotenv from 'dotenv';
dotenv.config();

import { db } from './config';

const app = express();
app.get('/', (req, res) => {
  res.send('ok');
});
app.listen(3000, () => console.log('listening'));
