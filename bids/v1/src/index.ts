import mongoose from 'mongoose';
import { app } from './app';
import { BookingCreatedListener } from './events/listeners/booking-created-listener';
import { BookingUpdatedListener } from './events/listeners/booking-updated-listener';
import { ExpirationCompleteListener } from './events/listeners/expiration-complete-listener';
import { natsWrapper } from './nats-wrapper';

const start = async () => {
  console.log('starting..');
  if(!process.env.JWT_KEY){
    throw new Error('JWT KEY not defined');
  }
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI must be defined');
  }
  if (!process.env.NATS_CLIENT_ID) {
    throw new Error('NATS_CLIENT_ID must be defined');
  }
  if (!process.env.NATS_URL) {
    throw new Error('NATS_URL must be defined');
  }
  if (!process.env.NATS_CLUSTER_ID) {
    throw new Error('NATS_CLUSTER_ID must be defined');
  }

  try{
    await natsWrapper.connect(
      process.env.NATS_CLUSTER_ID,
      process.env.NATS_CLIENT_ID,
      process.env.NATS_URL
    );
    natsWrapper.client.on('close', () => {
      console.log('NATS connection closed!');
      process.exit();
    });
    process.on('SIGINT', () => natsWrapper.client.close());
    process.on('SIGTERM', () => natsWrapper.client.close());

    new BookingCreatedListener(natsWrapper.client).listen();
    new BookingUpdatedListener(natsWrapper.client).listen();
    new ExpirationCompleteListener(natsWrapper.client).listen();

    await mongoose.connect(process.env.MONGO_URI); 
    console.log('mongodb connected')
  } catch (err) {
    console.log(err)
  }

  app.listen(3000, () => {
    console.log("Listening on port 3000");
  });
};

start();