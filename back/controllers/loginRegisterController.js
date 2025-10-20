const userDb = require('../models/userSchema');

const bcrypt = require('bcrypt'); //to hash(hide) passwords
const { jwtEncode } = require('../middleware/authorization'); //to create token

module.exports = {
    register: async (req, res) => {
        // email and password from FE
        //taking only passwordOne because
        const { email, passwordOne } = req.body;

        const existingUser = await userDb.findOne({ email });
        if (existingUser) {
            return res.send({ success: false, message: "User with this email already exist" });
        }

        const passwordHash = await bcrypt.hash(passwordOne, 10);

        //async function to generate random username
        //function runs until it generates unique username
        async function generateUniqueUsername() {
            const randomNum = Math.floor(10000 + Math.random() * 90000);
            const generatedName = `user${randomNum}`;

            const exists = await userDb.findOne({ username: generatedName });
            if (exists) {
                return generateUniqueUsername();
            }
            return generatedName;
        }

        const username = await generateUniqueUsername();

        const newUser = new userDb({
            email,
            password: passwordHash,
            username,
        });
        await newUser.save();

        res.send({
            success: true,
            message: "Registration successful",
            data: { _id: newUser._id, email: newUser.email, username: newUser.username }
        });
    },
    login: async (req, res) => {
        const { email, password } = req.body; //from FE

        //find user by email, if not found, error
        const foundUser = await userDb.findOne({ email});
        if (!foundUser) {
            return res.send({ success: false, message: "User not found" });
        }

        //compare user password with input
        const passwordMatch = await bcrypt.compare(password, foundUser.password);
        if (!passwordMatch) {
            return res.send({ success: false, message: "Incorrect password" });
        }

        //generate token
        const token = await jwtEncode({
            _id: foundUser._id,
            email: foundUser.email,
            username: foundUser.username
        });
        console.log(`login ok ${token}`);

        res.send({
            success: true,
            message: "Logged in successfully",
            token,
            data: { _id: foundUser._id, email: foundUser.email, username: foundUser.username }
        });

    },
}