import request from 'supertest';
import { app } from '../../app';

const createTicket = () => {
  return request(app).post('/v1/bookings').set('Cookie', global.signin()).send({
    net_weight: 20,
  });
};

it('can fetch a list of bookings', async () => {
  await createTicket();
  await createTicket();
  await createTicket();

  const response = await request(app).get('/v1/bookings').send().expect(200);

  expect(response.body.length).toEqual(3);
});
