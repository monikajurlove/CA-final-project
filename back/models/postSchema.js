const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    owner: {
        _id: {
            type: String,
            required: true,
            ref: 'user'
        },
        username: {
            type: String ,
            required: true
        }
    },
    imageUrl: {
        type: String,
        required: true
    },
    mood: {
        type: String,
        enum: ['wholesome','poetic','witty','mysterious'],
        required: true
    },
    topic: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    comments: [
        {
            username: { type: String, required: true },
            time: Date,
            content: { type: String, required: true },
        },
    ],
});

module.exports = mongoose.model('post', postSchema);