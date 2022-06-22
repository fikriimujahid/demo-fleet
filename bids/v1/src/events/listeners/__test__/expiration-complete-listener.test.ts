import { BidStatus, ExpirationCompleteEvent } from "@demo-lib/common";
import mongoose from "mongoose";
import { Bid } from "../../../models/bid";
import { Booking } from "../../../models/booking";
import { natsWrapper } from "../../../nats-wrapper"
import { ExpirationCompleteListener } from "../expiration-complete-listener"
import { Message } from 'node-nats-streaming';

const setup = async () => {
    const listener = new ExpirationCompleteListener(natsWrapper.client);

    const booking = Booking.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        net_weight: 10,
        trucking_note: 'test'
    });
    await booking.save();

    const bid = Bid.build({
        status:BidStatus.ON_REVIEW,
        userId: 'asfdad',
        expiresAt: new Date(),
        booking
    });
    await bid.save();

    const data: ExpirationCompleteEvent['data'] = {
        bidId: bid.id
    }

    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }

    return { listener, bid, booking, data, msg};
};

it('updates the bid status to cancelled', async () => {
    const { listener, bid, data, msg} = await setup();

    await listener.onMessage(data, msg);

    const updateBid = await Bid.findById(bid.id);
    expect(updateBid?.status).toEqual(BidStatus.TRANSPORTER_REJECTED);
});

it('emit an BidCancelled event', async () => {
    const { listener, bid, data, msg} = await setup();

    await listener.onMessage(data, msg);

    expect(natsWrapper.client.publish).toHaveBeenCalled();

    const eventData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1]);
    expect(eventData.id).toEqual(bid.id);
});

it('ack the message', async () => {
    const { listener, data, msg} = await setup();

    await listener.onMessage(data,msg);
    expect(msg.ack).toHaveBeenCalled();
})