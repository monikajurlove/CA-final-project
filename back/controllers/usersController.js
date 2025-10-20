const userDb = require('../models/userSchema');

module.exports = {
    getAllUsers: async (req, res) => {
        const allUsers = await userDb.find({}, { username: 1 }); //returns only username
        res.send({ success: true, data: allUsers }); //used for homepage
    },
    getSingleUser: async (req, res) => {
        const { userId } = req.params; //targets selected user id
        const user = await userDb.findOne(
            { _id: userId },
            { username: 1, pokes: 1 } //returns username and pokes only (to know if it has been poked or not)
        );
        if (!user) return res.send({ success: false, message: "User not found" });
        res.send({ success: true, data: user }); //returns selected user data to logged user
    },
    getLoggedUser: async (req, res) => {
        const loggedUserId = req.user._id;
        const loggedUser = await userDb.findOne(
            { _id: loggedUserId },
            { username: 1, email: 1, pokes: 1, pokedIds: 1 } // load logged user own data without password
        );
        if (!loggedUser) return res.send({ success: false, message: "User not found" });
        res.send({ success: true, data: loggedUser }); //returns profile information for profile page
    },
}