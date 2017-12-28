import mongoose from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import secret from '../config/';


// The schema
const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    lowercase: true,
    required: [true, 'Can\'t be blank'],
    match: [/^[a-zA-Z0-9]+$/, 'Is invalid'],
    minlength: [5, 'Must be at least 5 characters'],
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
}, { timestamps: true });


// Add the unique validation plugin
UserSchema.plugin(uniqueValidator, { message: 'Is already taken' });


// setPassword method
UserSchema.methods.setPassword = (password) => {
  this.salt = crypto.randomBytes(16).toString('hex');
  this.hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
};


// validPassword method
UserSchema.methods.validPassword = (password) => {
  const hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
  return hash === this.hash;
};


// generateJWT method
UserSchema.methods.generateJWT = () => {
  const today = new Date();
  const expiration = new Date(today.getDate() + 60);

  return jwt.sign({
    id: this._id, // eslint-disable-line no-underscore-dangle
    username: this.username,
    expiration: parseInt(expiration.getTime() / 1000, 10),
  }, secret.secret);
};


// toAuthJSON method
UserSchema.methods.toAuthJSON = () => {
  const user = {
    username: this.username,
    email: this.email,
    token: this.generateJWT(),
  };
  return user;
};


const User = mongoose.model('User', UserSchema);

export default User;
