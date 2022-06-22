import mongoose from 'mongoose';
import { BidStatus } from '@demo-lib/common';
import { BookingDoc } from './booking';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

interface BidAttrs {
  userId: string;
  status: BidStatus;
  expiresAt: Date;
  booking: BookingDoc;
}

interface BidDoc extends mongoose.Document {
  userId: string;
  status: BidStatus;
  expiresAt: Date;
  version: number;
  booking: BookingDoc;
}

interface BidModel extends mongoose.Model<BidDoc> {
  build(attrs: BidAttrs): BidDoc;

  isAlreadyBid(
    bookingId: string,
    userId: string
  ): Promise<BookingDoc | null>;
}

const bidSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: Object.values(BidStatus),
      default: BidStatus.ON_REVIEW,
    },
    expiresAt: {
      type: mongoose.Schema.Types.Date,
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  }
);

bidSchema.set('versionKey', 'version');
bidSchema.plugin(updateIfCurrentPlugin);

bidSchema.statics.build = (attrs: BidAttrs) => {
  return new Bid(attrs);
};
bidSchema.statics.isAlreadyBid = (bookingId: string, userId: string) => {
  return Bid.findOne({
    userId: userId,
    booking: bookingId,
  });
};

const Bid = mongoose.model<BidDoc, BidModel>('Bid', bidSchema);

export { Bid };
