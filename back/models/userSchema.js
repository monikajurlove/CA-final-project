const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email:
        { type: String,
            required: true,
            unique: true
        },
    password:
        {
            type: String,
            required: true
        },
    username:{
        type: String,
        unique: true,
        required: true,
    },
    pokes: { //received pokes
        type: [
            {
                userId:   { type: String, required: true },
                username: { type: String, required: true },
                createdAt:{ type: Number, default: () => Date.now() },
            },
        ],
        default: []
    },

    pokedIds: [{ type: String, default: [] }], //given pokes (stores users you poked IDs)
});

module.exports = mongoose.model('user', userSchema);