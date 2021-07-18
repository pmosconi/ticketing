import { Message } from 'node-nats-streaming';
import { Subjects, Listener, TicketUpdatedEvent } from '@actvalue/common';
import { Ticket } from '../../models/ticket';
import { queueGroupName } from './queue-group-names';

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
    readonly subject = Subjects.TicketUpdated;
    queueGroupName = queueGroupName;

    async onMessage(data: TicketUpdatedEvent['data'], msg: Message) {
        const ticket = await Ticket.findByEvent(data);
        if (!ticket) {
            throw new Error('ticket not found');
        }
        const { title, price } = data;
        ticket.set({ title, price });
        // no plugin
        // const { title, price, version } = data;
        // ticket.set({ title, price, version });
        await ticket.save();
        msg.ack();
    }
}