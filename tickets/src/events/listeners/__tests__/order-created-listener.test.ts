import mongoose from 'mongoose';
import { OrderCreatedEvent, OrderStatus } from '@actvalue/common';
import { OrderCreatedListener } from "../order-created-listener";
import { natsWrapper } from '../../../nats-wrapper';
import { Ticket } from '../../../models/ticket';
import { Message } from 'node-nats-streaming';

const setup = async () => {
    // create an instance of the listener
    const listener = new OrderCreatedListener(natsWrapper.client);

    // create and save a ticket
    const ticket = Ticket.build({
        title: 'Ticket Title',
        price: 100,
        userId: 'userId'
    });
    await ticket.save();

    // create the fake data event
    const data: OrderCreatedEvent['data'] = {
        id: mongoose.Types.ObjectId().toHexString(),
        version: 0,
        status: OrderStatus.Created,
        userId: 'userId',
        expiresAt: '123 456',
        ticket: {
            id: ticket.id,
            price: ticket.price
        }
    };

    //create the fake event
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    };

    // return all the values
    return { listener, ticket, data, msg };
};

it('sets the userid of the ticket', async () => {
    const { listener, ticket, data, msg } = await setup();
    await listener.onMessage(data, msg);

    const updatedTicket = await Ticket.findById(ticket.id);
    expect(updatedTicket!.orderId).toEqual(data.id);
});

it('acks the message', async () => {
    const { listener, data, msg } = await setup();
    await listener.onMessage(data, msg);
    
    expect(msg.ack).toHaveBeenCalled();
});

it('publishes a ticket update event', async () => {
    const { listener, data, msg } = await setup();
    await listener.onMessage(data, msg);

    expect(natsWrapper.client.publish).toHaveBeenCalled();

    const ticketUpdatedData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1]);
    expect(data.id).toEqual(ticketUpdatedData.orderId);
});