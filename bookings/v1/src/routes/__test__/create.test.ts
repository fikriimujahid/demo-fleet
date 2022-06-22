import request from 'supertest';
import { app } from '../../app';
import { Booking } from '../../models/booking';
import { natsWrapper } from '../../nats-wrapper';

it('has a route handler listening to /v1/bookings for post requests', async () => {
  const response = await request(app).post('/v1/bookings').send({});

  expect(response.status).not.toEqual(404);
});

it('can only be accessed if the user is signed in', async () => {
  await request(app).post('/v1/bookings').send({}).expect(401);
});

it('returns a status other than 401 if the user is signed in', async () => {
  const response = await request(app)
    .post('/v1/bookings')
    .set('Cookie', global.signin())
    .send({});

  expect(response.status).not.toEqual(401);
});

it('returns an error if an invalid net_weight is provided', async () => {
  await request(app)
    .post('/v1/bookings')
    .set('Cookie', global.signin())
    .send({
      net_weight: -10,
    })
    .expect(400);

  await request(app)
    .post('/v1/bookings')
    .set('Cookie', global.signin())
    .send({

    })
    .expect(400);
});

it('creates a booking with valid inputs', async () => {
  let bookings = await Booking.find({});
  expect(bookings.length).toEqual(0);

  await request(app)
    .post('/v1/bookings')
    .set('Cookie', global.signin())
    .send({
      price: 20,
      net_weight: 20,
    })
    .expect(201);

  bookings = await Booking.find({});
  expect(bookings.length).toEqual(1);
  expect(bookings[0].net_weight).toEqual(20);
});

it('publishes an event', async () => {
  await request(app)
    .post('/v1/bookings')
    .set('Cookie', global.signin())
    .send({
      net_weight: 20,
    })
    .expect(201);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});