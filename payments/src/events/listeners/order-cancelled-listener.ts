import { Message } from 'node-nats-streaming';
import { Listener, OrderCancelledEvent, OrderStatus, Subjects } from '@actvalue/common';
import { queueGroupName } from './queue-group-names';
import { Order } from '../../models/order';

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
    readonly subject = Subjects.OrderCancelled;
    queueGroupName = queueGroupName;

    async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
        // find and update order
        const order = await Order.findByEvent(data);

        if (!order) {
            throw new Error(`Order with id ${data.id} and version ${data.version -1} not found`);
        }
        order.set({ status: OrderStatus.Cancelled });
        await order.save();

        // ack the message
        msg.ack();
    }
};