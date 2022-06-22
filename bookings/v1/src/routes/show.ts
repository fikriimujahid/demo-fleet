import express, { Request, Response } from 'express';
import { NotFoundError } from '@demo-lib/common';
import { Booking } from '../models/booking';

const router = express.Router();

router.get('/v1/bookings/:id', async (req: Request, res: Response) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    throw new NotFoundError();
  }

  res.send(booking);
});

export { router as showBookingRouter };
