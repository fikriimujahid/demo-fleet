import { Message } from 'node-nats-streaming';
import { Channels, Listener, BookingCreatedEvent } from '@demo-lib/common';
import { Booking } from '../../models/booking';
import { queueGroupName } from './queue-group-name';

export class BookingCreatedListener extends Listener<BookingCreatedEvent> {
    readonly channel = Channels.BookingCreated;
    queueGroupName = queueGroupName;

    async onMessage(data: BookingCreatedEvent['data'], msg: Message){
        const {id, net_weight, trucking_note} = data;

        const booking = Booking.build({
            id,
            net_weight,
            trucking_note
        })
        await booking.save();

        msg.ack();
    }
}