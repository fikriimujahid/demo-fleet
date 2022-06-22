import express, { Request, Response } from 'express';
import {
  requireAuth,
  NotFoundError,
  NotAuthorizedError,
} from '@demo-lib/common';
import { Bid } from '../models/bid';

const router = express.Router();

router.get(
  '/v1/bids/:bidId',
  requireAuth,
  async (req: Request, res: Response) => {
    const bid = await Bid.findById(req.params.bidId).populate('booking');

    if (!bid) {
      throw new NotFoundError();
    }
    if (bid.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }

    res.send(bid);
  }
);

export { router as showBidRouter };
