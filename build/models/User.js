'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _mongooseUniqueValidator = require('mongoose-unique-validator');

var _mongooseUniqueValidator2 = _interopRequireDefault(_mongooseUniqueValidator);

var _crypto = require('crypto');

var _crypto2 = _interopRequireDefault(_crypto);

var _jsonwebtoken = require('jsonwebtoken');

var _jsonwebtoken2 = _interopRequireDefault(_jsonwebtoken);

var _config = require('../config/');

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// The schema
var UserSchema = new _mongoose2.default.Schema({
  username: {
    type: String,
    unique: true,
    lowercase: true,
    required: [true, 'Can\'t be blank'],
    match: [/^[a-zA-Z0-9]+$/, 'Is invalid'],
    minlength: [5, 'Must be at least 5 characters'],
    index: true
  },
  email: {
    type: String,
    unique: true,
    lowercase: true,
    required: [true, 'Can\'t be blank'],
    match: [/\S+@\S+\.\S+/, 'Is invalid'],
    index: true
  },
  hash: String,
  salt: String
}, { timestamps: true });

// Add the unique validation plugin
UserSchema.plugin(_mongooseUniqueValidator2.default, { message: 'Is already taken' });

// setPassword method
UserSchema.methods.setPassword = function (password) {
  this.salt = _crypto2.default.randomBytes(16).toString('hex');
  this.hash = _crypto2.default.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
};

// validPassword method
UserSchema.methods.validPassword = function (password) {
  var hash = _crypto2.default.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
  return hash === this.hash;
};

// generateJWT method
UserSchema.methods.generateJWT = function () {
  var today = new Date();
  var expiration = new Date(today.getDate() + 60);

  return _jsonwebtoken2.default.sign({
    id: this._id,
    username: this.username,
    expiration: parseInt(expiration.getTime() / 1000)
  }, _config2.default.secret);
};

// toAuthJSON method
UserSchema.methods.toAuthJSON = function () {
  return {
    username: this.username,
    email: this.email,
    token: this.generateJWT()
  };
};

var User = _mongoose2.default.model('User', UserSchema);

exports.default = User;