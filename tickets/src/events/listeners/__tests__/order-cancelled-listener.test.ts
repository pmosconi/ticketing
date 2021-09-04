import mongoose from 'mongoose';
import { OrderCancelledEvent, OrderStatus } from '@actvalue/common';
import { OrderCancelledListener } from "../order-cancelled-listener";
import { natsWrapper } from '../../../nats-wrapper';
import { Ticket } from '../../../models/ticket';
import { Message } from 'node-nats-streaming';

const setup = async () => {
    // create an instance of the listener
    const listener = new OrderCancelledListener(natsWrapper.client);

    const orderId = mongoose.Types.ObjectId().toHexString();

    // create and save a ticket
    const ticket = Ticket.build({
        title: 'Ticket Title',
        price: 100,
        userId: 'userId'
    });
    ticket.set({ orderId });
    await ticket.save();

    // create the fake data event
    const data: OrderCancelledEvent['data'] = {
        id: orderId,
        version: 0,
        ticket: {
            id: ticket.id
        }
    };

    //create the fake event
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    };

    // return all the values
    return { listener, ticket, data, msg, orderId };
};

it('updates the ticket, publishes and event and acks the message', async () => {
    const { listener, ticket, data, msg, orderId } = await setup();
    await listener.onMessage(data, msg);

    const updatedTicket = await Ticket.findById(ticket.id);
    expect(updatedTicket!.orderId).not.toBeDefined();
    expect(msg.ack).toHaveBeenCalled();
    expect(natsWrapper.client.publish).toHaveBeenCalled();

    const ticketUpdatedData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1]);
    expect(ticketUpdatedData.id).toEqual(data.ticket.id);
});