import { Publisher, Subjects, OrderCancelledEvent } from '@actvalue/common';

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
    readonly subject = Subjects.OrderCancelled;
}
