import mongoose from "mongoose";

interface PaymentAttrs {
    bookingId: string;
    stripeId: string;
}

interface PaymentDoc extends mongoose.Document {
    bookingId: string;
    stripeId: string;
}

interface PaymentModel extends mongoose.Model<PaymentDoc> {
    build(attrs: PaymentAttrs) : PaymentDoc;
}

const paymentSchema = new mongoose.Schema({
    bookingId: {
        required: true,
        type: String
    },
    stripeId: {
        required: true,
        type: String
    }},
    {
        toJSON: {
            transform(doc, ret){
                ret.id = ret._id;
                delete ret._id;
            },
        },
    }
);

paymentSchema.statics.build = (attrs: PaymentAttrs) => {
    return new Payment(attrs);
}

const Payment = mongoose.model<PaymentDoc, PaymentModel>('Payment', paymentSchema);

export { Payment };