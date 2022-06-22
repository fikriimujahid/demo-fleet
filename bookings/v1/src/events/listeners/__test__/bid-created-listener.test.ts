import { Message } from 'node-nats-streaming';
import mongoose from 'mongoose';
import { BidCreatedEvent, BidStatus } from '@demo-lib/common';
import { BidCreatedListener } from '../bid-created-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { Booking } from '../../../models/booking';

const setup = async () => {
  // Create an instance of the listener
  const listener = new BidCreatedListener(natsWrapper.client);

  // Create and save a booking
  const booking = Booking.build({
    net_weight:10,
    trucking_note:'test',
    user_id:'123'
  });
  await booking.save();

  // Create the fake data event
  const data: BidCreatedEvent['data'] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    status: BidStatus.ON_REVIEW,
    version: 0,
    userId: 'asfdasd',
    expiresAt: 'asdfs',
    booking: {
        id: booking.id,
        trucking_note: booking.trucking_note,
        net_weight: booking.net_weight
    },
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, booking, data, msg };
};

it('count the bid of the booking', async () => {
  const { listener, booking, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const updatedBooking = await Booking.findById(booking.id);
  expect(updatedBooking!.bid_count).toEqual(1);
});

it('acks the message', async () => {
  const { listener, booking, data, msg } = await setup();
  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});

it('publishes a booking updated event', async () => {
  const { listener, booking, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(natsWrapper.client.publish).toHaveBeenCalled();

  const bookingUpdatedData = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
  );

  expect(data.booking.id).toEqual(bookingUpdatedData.id);
});
