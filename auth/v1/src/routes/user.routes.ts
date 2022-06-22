import { Router, Request, Response } from 'express';
import { body } from "express-validator";
import Jwt from 'jsonwebtoken';

import { BadRequestError, validateRequest, currentUser } from '@demo-lib/common';
import { Password } from '../services/password';
import { User } from '../models/users';

const usersRouter = Router();

usersRouter.post('/signup', 
  [
    body("email").isEmail().withMessage("Email must be valid"),
    body("password").trim().isLength({ min: 4, max: 20 }).withMessage("Password must be between 4 and 20 characters"),
    // body("phone").trim().isNumeric().isLength({ min: 6, max: 10 }).withMessage("Phone must be number between 6 and 10 characters"),
  ],
  validateRequest, 
  async (req: Request, res: Response) => {
    const { name, email, password, phone } = req.body;
    const existingUser = await User.findOne({
      $or: [{'email': email}]
    });

    if(existingUser){
      throw new BadRequestError('User already exists')
    }

    const user = User.build({name, email, phone, password});
    await user.save();
    // user.set('password', undefined, {strict: false} );
    
    const userJWT = Jwt.sign(
      {
        id: user.id,
        email: user.email
      },
      process.env.JWT_KEY!
    );
    
    req.session = {
      jwt: userJWT
    }

    res.status(201).send(user);
  }
);

usersRouter.post('/signout', 
  (req: Request, res: Response) => {
    req.session = null;

    res.send({});
  }
);

usersRouter.post('/signin', 
  [
    body('email').isEmail().withMessage('Email must be valid'),
    body('password').trim().notEmpty().withMessage('Password is empty'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if(!existingUser) { throw new BadRequestError('Invalid Credentials')}

    const passwordMatch = await Password.compare(existingUser.password, password);
    if(!passwordMatch){throw new BadRequestError('Invalid Credentials')}

    const userJWT = Jwt.sign(
      {
        id: existingUser.id,
        email: existingUser.email
      },
      process.env.JWT_KEY!
    );

    req.session = {
      jwt: userJWT
    };

    res.status(200).send(existingUser);
  }
);

usersRouter.get('/current-user', 
  currentUser,
  (req, res) => {
    res.send({  currentUser: req.currentUser || null });
  }
);

export default usersRouter;