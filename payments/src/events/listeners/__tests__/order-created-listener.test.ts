import mongoose from 'mongoose';
import { OrderCreatedEvent, OrderStatus } from '@actvalue/common';
import { OrderCreatedListener } from "../order-created-listener";
import { natsWrapper } from '../../../nats-wrapper';
import { Order } from '../../../models/order';
import { Message } from 'node-nats-streaming';

const setup = async () => {
    // create an instance of the listener
    const listener = new OrderCreatedListener(natsWrapper.client);

    // create the fake data event
    const data: OrderCreatedEvent['data'] = {
        id: mongoose.Types.ObjectId().toHexString(),
        version: 0,
        status: OrderStatus.Created,
        userId: 'userId',
        expiresAt: '123 456',
        ticket: {
            id: mongoose.Types.ObjectId().toHexString(),
            price: 123.32
        }
    };

    //create the fake event
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    };

    // return all the values
    return { listener, data, msg };
};

it('saves the order', async () => {
    const { listener, data, msg } = await setup();
    await listener.onMessage(data, msg);

    const order = await Order.findById(data.id);
    expect(order!.price).toEqual(data.ticket.price);
});

it('acks the message', async () => {
    const { listener, data, msg } = await setup();
    await listener.onMessage(data, msg);
    
    expect(msg.ack).toHaveBeenCalled();
});