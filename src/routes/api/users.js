import mongoose from 'mongoose';
import { Router } from 'express';
import passport from 'passport';
import auth from '../auth';


const routes = Router();
const User = mongoose.model('User');


// POST: /users
// eslint-disable-next-line consistent-return
routes.post('/users', (req, res, next) => {
  if (!req.body.user.password) {
    return res.status(422).json({ errors: { password: "Can't be blank" } });
  }

  if (req.body.user.password.length < 5) {
    return res.status(422).json({ errors: { password: 'Must be at least 5 characters' } });
  }

  const user = new User();

  user.username = req.body.user.username;
  user.email = req.body.user.email;
  user.setPassword(req.body.user.password);

  user.save().then(() => res.json({ user: user.toAuthJSON() })).catch(next);
});


// POST: /users/login
// eslint-disable-next-line consistent-return
routes.post('/users/login', (req, res, next) => {
  if (!req.body.user.email) {
    return res.status(422).json({ errors: { email: 'Can\'t be blank' } });
  }

  if (!req.body.user.password) {
    return res.status(422).json({ errors: { password: 'Can\'t be blank' } });
  }

  passport.authenticate('local', { session: false }, (err, user, info) => {
    if (err) { return next(err); }

    if (user) {
      const newUser = user;
      newUser.token = user.generateJWT();
      return res.json({ user: user.toAuthJSON() });
    }
    return res.status(422).json(info);
  })(req, res, next);
});


// GET: /user
routes.get('/user', auth.required, (req, res, next) => {
  User.findById(req.payload.id).then((user) => {
    if (!user) { return res.sendStatus(401); }

    return res.json({ user: user.toAuthJSON() });
  }).catch(next);
});


// PUT: /user
routes.put('/user', auth.required, (req, res, next) => {
  User.findById(req.payload.id).then((user) => {
    if (!user) { return res.sendStatus(401); }
    const newUser = user;

    // only update fields that was modified
    if (typeof req.body.user.username !== 'undefined') {
      newUser.username = req.body.user.username;
    }
    if (typeof req.body.user.email !== 'undefined') {
      newUser.email = req.body.user.email;
    }
    if (typeof req.body.user.password !== 'undefined') {
      if (req.body.user.password.length < 5) {
        return res.status(422).json({ errors: { password: 'Must be at least 5 characters' } });
      }
      user.setPassword(req.body.user.password);
    }

    return user.save().then(() => res.json({ user: user.toAuthJSON() }));
  }).catch(next);
});


export default routes;
