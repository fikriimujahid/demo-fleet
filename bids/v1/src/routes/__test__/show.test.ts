import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Booking } from '../../models/booking';

it('fetches the bid', async () => {
  // Create a booking
  const booking = Booking.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    trucking_note: 'concert',
    net_weight: 20,
  });
  await booking.save();

  const user = global.signin();
  // make a request to build an bid with this booking
  const { body: bid } = await request(app)
    .post('/v1/bids')
    .set('Cookie', user)
    .send({ bookingId: booking.id })
    .expect(201);

  // make request to fetch the bid
  const { body: fetchedBid } = await request(app)
    .get(`/v1/bids/${bid.id}`)
    .set('Cookie', user)
    .send()
    .expect(200);

  expect(fetchedBid.id).toEqual(bid.id);
});

it('returns an error if one user tries to fetch another users bid', async () => {
  // Create a booking
  const booking = Booking.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    trucking_note: 'concert',
    net_weight: 20,
  });
  await booking.save();

  const user = global.signin();
  // make a request to build an bid with this booking
  const { body: bid } = await request(app)
    .post('/v1/bids')
    .set('Cookie', user)
    .send({ bookingId: booking.id })
    .expect(201);

  // make request to fetch the bid
  await request(app)
    .get(`/v1/bids/${bid.id}`)
    .set('Cookie', global.signin())
    .send()
    .expect(401);
});
