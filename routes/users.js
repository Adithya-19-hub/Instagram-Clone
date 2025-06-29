const express = require('express');
const mongoose = require('mongoose');
const connect = require('../config/db');
const plm = require('passport-local-mongoose');

const userdata = new mongoose.Schema({
  username: {
    type: String
  },
  password: {
    type: String
  },
  email: {
    type: String
  },
  fullname: {
    type: String
  },
  bio:{
    type:String
  },
  image: {
    type: String
  },
  posts:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:'Post'
  }],
  date: {
    type: Date,
    default: Date.now()
  }
});

userdata.plugin(plm);
const model = mongoose.model('User', userdata);
module.exports = model;