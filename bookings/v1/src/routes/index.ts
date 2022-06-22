import express, { Request, Response } from 'express';
import { Booking } from '../models/booking';

const router = express.Router();

router.get('/v1/bookings', async (req: Request, res: Response) => {
  const bookings = await Booking.find({});

  res.send(bookings);
});

export { router as indexBookingRouter };
