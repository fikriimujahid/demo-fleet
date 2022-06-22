import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { BidCancelledEvent } from '@demo-lib/common';
import { natsWrapper } from '../../../nats-wrapper';
import { BidCancelledListener } from '../bid-cancelled-listener';
import { Booking } from '../../../models/booking';

const setup = async () => {
  const listener = new BidCancelledListener(natsWrapper.client);

  const bidId = new mongoose.Types.ObjectId().toHexString();
  const booking = Booking.build({
    net_weight:10,
    trucking_note:'test',
    user_id:'123'
  });
  let bid_count = 1;
  if(!isNaN(booking.bid_count!)){
    bid_count = booking.bid_count!+1;
  };
        
  booking.set({ bid_count: bid_count});
  await booking.save();
  
  const data: BidCancelledEvent['data'] = {
    id: bidId,
    version: 0,
    booking: {
      id: booking.id,
    },
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { msg, data, booking, bidId, listener };
};

it('updates the booking, publishes an event, and acks the message', async () => {
  const { msg, data, booking, bidId, listener } = await setup();

  await listener.onMessage(data, msg);

  const updatedBooking = await Booking.findById(booking.id);
  expect(updatedBooking!.bid_count).toEqual(0);
  expect(msg.ack).toHaveBeenCalled();
  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
