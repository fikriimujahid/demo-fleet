import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { natsWrapper } from '../../nats-wrapper';

it('returns a 404 if the provided id does not exist', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`/v1/bookings/${id}`)
    .set('Cookie', global.signin())
    .send({
      net_weight: 20,
    })
    .expect(404);
});

it('returns a 401 if the user is not authenticated', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`/v1/bookings/${id}`)
    .send({
      net_weight: 20,
    })
    .expect(401);
});

it('returns a 401 if the user does not own the ticket', async () => {
  const response = await request(app)
    .post('/v1/bookings')
    .set('Cookie', global.signin())
    .send({
      net_weight: 20,
    });

  await request(app)
    .put(`/v1/bookings/${response.body.id}`)
    .set('Cookie', global.signin())
    .send({
      net_weight: 1000,
    })
    .expect(401);
});

it('returns a 400 if the user provides an invalid net_weight', async () => {
  const cookie = global.signin();

  const response = await request(app)
    .post('/v1/bookings')
    .set('Cookie', cookie)
    .send({
      net_weight: 20,
    });

  await request(app)
    .put(`/v1/bookings/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      net_weight: -10,
    })
    .expect(400);
});

it('updates the booking provided valid inputs', async () => {
  const cookie = global.signin();

  const response = await request(app)
    .post('/v1/bookings')
    .set('Cookie', cookie)
    .send({
      net_weight: 20,
    });

  await request(app)
    .put(`/v1/bookings/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      net_weight: 100,
    })
    .expect(200);

  const ticketResponse = await request(app)
    .get(`/v1/bookings/${response.body.id}`)
    .send();

  expect(ticketResponse.body.net_weight).toEqual(100);
});

it('publishes an event', async () => {
  const cookie = global.signin();

  const response = await request(app)
    .post('/v1/bookings')
    .set('Cookie', cookie)
    .send({
      net_weight: 20,
    });

  await request(app)
    .put(`/v1/bookings/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      net_weight: 100,
    })
    .expect(200);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
