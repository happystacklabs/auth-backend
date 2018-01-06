import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import errorhandler from 'errorhandler';
import cors from 'cors';
import helmet from 'helmet';
import routes from './routes';


// express app
const app = express();


// activate security headers
app.use(helmet());


// configure cors
app.use(cors({ origin: process.env.CORS || 'http://localhost:3000' }));


// add morgan for logging
app.use(require('morgan')('dev'));


// add bodyParser for transforming request's body into json
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


// check if production env
const isProduction = process.env.NODE_ENV === 'production';


// set error handler
if (!isProduction) {
  app.use(errorhandler());
}


// configure mongoose
if (isProduction) {
  mongoose.connect(process.env.MONGODB_URI, {
    useMongoClient: true,
  });
} else {
  mongoose.connect('mongodb://127.0.0.1:27017/happystack', {
    useMongoClient: true,
  });
  // mongoose.set('debug', true);
}


// require passport
require('./config/passport');


// add routes
app.use('/', routes);


// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});


// development error handler
// will print stacktrace
if (!isProduction) {
  app.use((err, req, res) => {
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
app.use((err, req, res) => {
  res.status(err.status || 500);
  res.json({
    errors: {
      message: err.message,
      error: {},
    },
  });
});


export default app;
