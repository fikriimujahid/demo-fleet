import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../app';
import { Booking } from '../../models/booking';
import { BookingStatus } from '@demo-lib/common';
import { stripe } from '../../stripe';
import { Payment } from '../../models/payment';

it('return a 404 when purchasing an order that does not exist', async () => {
    await request(app)
    .post('/v1/payments')
    .set('Cookie', global.signin())
    .send({
        token: 'asdfas',
        bookingId: new mongoose.Types.ObjectId().toHexString(),
    })
    .expect(404);
});

it('return a 401 when purchasing an booking that doesnt belong to the user', async () => {
    const booking = Booking.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        net_weight: 10,
        price: 10000,
        status: BookingStatus.OPEN_BID,
        user_id: new mongoose.Types.ObjectId().toHexString(),
        version: 0
    });
    await booking.save();

    await request(app)
    .post('/v1/payments')
    .set('Cookie', global.signin())
    .send({
        token: 'asdfd',
        bookingId: booking.id
    })
    .expect(401);
});

it('return a 400 when purchasing a cancelled order', async () => {
    const userId = new mongoose.Types.ObjectId().toHexString();
    const booking = Booking.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        net_weight: 10,
        price: 10000,
        status: BookingStatus.FINISHED,
        user_id: userId,
        version: 0
    });
    await booking.save();

    await request(app)
    .post('/v1/payments')
    .set('Cookie', global.signin(userId))
    .send({
        token: 'asdf',
        bookingId: booking.id
    })
    .expect(400);
});

it('return a 201 with valid inputs', async () => {
    const user_id = new mongoose.Types.ObjectId().toHexString();
    const price = Math.floor(Math.random() * 100000);
    const booking = Booking.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        net_weight: 10,
        price,
        status: BookingStatus.OPEN_BID,
        user_id,
        version: 0
    });
    await booking.save();

    await request(app)
    .post('/v1/payments')
    .set('Cookie', global.signin(user_id))
    .send({
        token: 'tok_mastercard',
        bookingId: booking.id
    })
    .expect(201);

    const stripeCharges = await stripe.charges.list({ limit: 5});
    // console.log(stripeCharges.data);
    const stripeCharge = stripeCharges.data.find((charge) => {
        return charge.amount === price* 100;
        // console.log(charge);
    });

    expect(stripeCharge).toBeDefined();
    expect(stripeCharge!.currency).toEqual('sgd');

    const payment = await Payment.findOne({
        bookingId: booking.id,
        stripeId: stripeCharge!.id
    });
    expect(payment).not.toBeNull();
});