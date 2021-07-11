import { Message } from 'node-nats-streaming';
import { Subjects, Listener, TicketUpdatedEvent } from '@actvalue/common';
import { Ticket } from '../../models/ticket';
import { queueGroupName } from './queue-group-names';

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
    readonly subject = Subjects.TicketUpdated;
    queueGroupName = queueGroupName;

    async onMessage(data: TicketUpdatedEvent['data'], msg: Message) {
        const { id, title, price } = data;
        const ticket = await Ticket.findById(id);
        if (!ticket) {
            throw new Error('ticket not found');
        }
        ticket.set({ title, price });
        await ticket.save();
        msg.ack();
    }
}