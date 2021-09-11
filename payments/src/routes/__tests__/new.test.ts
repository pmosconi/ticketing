import request from 'supertest';
import { app } from '../../app';
import { Order } from '../../models/order';
import mongoose from 'mongoose';
import { OrderStatus } from '@actvalue/common';


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