import { Message } from 'node-nats-streaming';
import mongoose from 'mongoose';
import { BookingCreatedEvent, BookingStatus } from '@demo-lib/common';
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
        price: 10000,
        status: BookingStatus.OPEN_BID
    };

    // create a fake message object
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn(),
    }

    return { listener, data, msg };
}


it('creates, saves a booking and acks the message ', async() => {
    const { listener, data, msg } = await setup();
    await listener.onMessage(data, msg);
    // write assertions to make sure a ticket was created!
    const booking = await Booking.findById(data.id);
    console.log(booking)
    expect(booking).toBeDefined();
    expect(booking?.status).toEqual(BookingStatus.OPEN_BID);
    expect(msg.ack).toHaveBeenCalled();
});