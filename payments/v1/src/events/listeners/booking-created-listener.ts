import { Message } from 'node-nats-streaming';
import { Channels, Listener, BookingCreatedEvent } from '@demo-lib/common';
import { Booking } from '../../models/booking';
import { queueGroupName } from './queue-group-name';

export class BookingCreatedListener extends Listener<BookingCreatedEvent> {
    readonly channel = Channels.BookingCreated;
    queueGroupName = queueGroupName;

    async onMessage(data: BookingCreatedEvent['data'], msg: Message){
        const {id, net_weight, price, status, user_id, version} = data;

        const booking = Booking.build({
            id,
            version,
            user_id,
            net_weight,
            price,
            status,
        })
        await booking.save();

        msg.ack();
    }
}