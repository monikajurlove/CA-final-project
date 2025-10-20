const userDb = require('../models/userSchema');

module.exports = {
    pokeUser: async (req, res) => {
        try {
            const fromUserId = req.user._id;            // user info from jwt (who is poking)
            const fromUsername = req.user.username;
            const { userId } = req.params; //targeted user to poke

            //can't poke yourself
            if (String(fromUserId) === String(userId)) {
                return res.send({ success: false, message: "You can't poke yourself" });
            }

            //find user to poke
            const toUser = await userDb.findById(userId);
            if (!toUser) return res.send({ success: false, message: "User not found" });

            //updating user obj who is sending the poke
            const updatedFromUser = await userDb.findOneAndUpdate(
                {
                    _id: fromUserId, //from jwt
                    pokedIds: {$ne: String(userId)}}, //$ne - update only if pokedIds does NOT have targeted user id (can poke only once)
                { $addToSet: { pokedIds: String(userId) }}, //$addToSet - add targeted user id to logged user obj but only IF it does not exist there yet
                { new: true } // return the updated doc;
            );

            if (!updatedFromUser) {
                //if nothing was updated - you had already poked this user before
                return res.send({ success: false, message: "You already poked this user" });
            }

            // add poke to targeted user obj
            await userDb.findOneAndUpdate(
                { _id: userId },
                {
                    $push: {
                        pokes: {
                            userId: String(fromUserId),
                            username: fromUsername,
                            createdAt: Date.now()
                        }
                    }
                },
                { new: true }
            );

            // notify the receiver over sockets (see poke immediately in his profile)
            const io = req.app.get('io');
            io.to(`user:${userId}`).emit('poked', {
                fromUserId: String(fromUserId),
                fromUsername,
                at: Date.now(),
            });

            return res.send({ success: true, message: "Poke sent" });
        } catch (e) {
            console.error(e);
            return res.send({ success: false, message: "Server error" });
        }
    },
};
