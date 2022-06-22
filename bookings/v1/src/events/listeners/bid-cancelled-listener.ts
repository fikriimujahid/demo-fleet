import { Listener, BidCancelledEvent, Channels } from "@demo-lib/common";
import { Message } from "node-nats-streaming";
import { Booking } from "../../models/booking";
import { BookingUpdatedPublisher } from "../publishers/booking-updated-publisher";
import { queueGroupName } from "./queue-group-name";

export class BidCancelledListener extends Listener<BidCancelledEvent>{
    readonly channel= Channels.BidCancelled;
    queueGroupName= queueGroupName;

    async onMessage(data: BidCancelledEvent['data'], msg: Message) {
        const booking = await Booking.findById(data.booking.id);

        if(!booking){
            throw new Error('Booking not found');
        }

        let bid_count = 1;
        if(!isNaN(booking.bid_count!)){
            bid_count = booking.bid_count!-1;
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