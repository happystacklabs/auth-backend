import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import User from './models/User';
import routes from './routes';
import errorhandler from 'errorhandler';
import cors from 'cors';
import helmet from 'helmet';
// import session from 'express-session';


export const app = express();




// activate security headers
app.use(helmet());




// configure cors
app.use(cors({ origin: 'http://localhost:3000' }));




// Configuration
app.use(require('morgan')('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// app.use(session({ secret: 'happystack', cookie: { maxAge: 60000 }, resave: false, saveUninitialized: false  }));



// check if production env
const isProduction = process.env.NODE_ENV === 'production';




// set error handler
if (!isProduction) {
  app.use(errorhandler());
}



// Configure mongoose
if(isProduction){
  mongoose.connect(process.env.MONGODB_URI, {
    useMongoClient: true
  });
} else {
  mongoose.connect('mongodb://127.0.0.1:27017/happystack', {
    useMongoClient: true
  });
  // mongoose.set('debug', true);
}




// passport
require('./config/passport');



// Routes
app.use('/', routes);




/// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});




// development error handler
// will print stacktrace
if (!isProduction) {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.json({'errors': {
      message: err.message,
      error: err
    }});
  });
}




// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.json({'errors': {
    message: err.message,
    error: {}
  }});
});




export default app;
