'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.app = undefined;

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _User = require('./models/User');

var _User2 = _interopRequireDefault(_User);

var _routes = require('./routes');

var _routes2 = _interopRequireDefault(_routes);

var _errorhandler = require('errorhandler');

var _errorhandler2 = _interopRequireDefault(_errorhandler);

var _cors = require('cors');

var _cors2 = _interopRequireDefault(_cors);

var _helmet = require('helmet');

var _helmet2 = _interopRequireDefault(_helmet);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// import session from 'express-session';


var app = exports.app = (0, _express2.default)();

// activate security headers
app.use((0, _helmet2.default)());

// configure cors
app.use((0, _cors2.default)({ origin: process.env.CORS || 'http://localhost:3000' }));

// Configuration
app.use(require('morgan')('dev'));
app.use(_bodyParser2.default.urlencoded({ extended: false }));
app.use(_bodyParser2.default.json());
// app.use(session({ secret: 'happystack', cookie: { maxAge: 60000 }, resave: false, saveUninitialized: false  }));


// check if production env
var isProduction = process.env.NODE_ENV === 'production';

// set error handler
if (!isProduction) {
  app.use((0, _errorhandler2.default)());
}

// Configure mongoose
if (isProduction) {
  _mongoose2.default.connect(process.env.MONGODB_URI, {
    useMongoClient: true
  });
} else {
  _mongoose2.default.connect('mongodb://127.0.0.1:27017/happystack', {
    useMongoClient: true
  });
  // mongoose.set('debug', true);
}

// passport
require('./config/passport');

// Routes
app.use('/', _routes2.default);

/// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// development error handler
// will print stacktrace
if (!isProduction) {
  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.json({ 'errors': {
        message: err.message,
        error: err
      } });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.json({ 'errors': {
      message: err.message,
      error: {}
    } });
});

exports.default = app;