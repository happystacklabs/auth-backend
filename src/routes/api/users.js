import mongoose from 'mongoose';
import {Router} from 'express';
import passport from 'passport';
import auth from '../auth';


const routes = Router();
const User = mongoose.model('User');




// POST: /users
routes.post('/users', function(req, res, next) {
  const user = new User();

  user.username = req.body.user.username;
  user.email = req.body.user.email;
  user.setPassword(req.body.user.password);

  user.save().then(function(){
    return res.json({user: user.toAuthJSON()});
  }).catch(next);
});




export default routes;
