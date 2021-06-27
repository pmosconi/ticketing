import mongoose from 'mongoose';
import express, { Request, Response } from 'express';
import { BadRequestError, NotFoundError, OrderStatus, requireAuth, validateRequest } from '@actvalue/common';
import { body } from 'express-validator';
import { Ticket } from '../models/ticket';
import { Order } from '../models/order';

const router = express.Router();

const EXPIRATION_WINDOW_SECONDS = 15 * 60;

router.post('/api/orders', requireAuth, [
    body('ticketId')
        .not().isEmpty()
        .custom((input: string) => mongoose.Types.ObjectId.isValid(input)) // assumption: using MongoDb
        .withMessage('Ticket Id must be provided')
], validateRequest, async (req: Request, res: Response) => {
    const { ticketId } = req.body;

    // find the ticket the user tries to order
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
        throw new NotFoundError();
    }

    // make sure ticket is not reserved
    const isReserved = await ticket.isReserved();
    if (isReserved) {
        throw new BadRequestError('Ticket is alredy reserved');
    }

    // calculate expiration date
    const expiration = new Date();
    expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS);

    // build the order and save to db
    const order = Order.build({
        userId: req.currentUser!.id,
        status: OrderStatus.Created,
        expiresAt: expiration,
        ticket
    });
    await order.save();

    // publish order-created event

    return res.status(201).send(order);
});

export { router as newOrderRouter };