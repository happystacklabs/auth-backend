import { Router } from 'express';
import userRoutes from './users';


const routes = Router();


// add users routes
routes.use('/', userRoutes);


// error handler middleware for ValidationError
routes.use((err, req, res, next) => {
  if (err.name === 'ValidationError') {
    return res.status(422).json({
      errors: Object.keys(err.errors).reduce((errors, key) => {
        const newErrors = errors;
        newErrors[key] = err.errors[key].message;
        return newErrors;
      }, {}),
    });
  }

  return next(err);
});


export default routes;
