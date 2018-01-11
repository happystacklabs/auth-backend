'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _expressJwt = require('express-jwt');

var _expressJwt2 = _interopRequireDefault(_expressJwt);

var _config = require('../config');

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getTokenFromHeader(req) {
  if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Token' || req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
    return req.headers.authorization.split(' ')[1];
  }

  return null;
}

var auth = {
  required: (0, _expressJwt2.default)({
    secret: _config2.default.secret,
    userProperty: 'payload',
    getToken: getTokenFromHeader
  }),
  optional: (0, _expressJwt2.default)({
    secret: _config2.default.secret,
    userProperty: 'payload',
    credentialRequired: false,
    getToken: getTokenFromHeader
  })
};

exports.default = auth;