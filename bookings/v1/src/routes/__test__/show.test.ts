import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';

it('returns a 404 if the booking is not found', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();

  await request(app).get(`/v1/bookings/${id}`).send().expect(404);
});

it('returns the booking if the booking is found', async () => {
  const net_weight = 20;

  const response = await request(app)
    .post('/v1/bookings')
    .set('Cookie', global.signin())
    .send({
      net_weight
    })
    .expect(201);

  const bookingResponse = await request(app)
    .get(`/v1/bookings/${response.body.id}`)
    .send()
    .expect(200);

  expect(bookingResponse.body.net_weight).toEqual(net_weight);
});
