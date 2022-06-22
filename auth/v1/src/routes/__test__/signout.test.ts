import request from 'supertest';
import { app } from '../../app';

it('clears the cookie after signing out', async () => {
  await request(app)
    .post('/v1/users/signup')
    .send({
      name: 'test',
      email: 'test@test.com',
      password: 'password',
      phone: 123123
    })
    .expect(201);

  const response = await request(app)
    .post('/v1/users/signout')
    .send({})
    .expect(200);

    // console.log(response.get('Set-Cookie'))
  expect(response.get('Set-Cookie')[0]).toEqual(
    'session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; httponly'
  );
});
