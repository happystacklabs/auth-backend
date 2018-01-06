import jwt from 'express-jwt';
import secret from '../config';


// get the token from the request headers
function getTokenFromHeader(req) {
  if ((req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Token') ||
      (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer')) {
    // return only the jwt token string
    return req.headers.authorization.split(' ')[1];
  }

  return null;
}


// jwt middleware
const auth = {
  required: jwt({
    secret: secret.secret,
    userProperty: 'payload',
    getToken: getTokenFromHeader,
  }),
  optional: jwt({
    secret: secret.secret,
    userProperty: 'payload',
    credentialRequired: false,
    getToken: getTokenFromHeader,
  }),
};


export default auth;
