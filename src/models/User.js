import mongoose from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import secret from '../config/';


// Constants
const saltRounds = 10;


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
  // salt: String,
}, { timestamps: true });


// Add the unique validation plugin
UserSchema.plugin(uniqueValidator, { message: 'Is already taken' });


// setPassword method
UserSchema.methods.setPassword = function (password) {
  this.hash = bcrypt.hashSync(password, saltRounds);
};


// validPassword method
UserSchema.methods.validPassword = (password) => {
  bcrypt.compare(password, this.hash, (err, res) => res);
};


// generateJWT method
UserSchema.methods.generateJWT = function () {
  const today = new Date();
  const expiration = new Date(today.getDate() + 60);

  return jwt.sign({
    /* eslint-disable no-underscore-dangle */
    id: this._id,
    username: this.username,
    expiration: parseInt(expiration.getTime() / 1000, 10),
  }, secret.secret);
};


// toAuthJSON method
UserSchema.methods.toAuthJSON = function () {
  const user = {
    username: this.username,
    email: this.email,
    token: this.generateJWT(),
  };

  return user;
};


const User = mongoose.model('User', UserSchema);

export default User;
