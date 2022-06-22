import Queue from "bull";
import { ExpirationCompletePublisher } from "../events/publishers/expiration-complete-publish";
import { natsWrapper } from "../nats-wrapper";

interface Payload {
    bidId: string;
}

const expirationQueue = new Queue<Payload>('bid:expiration', {
   redis:{
    host: process.env.REDIS_HOST,
    port: 6379,
   },
});

expirationQueue.process(async (job) => {
    return await new ExpirationCompletePublisher(natsWrapper.client).publish({
        bidId: job.data.bidId
    });
});

export { expirationQueue };