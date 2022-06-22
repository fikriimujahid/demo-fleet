import { BookingStatus, Channels, Listener, PaymentCreatedEvent } from "@demo-lib/common";
import { Message } from "node-nats-streaming";
import { Booking } from "../../models/booking";
import { queueGroupName } from "./queue-group-name";

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
    readonly channel = Channels.PaymentCreated;
    queueGroupName = queueGroupName;

    async onMessage(data: PaymentCreatedEvent['data'], msg: Message) {
        const booking = await Booking.findById(data.bookingId);

        if(!booking) {
            throw new Error('Booking not found');
        }

        booking.set({ status: BookingStatus.FINISHED});
        await booking.save();

        msg.ack();
    }
}