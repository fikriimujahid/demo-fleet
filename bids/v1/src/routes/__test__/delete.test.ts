import request from 'supertest';
import { app } from '../../app';
import { BidStatus } from '@demo-lib/common';
import { Booking } from '../../models/booking';
import { Bid } from '../../models/bid';
import { natsWrapper } from '../../nats-wrapper';
import mongoose from 'mongoose';

it('marks an bid as cancelled', async () => {
  // create a booking with Booking Model
  const booking = Booking.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    trucking_note: 'concert',
    net_weight: 20,
  });
  await booking.save();

  const user = global.signin();
  // make a request to create an bid
  const { body: bid } = await request(app)
    .post('/v1/bids')
    .set('Cookie', user)
    .send({ bookingId: booking.id })
    .expect(201);

  // make a request to cancel the bid
  await request(app)
    .delete(`/v1/bids/${bid.id}`)
    .set('Cookie', user)
    .send()
    .expect(204);

  // expectation to make sure the thing is cancelled
  const updatedBid = await Bid.findById(bid.id);

  expect(updatedBid!.status).toEqual(BidStatus.TRANSPORTER_REJECTED);
});

it('emits a bid cancelled event', async () => {
  const booking = Booking.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    net_weight: 20,
    trucking_note: 'test'
  });
  await booking.save();

  const user = global.signin();

  const { body: bid} = await request(app)
    .post('/v1/bids')
    .set('Cookie', user)
    .send({bookingId: booking.id})
    .expect(201);

  await request(app)
    .delete(`/v1/bids/${bid.id}`)
    .set('Cookie', user)
    .send()
    .expect(204);
    
  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
