import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import User from './models/User';

export const app = express();




// Disable powered by for security reason
app.disable('x-powered-by');




// Configuration
app.use(require('morgan')('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());





// Configure mongoose
mongoose.connect('mongodb://127.0.0.1:27017/happystack', {
  useMongoClient: true,
  /* other options */
});
mongoose.set('debug', true);




// TODO delete
app.get("/", function(req, res) {
res.send("Welcome to Happystack API.");
});




/// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});




export default app;
