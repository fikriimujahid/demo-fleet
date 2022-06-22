import { Message } from 'node-nats-streaming';
import { Channels, Listener, BookingUpdatedEvent } from "@demo-lib/common";
import { Booking } from '../../models/booking';
import { queueGroupName } from './queue-group-name';

export class BookingUpdatedListener extends Listener<BookingUpdatedEvent>{
    readonly channel = Channels.BookingUpdated;
    queueGroupName = queueGroupName;

    async onMessage(data: BookingUpdatedEvent['data'], msg: Message){
        const booking = await Booking.findByEvent(data);

        if(!booking){
            throw new Error('booking not found!');
        }

        const {id, net_weight, trucking_note, version} = data;
        booking.set({id,net_weight, trucking_note, version});
        await booking.save();

        msg.ack();
    }
}