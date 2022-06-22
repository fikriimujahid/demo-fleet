import { Publisher, BidCancelledEvent, Channels } from "@demo-lib/common";

export class BidCancelledPublisher extends Publisher<BidCancelledEvent> {
    channel: Channels.BidCancelled = Channels.BidCancelled;
}