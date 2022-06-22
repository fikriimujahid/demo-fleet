import { Listener, BidCreatedEvent, Channels, BidStatus } from "@demo-lib/common";
import { Message } from "node-nats-streaming";
import { Booking } from "../../models/booking";
import { BookingUpdatedPublisher } from "../publishers/booking-updated-publisher";
import { queueGroupName } from "./queue-group-name";

export class BidCreatedListener extends Listener<BidCreatedEvent> {
    readonly channel= Channels.BidCreated;
    queueGroupName = queueGroupName;

    async onMessage(data: BidCreatedEvent['data'], msg: Message) {
        const booking = await Booking.findById(data.booking.id);

        if(!booking){
            throw new Error('Booking not found');
        }

        let bid_count = 1;
        if(!isNaN(booking.bid_count!)){
            bid_count = booking.bid_count!+1;
        }
        booking.set({ bid_count: bid_count});

        await booking.save();
        await new BookingUpdatedPublisher(this.client).publish({
            id: booking.id,
            user_id: booking.user_id, 
            net_weight: booking.net_weight, 
            trucking_note: booking.trucking_note,
            version: booking.version
        });

        msg.ack();
    }
}