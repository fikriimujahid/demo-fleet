import { BookingStatus } from '@demo-lib/common';
import mongoose from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

interface BookingAttrs {
  // is_container_filled: boolean;
  // container_status: string;
  price: number;
  net_weight: number;
  trucking_note: string;
  user_id: string;
}

interface BookingDoc extends mongoose.Document {
  // is_container_filled: boolean;
  // container_status: string;
  price: number;
  net_weight: number;
  trucking_note: string;
  user_id: string;
  version: number;
  status: BookingStatus;
  bid_count?: number;
}

interface BookingModel extends mongoose.Model<BookingDoc> {
  build(attrs: BookingAttrs): BookingDoc;
}

const bookingSchema = new mongoose.Schema(
  {
    is_container_filled: { type: Boolean },
    container_status: { type: String },
    trucking_note: { type: String },
    user_id: {
      type: String,
      required: true,
    },
    net_weight: { type: Number,required: true },
    bid_count: { type: Number },
    price: { type: Number,required: true },
    status: {
      type: String,
      required: true,
      enum: Object.values(BookingStatus),
      default: BookingStatus.OPEN_BID,
    },
    deleted_by: { type: Number },
    created_by: { type: Number },
    updated_by: { type: Number },
    deleted_at: { type: Date },
    updated_at: { type: Date },
    created_at: {
        type: Date,
        default: Date.now
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

bookingSchema.set('versionKey', 'version');
bookingSchema.plugin(updateIfCurrentPlugin);

bookingSchema.statics.build = (attrs: BookingAttrs) => {
  return new Booking(attrs);
};

const Booking = mongoose.model<BookingDoc, BookingModel>('Booking', bookingSchema);

export { Booking };
