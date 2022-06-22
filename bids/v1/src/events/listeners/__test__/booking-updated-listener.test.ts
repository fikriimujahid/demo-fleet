import mongoose from "mongoose";
import { Message } from 'node-nats-streaming';
import { BookingUpdatedEvent } from "@demo-lib/common";
import { BookingUpdatedListener } from "../booking-updated-listener";
import { natsWrapper } from "../../../nats-wrapper";
import { Booking } from "../../../models/booking";

const setup = async () => {
    const listener = new BookingUpdatedListener(natsWrapper.client);

    const booking = Booking.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        net_weight: 20,
        trucking_note: 'Test'
    });
    await booking.save();

    // create a fake data event
    const data: BookingUpdatedEvent['data'] = {
        id: booking.id,
        net_weight: 20,
        trucking_note: 'Test',
        version: booking.version + 1,
        user_id: new mongoose.Types.ObjectId().toHexString()
    };

    // create a fake message object
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn(),
    }

    return { booking, data, msg, listener };
}

it('finds, updates, save a booking and acks the message', async() => {
    const { listener, booking, data, msg } = await setup();

    // call the onMessage function with the data object + message object
    await listener.onMessage(data, msg);

    const updatedBooking = await Booking.findById(booking);

    expect(updatedBooking?.net_weight).toEqual(booking.net_weight);
    expect(updatedBooking?.trucking_note).toEqual(booking.trucking_note);
});

it('does not call ack if the event has a skipped version number', async () => {
    const { listener, booking, data, msg } = await setup();

    data.version = 10;

    try {
        // call the onMessage function with the data object + message object
        await listener.onMessage(data, msg);
    } catch (err) {
        
    }

    expect(msg.ack).not.toHaveBeenCalled();
});