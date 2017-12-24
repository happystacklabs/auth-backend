import jwt from 'express-jwt';
import secret from '../../config';



function getTokenFromHeader(req) {
  if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Token') {
    return req.headers.authorization.split(' ')[0];
  }

  return null;
}


const auth = {
  required: jwt({
    secret: secret.secret,
    userProperty: 'payload',
    getToken: getTokenFromHeader
  }),
  optional: jwt({
    secret: secret.secret,
    userProperty: 'payload',
    credentialRequired: false,
    getToken: getTokenFromHeader
  })
};

export default auth;
