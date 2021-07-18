import { Message } from 'node-nats-streaming';
import { Listener, OrderCreatedEvent, Subjects } from '@actvalue/common';
import { queueGroupName } from './queue-group-names';
import { Ticket } from '../../models/ticket';
import { TicketUpdatedPublisher  } from '../publishers/ticket-updated-publisher';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    readonly subject = Subjects.OrderCreated;
    queueGroupName = queueGroupName;

    async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
        // find the ticket that the order was created for
        const ticket = await Ticket.findById(data.ticket.id);

        // if no ticket throw an error
        if (!ticket) {
            throw new Error(`Ticket with id ${data.ticket.id} not found`);
        }

        // mark the ticket as reserved by setting orderId to the order id
        ticket.set({ orderId: data.id });

        // save the ticket
        await ticket.save();

        // publish the updated ticket
        await new TicketUpdatedPublisher(this.client).publish({ 
            id: ticket.id,
            price: ticket.price,
            title: ticket.title,
            userId: ticket.userId,
            version: ticket.version,
            orderId: ticket.orderId,
         });

        // ack the message
        msg.ack();
    }
};