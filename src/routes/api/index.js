import { Router } from 'express';
import userRoutes from './users';


const routes = Router();

routes.use('/', userRoutes);


routes.use((err, req, res, next) => {
  if (err.name === 'ValidationError') {
    return res.status(422).json({
      errors: Object.keys(err.errors).reduce((errors, key) => {
        // eslint-disable-next-line no-param-reassign
        errors[key] = err.errors[key].message;
        return errors;
      }, {}),
    });
  }

  return next(err);
});

export default routes;
