'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = {
  secret: process.env.NODE_ENV === 'production' ? process.env.SECRET : 'secret'
};