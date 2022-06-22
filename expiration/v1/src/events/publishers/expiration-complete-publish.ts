import { Channels, Publisher, ExpirationCompleteEvent,  } from "@demo-lib/common";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent>{
    readonly channel= Channels.ExpirationComplate;
}