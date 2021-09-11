import { Message } from 'node-nats-streaming';
import { Listener, OrderCreatedEvent, Subjects } from '@actvalue/common';
import { queueGroupName } from './queue-group-names';
import { Order } from '../../models/order';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    readonly subject = Subjects.OrderCreated;
    queueGroupName = queueGroupName;

    async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
        // save new order
        const { id, version, status, userId, ticket: { price } } = data;
        const order = Order.build({ id, version, status, userId, price });
        await order.save();

        // ack the message
        msg.ack();
    }
};