import express from "express";
import 'express-async-errors';
import cookieSession from "cookie-session";
import cors = require('cors');

import routes from './routes';
import { errorHandler, NotFoundError } from '@demo-lib/common';

const app = express();
app.set('trust proxy', true);
app.use(express.json());
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});
app.use(
  cors({
    origin: ['http://localhost:3000', 'http://localhost:3100'],
    methods: ['GET', 'POST'],
    credentials: true,
    exposedHeaders: ['set-cookie']
  })
) 
// app.use((req, res, next) => { next(); }, cors({maxAge: 84600}));
app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV === 'prod'
  })
);
app.use(routes);

app.all('*', async (req, res) => {
  throw new NotFoundError();
});
app.use(errorHandler);

export { app };