import express, { Request, Response } from 'express';
import { requireAuth } from '@demo-lib/common';
import { Bid } from '../models/bid';

const router = express.Router();

router.get('/v1/bids', requireAuth, async (req: Request, res: Response) => {
  const bids = await Bid.find({
    userId: req.currentUser!.id,
  }).populate('booking');

  res.send(bids);
});

export { router as indexBidRouter };
