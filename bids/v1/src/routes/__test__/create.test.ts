import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { BidStatus } from '@demo-lib/common';
import { Bid } from '../../models/bid';
import { Booking } from '../../models/booking';
import { natsWrapper } from '../../nats-wrapper';

it('returns an error if the booking does not exist', async () => {
  const bookingId = new mongoose.Types.ObjectId();

  await request(app)
    .post('/v1/bookings')
    .set('Cookie', global.signin())
    .send({ bookingId })
    .expect(404);
});

it('returns an error if the booking is already reserved', async () => {
  const user1 = global.signin();
  const user2 = global.signin();

  const booking = Booking.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    trucking_note: 'concert',
    net_weight: 20,
  });
  await booking.save();
  // const bid = Bid.build({
  //   booking,
  //   userId: 'laskdflkajsdf',
  //   status: BidStatus.APPROVED,
  //   expiresAt: new Date(),
  // });
  // await bid.save();

  await request(app)
    .post('/v1/bids')
    .set('Cookie', user1)
    .send({ bookingId: booking.id })
    .expect(201);
  
  await request(app)
    .post('/v1/bids')
    .set('Cookie', user1)
    .send({ bookingId: booking.id })
    .expect(400);
  
  await request(app)
    .post('/v1/bids')
    .set('Cookie', user2)
    .send({ bookingId: booking.id })
    .expect(201);
});

it('reserves a booking', async () => {
  const booking = Booking.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    trucking_note: 'concert',
    net_weight: 20,
  });
  await booking.save();

  await request(app)
    .post('/v1/bids')
    .set('Cookie', global.signin())
    .send({ bookingId: booking.id })
    .expect(201);
});

it('emits an bid created event', async () => {
  const booking = Booking.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    net_weight:20,
    trucking_note: 'test'
  });
  await booking.save();

  await request(app)
    .post('/v1/bids')
    .set('Cookie', global.signin())
    .send({ bookingId: booking.id})
    .expect(201);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
