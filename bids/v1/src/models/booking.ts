import mongoose from 'mongoose';
import { BidStatus } from '@demo-lib/common';
import { Bid } from './bid';

interface BookingAttrs {
  id: string;
  trucking_note: string;
  net_weight: number;
}

export interface BookingDoc extends mongoose.Document {
  trucking_note: string;
  net_weight: number;
  version: number;
  isReserved(): Promise<boolean>;
}

interface BookingModel extends mongoose.Model<BookingDoc> {
  build(attrs: BookingAttrs): BookingDoc;
  findByEvent(event: {
    id: string;
    version: number;
  }): Promise<BookingDoc | null>;
}

const bookingSchema = new mongoose.Schema(
  {
    trucking_note: { type: String },
    net_weight: { type: Number,required: true },
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

bookingSchema.set('versionKey', 'version');

bookingSchema.statics.build = (attrs: BookingAttrs) => {
  return new Booking({
    _id: attrs.id,
    trucking_note: attrs.trucking_note,
    net_weight: attrs.net_weight,
  });
};
bookingSchema.statics.findByEvent = (event: {id: string; version: number}) => {
  return Booking.findOne({
    _id: event.id,
    version: event.version -1,
  });
};

bookingSchema.methods.isReserved = async function () {
  // this === the booking document that we just called 'isReserved' on
  const existingBid = await Bid.findOne({
    booking: this as any,
    status: {
      $in: [
        BidStatus.APPROVED
      ],
    },
  });

  return !!existingBid;
};

const Booking = mongoose.model<BookingDoc, BookingModel>('Booking', bookingSchema);

export { Booking };
