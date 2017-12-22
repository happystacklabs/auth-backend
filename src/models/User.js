import mongoose from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import secret from '../../config/';


// The schema
const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    lowercase: true,
    required: [true, 'Can\'t be blank'],
    match: [/^[a-zA-Z0-9]+$/, 'Is invalid'],
    index: true,
  },
  email: {
    type: String,
    unique: true,
    lowercase: true,
    required: [true, 'Can\'t be blank'],
    match: [/\S+@\S+\.\S+/, 'Is invalid'],
    index: true,
  },
  hash: String,
  salt: String,
}, {timestamps: true});




// Add the unique validation plugin
UserSchema.plugin(uniqueValidator, {message: 'Is already taken'});




// setPassword method
UserSchema.methods.setPassword = function(password) {
  this.salt = crypto.randomBytes(16).toString('hex');
  this.hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
};




// validPassword method
UserSchema.methods.validPassword = function(password) {
  const hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
  return hash === this.hash;
};




// generateJWT method
UserSchema.methods.generateJWT = function() {
  const today = new Date();
  const expiration = new Date(today.getDate() + 60);

  return jwt.sign({
    id: this._id,
    username: this.username,
    expiration: parseInt(expiration.getTime() / 1000),
  }, secret.secret);
};




// toAuthJSON method
UserSchema.methods.toAuthJSON = function() {
  return {
    username: this.username,
    email: this.email,
    token: this.generateJWT()
  };
};




const User = mongoose.model('User', UserSchema);

export default User;
