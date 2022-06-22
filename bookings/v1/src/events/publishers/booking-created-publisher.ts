import { Publisher, Channels, BookingCreatedEvent } from "@demo-lib/common";

export class BookingCreatedPublisher extends Publisher<BookingCreatedEvent>{
    readonly channel = Channels.BookingCreated;
}