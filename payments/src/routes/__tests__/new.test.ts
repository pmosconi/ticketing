import request from 'supertest';
import { app } from '../../app';
import { Order } from '../../models/order';
import { Payment } from '../../models/payment';
import mongoose from 'mongoose';
import { OrderStatus } from '@actvalue/common';
import { stripe } from '../../stripe';

// jest.mock('../../stripe');

it('returns an error if no token is provided', async () => {
    await request(app)
        .post('/api/payments')
        .set('Cookie', global.signin())
        .send({ orderId: '123' });
    expect(400);
});

it('returns not found if an invalid order is provided', async () => {
    await request(app)
        .post('/api/payments')
        .set('Cookie', global.signin())
        .send({
            token: 'aaaa',
            orderId: mongoose.Types.ObjectId().toHexString()
        })
        .expect(404);
});

it('returns 401 when purchasing an order that doesnt belong to the user', async () => {
    const order = Order.build({
        id: mongoose.Types.ObjectId().toHexString(),
        userId: mongoose.Types.ObjectId().toHexString(),
        version: 0,
        price: 20,
        status: OrderStatus.Created
    });
    await order.save();
    await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin())
    .send({
        token: 'aaaa',
        orderId: order.id
    })
    .expect(401);
});

it('returns 400 when purchasing a cancelled order', async () => {
    const userId = mongoose.Types.ObjectId().toHexString();
    const order = Order.build({
        id: mongoose.Types.ObjectId().toHexString(),
        userId,
        version: 0,
        price: 20,
        status: OrderStatus.Cancelled
    });
    await order.save();
    await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin(userId))
    .send({
        token: 'aaaa',
        orderId: order.id
    })
    .expect(400);
});

it('returns a 201 with valid inputs', async () => {
    const userId = mongoose.Types.ObjectId().toHexString();
    const price = Math.floor(Math.random() * 100000);
    const order = Order.build({
        id: mongoose.Types.ObjectId().toHexString(),
        userId,
        version: 0,
        price,
        status: OrderStatus.Created
    });
    await order.save();
    await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin(userId))
    .send({
        token: 'tok_visa',
        orderId: order.id
    })
    .expect(201);

    // with mock
    // const chargeOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0];
    // expect(chargeOptions.source).toEqual('tok_visa');
    // expect(chargeOptions.amount).toEqual(20 * 100);
    // expect(chargeOptions.currency).toEqual('eur');

    // with real api
    const stripeCharges = await stripe.charges.list({ limit: 50 });
    const stripeCharge = stripeCharges.data.find(charge => charge.amount === price * 100);
    expect(stripeCharge).toBeDefined();
    expect(stripeCharge?.currency).toEqual('eur');

    const payment = await Payment.findOne({ orderId: order.id, stripeId: stripeCharge?.id });
    expect(payment).not.toBeNull();
});