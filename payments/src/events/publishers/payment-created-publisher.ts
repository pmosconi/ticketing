import { Publisher, Subjects, PaymentCreatedEvent } from '@actvalue/common';

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
    readonly subject = Subjects.PaymentCreated;
}
