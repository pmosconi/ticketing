import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { TicketUpdatedEvent } from '@actvalue/common';
import { TicketUpdatedListener } from '../ticket-updated-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { Ticket } from '../../../models/ticket';

const setup = async () => {
    // create an instance of the listener
    const listener = new TicketUpdatedListener(natsWrapper.client);

    // create and save a ticket
    const ticket = Ticket.build({
        id: mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 20
    });
    await ticket.save();

    // create a fake data event
    const data: TicketUpdatedEvent['data'] = {
        id: ticket.id,
        version: ticket.version + 1,
        title: 'new concert',
        price: 999,
        userId: new mongoose.Types.ObjectId().toHexString(),
    };

    // create a fake message object
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    };

    return { listener, data, msg, ticket };
};


it('finds, updates and saves a ticket', async () => {
    const { listener, data, msg, ticket } = await setup();

    // call the onMessage function with data and message objects
    await listener.onMessage(data, msg);

    // assert that the listener created a ticket
    const updatedTicket = await Ticket.findById(ticket.id);
    expect(updatedTicket!.title).toEqual(data.title);
    expect(updatedTicket!.price).toEqual(data.price);

});

it('acks the message', async () => {
    const { listener, data, msg } = await setup();

    // call the onMessage function with data and message objects
    await listener.onMessage(data, msg);

    // write assertions to make sure the ack was called
    expect(msg.ack).toHaveBeenCalled();
});

it('does not call ack if the event skips version number', async () => {
    const { listener, data, msg } = await setup();
    data.version = 20;
    try {
        await listener.onMessage(data, msg);
    } catch (error) {}
    expect(msg.ack).not.toHaveBeenCalled();
});