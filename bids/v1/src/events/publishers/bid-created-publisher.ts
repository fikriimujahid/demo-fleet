import { Publisher, BidCreatedEvent, Channels } from "@demo-lib/common";

export class BidCreatedPublisher extends Publisher<BidCreatedEvent> {
    channel: Channels.BidCreated = Channels.BidCreated;
}