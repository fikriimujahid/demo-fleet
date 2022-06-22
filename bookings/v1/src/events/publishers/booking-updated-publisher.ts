import { Publisher, Channels, BookingUpdatedEvent } from "@demo-lib/common";

export class BookingUpdatedPublisher extends Publisher<BookingUpdatedEvent>{
    readonly channel = Channels.BookingUpdated;
}