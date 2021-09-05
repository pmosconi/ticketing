import { Publisher, Subjects, ExpirationCompleteEvent } from '@actvalue/common';

export class ExpirationCompletedPublisher extends Publisher<ExpirationCompleteEvent> {
    readonly subject = Subjects.ExpirationComplete;
}
