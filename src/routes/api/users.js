import mongoose from 'mongoose';
import { Router } from 'express';
import passport from 'passport';
import { check, validationResult } from 'express-validator/check';
import { matchedData, sanitize } from 'express-validator/filter';
import auth from '../auth';


const routes = Router();
const User = mongoose.model('User');


/*------------------------------------------------------------------------------
  POST: /users
------------------------------------------------------------------------------*/
routes.post('/users', [
  check('password').exists().withMessage('Can\'t be blank'),
  check('password').isLength({ min: 5 }).withMessage('Must be at least 5 characters'),
  check('email').exists().withMessage('Can\'t be blank'),
  check('email').isEmail().withMessage('Is invalid'),
  sanitize('email').normalizeEmail({ remove_dots: false }),
], (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.mapped() });
  }

  const user = new User();
  const reqUser = matchedData(req);
  user.username = req.body.username;
  user.email = reqUser.email;
  user.setPassword(reqUser.password);

  return user.save().then(() => {
    res.json(user.toAuthJSON());
  }).catch(next);
});


/*------------------------------------------------------------------------------
  POST: /users/login
------------------------------------------------------------------------------*/
routes.post('/users/login', [
  check('password').exists().withMessage('Can\'t be blank'),
  check('password').isLength({ min: 5 }).withMessage('Must be at least 5 characters'),
  check('email').exists().withMessage('Can\'t be blank'),
  check('email').isEmail().withMessage('Is invalid'),
  sanitize('email').normalizeEmail({ remove_dots: false }),
], (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.mapped() });
  }

  return passport.authenticate('local', { session: false }, (err, user, info) => {
    if (err) { return next(err); }

    if (user) {
      /* eslint-disable no-param-reassign */
      user.token = user.generateJWT();
      return res.json(user.toAuthJSON());
    }

    return res.status(422).json(info);
  })(req, res, next);
});


/*------------------------------------------------------------------------------
 GET: /user
-------------------------------------------------------------------------------*/
routes.get('/user', auth.required, (req, res, next) => {
  User.findById(req.payload.id).then((user) => {
    if (!user) { return res.sendStatus(401); }

    return res.json(user.toAuthJSON());
  }).catch(next);
});


/*------------------------------------------------------------------------------
  PUT: /user
-------------------------------------------------------------------------------*/
routes.put('/user', auth.required, [
  check('password').optional().isLength({ min: 5 }).withMessage('Must be at least 5 characters'),
  sanitize('email').normalizeEmail({ remove_dots: false }),
], (req, res, next) => {
  User.findById(req.payload.id).then((user) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.mapped() });
    }

    if (!user) { return res.sendStatus(401); }

    // only update fields that was modified
    if (typeof req.body.username !== 'undefined') {
      user.username = req.body.username;
    }
    if (typeof req.body.email !== 'undefined') {
      user.email = req.body.email;
    }
    if (typeof req.body.password !== 'undefined') {
      user.setPassword(req.body.password);
    }

    return user.save().then(() => {
      res.json(user.toAuthJSON());
    });
  }).catch(next);
});


/*------------------------------------------------------------------------------
  POST: /users/forgot
-------------------------------------------------------------------------------*/
// routes.post('/users/forgot', (req, res, next) => {
//
// });

export default routes;
