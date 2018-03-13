import mongoose from 'mongoose';
import { Router } from 'express';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import mailgun from 'mailgun-js';
import async from 'async';
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
  user.setPassword(req.body.password);

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
routes.put('/user', auth.required, (req, res, next) => {
  User.findById(req.payload.id).then((user) => {
    if (!user) { return res.sendStatus(401); }

    // only update fields that was modified
    if (typeof req.body.username !== 'undefined') {
      user.username = req.body.username;
    }
    if (typeof req.body.email !== 'undefined') {
      user.email = req.body.email;
    }
    if (typeof req.body.password !== 'undefined' && req.body.password !== '') {
      if (req.body.password.length < 5) {
        return res.status(422).json({ errors: { password: { msg: 'Must be at least 5 characters' } } });
      }
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
routes.post('/users/forgot', [
  check('email').exists().withMessage('Can\'t be blank'),
  check('email').isEmail().withMessage('Is invalid'),
  sanitize('email').normalizeEmail({ remove_dots: false }),
], (req, res, next) => {
  // error handling
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.mapped() });
  }

  return async.waterfall([
    (done) => {
      // generate a reset token
      crypto.randomBytes(16, (err, buffer) => {
        const token = buffer.toString('hex');
        done(err, token);
      });
    },
    (token, done) => {
      // search for the user by email else show error
      User.findOne({ email: req.body.email }, (error, user) => {
        if (!user) {
          return res.status(422).json({ errors: { email: { msg: 'The email address is not associated with any account.' } } });
        }
        // add the reset token with expiration
        user.passwordResetToken = token;
        user.passwordResetExpires = Date.now() + 3600000; // expire in 1 hour
        return user.save(err => done(err, token, user));
      });
    },
    (token, user) => {
      const mg = mailgun({
        apiKey: process.env.MAILGUN_API_KEY,
        domain: process.env.MAILGUN_DOMAIN,
      });

      const data = {
        from: 'Support <support@happystack.io>',
        to: user.email,
        subject: '✔ Reset your password',
        text: `You are receiving this email because you (or someone else) have requested the reset of the password for your account.\n\n
              Please click on the following link, or paste this into your browser to complete the process:\n\n
              http://boilerplate.happys/password/reset/${token}\n\n
              If you did not request this, please ignore this email and your password will remain unchanged.\n`,
      };

      mg.messages().send(data, () => res.status(200).json({ msg: 'sent' }));
    },
  ]);
});


/*------------------------------------------------------------------------------
  POST: /users/reset
-------------------------------------------------------------------------------*/
routes.post('/users/reset', [
  check('password').isLength({ min: 5 }).withMessage('Must be at least 5 characters'),
  check('passwordConfirm').isLength({ min: 5 }).withMessage('Must be at least 5 characters'),
  check('passwordConfirm').custom((value, { req }) => value === req.body.password)
    .withMessage('Passwords must match'),
], (req, res, next) => {
  // error handling
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.mapped() });
  }

  return async.waterfall([
    (done) => {
      User.findOne({ passwordResetToken: req.body.token })
        .where('passwordResetExpires').gt(Date.now())
        .exec((err, user) => {
          if (!user) {
            return res.status(422).json({
              errors: { token: { msg: 'Password reset token is invalid or has expired' } },
            });
          }
          user.setPassword(req.body.password);
          user.passwordResetToken = undefined;
          user.passwordResetExpires = undefined;
          return user.save().then(() => {
            done(err, user);
          });
        });
    },
    (user) => {
      const mg = mailgun({
        apiKey: process.env.MAILGUN_API_KEY,
        domain: process.env.MAILGUN_DOMAIN,
      });

      const data = {
        from: 'Support <support@happystack.io>',
        to: user.email,
        subject: '✔ Your password has been changed',
        text: 'This is a confirmation that the password for your account has just been changed\n\n',
      };

      mg.messages().send(data, (error, body) => res.status(200).json(body));
    },
  ]);
});

/*------------------------------------------------------------------------------
  POST: /user/avatar
-------------------------------------------------------------------------------*/
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    crypto.pseudoRandomBytes(16, (err, raw) => {
      if (err) return cb(err);
      return cb(null, raw.toString('hex') + path.extname(file.originalname));
    });
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.includes('jpg') || file.mimetype.includes('png') || file.mimetype.includes('jpeg')) {
    cb(null, true);
  } else {
    cb(new Error('Must be a JPG or PNG'), false);
  }
};

const upload = multer({ storage, fileFilter }).single('file');

routes.post('/user/avatar', auth.required, (req, res, next) => {
  upload(req, res, (err) => {
    if (err) {
      if (err.message === 'Must be a JPG or PNG') {
        return res.status(422).json({
          errors: { file: { msg: 'Must be a JPG or PNG' } },
        });
      }
    }

    return User.findById(req.payload.id).then((user) => {
      if (!user) { return res.sendStatus(401); }
      if (user.avatar !== undefined) {
        const filePath = path.join(__dirname, `../../../uploads/${user.avatar.split('uploads/')[1]}`);
        fs.unlinkSync(filePath);
      }
      user.avatar = `${req.protocol}://${req.hostname}:3001/${req.file.path}`;
      return user.save().then(() => {
        res.status(200).json({
          url: `${req.protocol}://${req.hostname}/${req.file.path}`,
          path: req.file.path,
          currentUser: user.toAuthJSON(),
        });
      });
    }).catch(next);
  });
});


/*------------------------------------------------------------------------------
  DELETE: /user/avatar
-------------------------------------------------------------------------------*/
routes.delete('/user/avatar', auth.required, (req, res, next) => {
  User.findById(req.payload.id).then((user) => {
    if (!user) { return res.sendStatus(401); }
    if (user.avatar !== undefined) {
      const filePath = path.join(__dirname, `../../../uploads/${user.avatar.split('uploads/')[1]}`);
      fs.unlinkSync(filePath);
    }

    user.avatar = undefined;
    return user.save().then(() => {
      res.status(200).json({
        currentUser: user.toAuthJSON(),
      });
    });
  }).catch(next);
});

export default routes;
