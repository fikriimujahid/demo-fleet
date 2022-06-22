import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Bid } from '../../models/bid';
import { Booking } from '../../models/booking';

const buildBooking = async () => {
  const booking = Booking.build({
    trucking_note: 'concert',
    net_weight: 20,
    id: new mongoose.Types.ObjectId().toHexString()
  });
  await booking.save();

  return booking;
};

it('fetches bids for an particular user', async () => {
  // Create three bookings
  const bookingOne = await buildBooking();
  const bookingTwo = await buildBooking();
  const bookingThree = await buildBooking();

  const userOne = global.signin();
  const userTwo = global.signin();
  // Create one bid as User #1
  await request(app)
    .post('/v1/bids')
    .set('Cookie', userOne)
    .send({ bookingId: bookingOne.id })
    .expect(201);

  // Create two bids as User #2
  const { body: bidOne } = await request(app)
    .post('/v1/bids')
    .set('Cookie', userTwo)
    .send({ bookingId: bookingTwo.id })
    .expect(201);
  const { body: bidTwo } = await request(app)
    .post('/v1/bids')
    .set('Cookie', userTwo)
    .send({ bookingId: bookingThree.id })
    .expect(201);

  // Make request to get bids for User #2
  const response = await request(app)
    .get('/v1/bids')
    .set('Cookie', userTwo)
    .expect(200);

  // Make sure we only got the bids for User #2
  expect(response.body.length).toEqual(2);
  expect(response.body[0].id).toEqual(bidOne.id);
  expect(response.body[1].id).toEqual(bidTwo.id);
  expect(response.body[0].booking.id).toEqual(bookingTwo.id);
  expect(response.body[1].booking.id).toEqual(bookingThree.id);
});
