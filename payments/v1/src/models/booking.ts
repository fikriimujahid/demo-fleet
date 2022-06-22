import { BookingStatus } from "@demo-lib/common";
import mongoose from "mongoose";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";

interface BookingAttrs {
    id: string;
    version: number;
    user_id: string;
    net_weight: number;
    price: number;
    status: BookingStatus;
}

interface BookingDoc extends mongoose.Document {
    version: number;
    user_id: string;
    net_weight: number;
    price: number;
    status: BookingStatus;
}

interface BookingModel extends mongoose.Model<BookingDoc> {
    build(attrs: BookingAttrs): BookingDoc;
}

const bookingSchema = new mongoose.Schema(
    {
      user_id: {
        type: String,
        required: true,
      },
      price: { type: Number,required: true },
      net_weight: { type: Number,required: true },
      status: {
        type: String,
        required: true,
        enum: Object.values(BookingStatus),
        default: BookingStatus.OPEN_BID,
      }
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
  return new Booking({
    _id: attrs.id,
    version: attrs.version,
    net_weight: attrs.net_weight,
    user_id: attrs.user_id,
    price: attrs.price,
    status: attrs.status,
  });
};

const Booking = mongoose.model<BookingDoc, BookingModel>('Booking', bookingSchema);

export { Booking };