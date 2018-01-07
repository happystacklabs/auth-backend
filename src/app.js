/* eslint-disable import/first */
const opbeat = require('opbeat').start();

import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import helmet from 'helmet';
import errorhandler from 'errorhandler';
import cors from 'cors';
import session from 'express-session';
// eslint-disable-next-line no-unused-vars
import User from './models/User';
import routes from './routes';


// environment constants
require('dotenv').config();


export const app = express();


// configure Raven logging
const Raven = require('raven');


// Must configure Raven before doing anything else with it
Raven.config(process.env.SENTRY).install();

// The request handler must be the first middleware on the app
app.use(Raven.requestHandler());


// activate security headers
app.use(helmet());


// configure cors
app.use(cors({ origin: process.env.CORS }));


// Configuration
app.use(require('morgan')('dev'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(session({
  secret: process.env.SESSION_SECRET,
  cookie: { maxAge: 60000 },
  resave: false,
  saveUninitialized: false,
}));


// check if production env
const isProduction = process.env.NODE_ENV === 'production';


// set error handler
if (!isProduction) {
  app.use(errorhandler());
}


// Configure mongoose
mongoose.connect(process.env.MONGODB_URI, {
  useMongoClient: true,
});


// passport
require('./config/passport');


// Routes
app.use('/', routes);


// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});


// The error handler must be before any other error middleware
app.use(Raven.errorHandler());


// opbeat performance monitoring
app.use(opbeat.middleware.express());


// development error handler
// will print stacktrace
if (!isProduction) {
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.json({
      errors: {
        message: err.message,
        error: err,
      },
    });
  });
}


// production error handler
// no stacktraces leaked to user
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.json({
    errors: {
      message: err.message,
      error: {},
    },
  });
});


export default app;
