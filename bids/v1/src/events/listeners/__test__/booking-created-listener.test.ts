import { Message } from 'node-nats-streaming';
import mongoose from 'mongoose';
import { BookingCreatedEvent } from '@demo-lib/common';
import { BookingCreatedListener } from '../booking-created-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { Booking } from '../../../models/booking';

const setup =async () => {
    // create an instance of the listener
    const listener = new BookingCreatedListener(natsWrapper.client);

    // create a fake data event
    const data: BookingCreatedEvent['data'] = {
        id: new mongoose.Types.ObjectId().toHexString(),
        net_weight: 20,
        trucking_note: 'Test',
        user_id: new mongoose.Types.ObjectId().toHexString(),
        version: 0,
        price: 10000
    };

    // create a fake message object
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn(),
    }

    // call the onMessage function with the data object + message object
    await listener.onMessage(data, msg);

    return { listener, data, msg };
}


it('creates, saves a booking and acks the message ', async() => {
    const { listener, data, msg } = await setup();

    // write assertions to make sure a ticket was created!
    const booking = await Booking.findById(data.id);

    expect(booking).toBeDefined();
    expect(booking?.net_weight).toEqual(data.net_weight);
    expect(booking?.trucking_note).toEqual(data.trucking_note);
    expect(msg.ack).toHaveBeenCalled();
});