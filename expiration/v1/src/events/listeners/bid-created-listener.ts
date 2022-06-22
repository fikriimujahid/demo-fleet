import { Listener, BidCreatedEvent, Channels, BidStatus } from "@demo-lib/common";
import { Message } from "node-nats-streaming";
import { expirationQueue } from "../../queues/expiration-queue";
import { queueGroupName } from "./queue-group-name";

export class BidCreatedListener extends Listener<BidCreatedEvent> {
    readonly channel= Channels.BidCreated;
    queueGroupName = queueGroupName;

    async onMessage(data: BidCreatedEvent['data'], msg: Message) {
        const delay = new Date(data.expiresAt).getTime() - new Date().getTime();
        const jobOptions = {
            removeOnComplete: true, // remove job if complete
            delay: delay, // 1 = 60000 min in ms
            attempts: 3 // attempt if job is error retry 3 times
        };        
        console.log(`Waiting ${data.id} this to process the job in miliseconds: `, jobOptions.delay);

        await expirationQueue.add({bidId: data.id},jobOptions);
        // console.log(add);
        msg.ack();
    }
}