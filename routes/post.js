const express = require('express');
const mongoose = require('mongoose');
const connect = require('../config/db');

const postdata = new mongoose.Schema({
    caption: {
        type: String
    },
    image: {
        type: String
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    bookmark: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    user: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
});

const model = mongoose.model('Post', postdata);
module.exports = model;