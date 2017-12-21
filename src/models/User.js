import mongoose from 'mongoose';


const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  hash: String,
  salt: String,
}, {timestamps: true});


mongoose.model('User', userSchema);
