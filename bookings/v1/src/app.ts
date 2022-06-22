import express from "express";
import 'express-async-errors';
import cookieSession from "cookie-session";

import { errorHandler, NotFoundError, currentUser } from '@demo-lib/common';
import { createBookingRouter } from './routes/create';
import { showBookingRouter } from './routes/show';
import { indexBookingRouter } from './routes/index';
import { updateBookingRouter } from './routes/update';


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
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV === 'prod'
  })
);
app.use(currentUser);

app.use(createBookingRouter);
app.use(showBookingRouter);
app.use(indexBookingRouter);
app.use(updateBookingRouter);

app.all('*', async (req, res) => {
  throw new NotFoundError();
});
app.use(errorHandler);

export { app };