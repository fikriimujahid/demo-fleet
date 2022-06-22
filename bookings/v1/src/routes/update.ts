import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import {
  validateRequest,
  NotFoundError,
  requireAuth,
  NotAuthorizedError,
} from '@demo-lib/common';
import { Booking } from '../models/booking';
import { BookingUpdatedPublisher } from '../events/publishers/booking-updated-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.put(
  '/v1/bookings/:id',
  requireAuth,
  [
    body('net_weight').isNumeric().isInt({min:1}).withMessage('Weight must be greater than 0'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      throw new NotFoundError();
    }

    if (booking.user_id !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }
    
    // SHOULD IMPLEMENT DB TRANSACTIONS
    booking.set({
      net_weight: req.body.net_weight
    });
    await booking.save();
    await new BookingUpdatedPublisher(natsWrapper.client).publish({
      id: booking.id, 
      user_id: booking.user_id, 
      net_weight: booking.net_weight, 
      trucking_note: booking.trucking_note,
      version: booking.version,
    });

    res.send(booking);
  }
);

export { router as updateBookingRouter };
