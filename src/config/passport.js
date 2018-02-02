import passport from 'passport';
import mongoose from 'mongoose';


const LocalStrategy = require('passport-local').Strategy;

const User = mongoose.model('User');


// define the local strategy
passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
}, (email, password, done) => {
  User.findOne({ email }).then((user) => {
    if (!user || !user.validPassword(password)) {
      return done(null, false, { errors: { 'email or password': { msg: 'Is invalid' } } });
    }

    return done(null, user);
  }).catch(done);
}));
