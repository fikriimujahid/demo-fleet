import mongoose from 'mongoose';
import express, { Request, Response } from 'express';
import {
  requireAuth,
  validateRequest,
  NotFoundError,
  BidStatus,
  BadRequestError,
} from '@demo-lib/common';
import { body } from 'express-validator';
import { Booking } from '../models/booking';
import { Bid } from '../models/bid';
import { BidCreatedPublisher } from '../events/publishers/bid-created-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

const EXPIRATION_WINDOW_SECONDS = 15 * 60;

router.post(
  '/v1/bids',
  requireAuth,
  [
    body('bookingId')
      .not()
      .isEmpty()
      .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
      .withMessage('BookingId must be provided'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { bookingId } = req.body;

    // Find the booking the user is trying to bid in the database
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      throw new NotFoundError();
    }

    // Make sure that this booking is not already reserved
    // const isReserved = await booking.isReserved();
    // if (isReserved) {
    //   throw new BadRequestError('Booking is already reserved');
    // }

    const isAlreadyBid = await Bid.isAlreadyBid(bookingId, req.currentUser!.id);
    if (isAlreadyBid) {
      throw new BadRequestError('Booking is already reserved');
    }

    // Calculate an expiration date for this bid
    const expiration = new Date();
    expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS);

    // Build the bid and save it to the database
    const bid = Bid.build({
      userId: req.currentUser!.id,
      status: BidStatus.ON_REVIEW,
      expiresAt: expiration,
      booking,
    });
    await bid.save();

    // Publish an event saying that an bid was created
    new BidCreatedPublisher(natsWrapper.client).publish({
      id:bid.id,
      status: bid.status,
      userId: bid.userId,
      expiresAt: bid.expiresAt.toISOString(),
      version: bid.version,
      booking: {
        id: booking.id,
        net_weight: booking.net_weight,
        trucking_note: booking.trucking_note
      },
    });

    res.status(201).send(bid);
  }
);

export { router as newBidRouter };
