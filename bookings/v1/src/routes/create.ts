import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { requireAuth, validateRequest } from '@demo-lib/common';
import { Booking } from '../models/booking';
import { BookingCreatedPublisher } from '../events/publishers/booking-created-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.post(
  '/v1/bookings',
  requireAuth,
  [
    body('price').isNumeric().isInt({min:1}).withMessage('price must be greater than 0'),
    body('net_weight').isNumeric().isInt({min:1}).withMessage('Weight must be greater than 0'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { net_weight, trucking_note, price } = req.body;

    // SHOULD IMPLEMENT DB TRANSACTIONS
    const booking = Booking.build({
      price,
      net_weight,
      trucking_note,
      user_id: req.currentUser!.id,
    });
    await booking.save();
    await new BookingCreatedPublisher(natsWrapper.client).publish({
      id: booking.id, 
      user_id: booking.user_id, 
      net_weight: booking.net_weight, 
      trucking_note: booking.trucking_note,
      price: booking.price,
      status: booking.status,
      version: booking.version
    });

    res.status(201).send(booking);
  }
);

export { router as createBookingRouter };
