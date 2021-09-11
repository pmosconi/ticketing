import mongoose from 'mongoose';
import { OrderCancelledEvent, OrderStatus } from '@actvalue/common';
import { OrderCancelledListener } from "../order-cancelled-listener";
import { natsWrapper } from '../../../nats-wrapper';
import { Order } from '../../../models/order';
import { Message } from 'node-nats-streaming';

const setup = async () => {
    // create an instance of the listener
    const listener = new OrderCancelledListener(natsWrapper.client);

    const orderId = mongoose.Types.ObjectId().toHexString();

    // create and save a ticket
    const order = Order.build({
        id: orderId,
        version: 0,
        price: 100,
        userId: 'userId',
        status: OrderStatus.Created,
    });
    await order.save();

    // create the fake data event
    const data: OrderCancelledEvent['data'] = {
        id: orderId,
        version: 1,
        ticket: { id: 'aaa'}
    };

    //create the fake event
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    };

    // return all the values
    return { listener, order, data, msg };
};

it('updates the order and acks the message', async () => {
    const { listener, order, data, msg } = await setup();
    await listener.onMessage(data, msg);

    const updatedOrder = await Order.findById(order.id);
    expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
    expect(msg.ack).toHaveBeenCalled();
});