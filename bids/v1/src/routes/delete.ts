import express, { Request, Response } from 'express';
import {
  requireAuth,
  NotFoundError,
  NotAuthorizedError,
  BidStatus
} from '@demo-lib/common';
import { Bid } from '../models/bid';
import { BidCancelledPublisher } from '../events/publishers/bid-cancelled-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.delete(
  '/v1/bids/:bidId',
  requireAuth,
  async (req: Request, res: Response) => {
    const { bidId } = req.params;

    const bid = await Bid.findById(bidId).populate('booking');

    if (!bid) {
      throw new NotFoundError();
    }
    if (bid.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }
    bid.status = BidStatus.TRANSPORTER_REJECTED;
    await bid.save();

    // publishing an event saying this was cancelled!
    new BidCancelledPublisher(natsWrapper.client).publish({
      id: bid.id,
      version: bid.version,
      booking:{
        id: bid.booking.id
      },
    });

    res.status(204).send(bid);
  }
);

export { router as deleteBidRouter };
