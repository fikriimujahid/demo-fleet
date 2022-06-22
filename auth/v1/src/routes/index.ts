import { Router } from 'express';
import usersRouter from './user.routes';

const routes = Router();

routes.use('/v1/users', usersRouter);

export default routes;