'use strict';

var _passport = require('passport');

var _passport2 = _interopRequireDefault(_passport);

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var LocalStrategy = require('passport-local').Strategy;

var User = _mongoose2.default.model('User');

// define the local strategy
_passport2.default.use(new LocalStrategy({
  usernameField: 'user[email]',
  passwordField: 'user[password]'
}, function (email, password, done) {
  User.findOne({ email: email }).then(function (user) {
    if (!user || !user.validPassword(password)) {
      return done(null, false, { errors: { 'email or password': 'Is invalid' } });
    }

    return done(null, user);
  }).catch(done);
}));