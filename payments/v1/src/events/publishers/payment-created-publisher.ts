import { Publisher, Channels, PaymentCreatedEvent } from "@demo-lib/common";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
    readonly channel = Channels.PaymentCreated;
}