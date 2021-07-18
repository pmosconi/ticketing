import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { TicketCreatedEvent } from '@actvalue/common';
import { TicketCreatedListener } from '../ticket-created-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { Ticket } from '../../../models/ticket';

const setup = async () => {
    // create an instance of the listener
    const listener = new TicketCreatedListener(natsWrapper.client);

    // create a fake data event
    const data: TicketCreatedEvent['data'] = {
        id: new mongoose.Types.ObjectId().toHexString(),
        version: 0,
        title: 'concert',
        price: 100,
        userId: new mongoose.Types.ObjectId().toHexString(),
    };

    // create a fake message object
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    };

    return { listener, data, msg };
};


it('creates and saves a ticket', async () => {
    const { listener, data, msg } = await setup();

    // call the onMessage function with data and message objects
    await listener.onMessage(data, msg);

    // assert that the listener created a ticket
    const tickets = await Ticket.findById(data.id);
    expect(tickets).toBeDefined();
    expect(tickets!.title).toEqual(data.title);
    expect(tickets!.price).toEqual(data.price);

});

it('acks the message', async () => {
    const { listener, data, msg } = await setup();

    // call the onMessage function with data and message objects
    await listener.onMessage(data, msg);

    // write assertions to make sure the ack was called
    expect(msg.ack).toHaveBeenCalled();
});