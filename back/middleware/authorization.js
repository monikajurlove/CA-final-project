require("dotenv").config();
const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET;

module.exports = {
    jwtEncode: async (user) => {
        return jwt.sign(user, jwtSecret);
    },

    jwtDecode: async (req, res, next) => {
        const token = req.headers.authorization;
        if (!token) {
            return res.send({ success: false, message: "No auth token provided" });
        }

        let decoded;
        try {
            decoded = await jwt.verify(token, jwtSecret);
        } catch (err) {
            return res.send({ success: false, message: "Jwt verify error" });
        }

        if (!decoded) {
            return res.send({ success: false, message: "No user in token" });
        }

        req.user = decoded;
        next();
    }
};