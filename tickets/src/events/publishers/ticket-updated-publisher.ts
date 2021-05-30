import { Publisher, Subjects, TicketUpdatedEvent } from '@actvalue/common';

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
    readonly subject = Subjects.TicketUpdated;
}
