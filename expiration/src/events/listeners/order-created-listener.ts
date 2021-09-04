import { Message } from 'node-nats-streaming';
import { Listener, OrderCreatedEvent, Subjects } from '@actvalue/common';
import { queueGroupName } from './queue-group-names';
import { expirationQueue } from '../../queues/expiration-queue';


export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    readonly subject = Subjects.OrderCreated;
    queueGroupName = queueGroupName;

    async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
        await expirationQueue.add({
            orderId: data.id
        });

        // ack the message
        msg.ack();
    }
};