import { Listener, Channels, ExpirationCompleteEvent, BidStatus} from "@demo-lib/common";
import { Message } from "node-nats-streaming";
import { Bid } from "../../models/bid";
import { BidCancelledPublisher } from "../publishers/bid-cancelled-publisher";
import { queueGroupName } from "./queue-group-name";

export class ExpirationCompleteListener extends Listener<ExpirationCompleteEvent> {
    readonly channel= Channels.ExpirationComplate;
    queueGroupName = queueGroupName;

    async onMessage(data: ExpirationCompleteEvent['data'], msg: Message) {
        const bid = await Bid.findById(data.bidId).populate('booking');

        if(!bid){
            throw new Error('Bid not found');
        }

        bid.set({ status: BidStatus.TRANSPORTER_REJECTED });
        await bid.save();

        await new BidCancelledPublisher(this.client).publish({
            id: bid.id,
            version: bid.version,
            booking: {
                id: bid.booking.id
            }
        });

        msg.ack();
    }
}