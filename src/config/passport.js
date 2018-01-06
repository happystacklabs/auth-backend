import passport from 'passport';
import mongoose from 'mongoose';


const LocalStrategy = require('passport-local').Strategy;

const User = mongoose.model('User');


// define the local strategy
passport.use(new LocalStrategy({
  usernameField: 'user[email]',
  passwordField: 'user[password]',
}, (email, password, done) => {
  // find user by email
  User.findOne({ email }).then((user) => {
    // handle error if no user found or invalid password
    if (!user || !user.validPassword(password)) {
      return done(null, false, { errors: { 'email or password': 'Is invalid' } });
    }

    // return the user
    return done(null, user);
  }).catch(done);
}));
