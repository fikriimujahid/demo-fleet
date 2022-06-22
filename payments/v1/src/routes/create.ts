import { BadRequestError, BookingStatus, NotAuthorizedError, NotFoundError, requireAuth, validateRequest } from '@demo-lib/common';
import { body } from 'express-validator';
import express, {Request, Response} from 'express';
import { Booking } from '../models/booking';
import { stripe } from '../stripe';
import { Payment } from '../models/payment';
import { PaymentCreatedPublisher } from '../events/publishers/payment-created-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.post(
    '/v1/payments',
    requireAuth,
    [body('token').not().isEmpty(), body('bookingId').not().isEmpty()],
    validateRequest,
    async (req: Request, res: Response) => {
        const { token, bookingId } = req.body;

        const booking = await Booking.findById(bookingId);

        if(!booking){
            throw new NotFoundError();
        }

        if(booking.user_id !== req.currentUser?.id){
            throw new NotAuthorizedError();
        }

        if(booking.status === BookingStatus.FINISHED){
            throw new BadRequestError('Cannot pay for an finished booking');
        }

        const charge = await stripe.charges.create({
            currency: 'sgd',
            amount: booking.price * 100,
            source: token
        });

        const payment = Payment.build({
            bookingId,
            stripeId: charge.id
        });
        await payment.save();

        new PaymentCreatedPublisher(natsWrapper.client).publish({
            id: payment.id,
            bookingId: payment.bookingId,
            stripeId: payment.stripeId
        });
        
        res.status(201).send({ success: true });
    }
);

export { router as createChargeRouter };