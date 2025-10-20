const bcrypt = require('bcrypt');
const userDb = require('../models/userSchema');
const postDb  = require('../models/postSchema');

//make sure it is string and no white space after is left
function normalize(str) {
    return String(str || '').trim();
}

module.exports = {
    updateUsername: async (req, res) => {
        try {
            const user_id = req.user._id;
            const new_username = normalize(req.body.username);

            if (!new_username) {
                return res.send({ success: false, message: "Username is required" });
            }
            if (new_username.length < 3 || new_username.length > 20) {
                return res.send({ success: false, message: "Username must be 3–20 characters" });
            }

            // if username exists it does not update it
            const taken = await userDb.findOne(
                {
                    username: new_username, //look for the same username
                    _id: { $ne: user_id } // exclude "myself" (lets keep the same password)
                },
                { _id: 1 } //return only id
            );
            if (taken) {
                //if another user has this username - blocking update
                return res.send({ success: false, message: "This username is already taken" });
            }

            // update username otherwise
            const updated = await userDb.findOneAndUpdate(
                { _id: user_id },
                { $set: { username: new_username }}, //change username
                { new: true, runValidators: true } // runValidators check schema validators and gives new obj
            );

            //if user not found
            if (!updated) {
                return res.send({ success: false, message: "User not found" });
            }

            //update all posts of user by post owner id and update username
            await postDb.updateMany(
                { 'owner._id': String(user_id) },
                { $set: { 'owner.username': new_username } }
            );

            //update every user that has poke entry for this user
            await userDb.updateMany(
                { 'pokes.userId': String(user_id) }, //get ANY user where pokes array contains this user id
                { $set: { 'pokes.$[p].username': new_username } }, //inside matched pokes arrays change username to new
                { arrayFilters: [ { 'p.userId': String(user_id) }]} //p is a placeholder for items in pokes arr, only elements with current user id will be updated
            );

            return res.send({
                success: true,
                message: "Username updated",
                data: { _id: updated._id, email: updated.email, username: updated.username }
            });
        } catch (e) {
            console.error(e);
            return res.send({ success: false, message: "Server error" });
        }
    },
    updatePassword: async (req, res) => {
        try {
            const user_id = req.user._id; // from jwt
            const currentPassword = normalize(req.body.currentPassword);
            const p1 = normalize(req.body.newPasswordOne);
            const p2 = normalize(req.body.newPasswordTwo);

            //if one field is missing, error
            if (!currentPassword || !p1 || !p2) {
                return res.send({ success: false, message: "All password fields are required" });
            }

            //if new passwords do not match, error
            if (p1 !== p2) {
                return res.send({ success: false, message: "New passwords do not match" });
            }

            //if password length is more than 20, error
            if (p1.length > 20) {
                return res.send({ success: false, message: "Password can't be longer than 20 characters" });
            }

            //check if user is logged in, if not, error
            const me = await userDb.findById(user_id).select('password');
            if (!me) return res.send({ success: false, message: "User not found" });

            //compare password from obj to input password, if incorrect, error
            const ok = await bcrypt.compare(currentPassword, me.password);
            if (!ok) {
                return res.send({ success: false, message: "Incorrect current password" });
            }

            //new password hidden
            const new_hash = await bcrypt.hash(p1, 10);

            await userDb.findOneAndUpdate(
                { _id: user_id },
                { $set: { password: new_hash }},
                { new: false }
            );

            return res.send({ success: true, message: "Password updated" });
        } catch (e) {
            console.error(e);
            return res.send({ success: false, message: "Server error" });
        }
    },
};
