import { Ticket } from "../ticket";

it('implements optimistic concurrency control', async () => {
    // create an instance of a ticket
    const ticket = Ticket.build({
        title: 'Titolo',
        price: 2,
        userId: '124'
    });

    // save the ticket to db
    await ticket.save();

    // fetch it twice
    const firstInstance = await Ticket.findById(ticket.id);
    const secondInstance = await Ticket.findById(ticket.id);

    // make 2 separate changes
    firstInstance!.set({ price: 10 });
    secondInstance!.set({ price: 20 });

    // save first changed ticket -> OK
    await firstInstance!.save();

    // save second changed ticket -> error
    try {
        await secondInstance!.save();
    } catch (error) {
        return;
    }
    throw new Error('Should not get here!');
    // expect(() => secondInstance!.save()).toThrow();
    
});

it('increments the version number on multiple saves', async () => {
    // create an instance of a ticket
    const ticket = Ticket.build({
        title: 'Titolo',
        price: 2,
        userId: '124'
    });

    // save the ticket to db
    await ticket.save();
    expect(ticket.version).toEqual(0);

    // save the ticket to db
    await ticket.save();
    expect(ticket.version).toEqual(1);

    // save the ticket to db
    await ticket.save();
    expect(ticket.version).toEqual(2);
});