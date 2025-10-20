const validator = require("email-validator");

module.exports = {
    validateRegister: (req, res, next) => {
        const {email, passwordOne, passwordTwo} = req.body || {};
        const normalizedEmail = String(email || "").toLowerCase().trim();

        if (!normalizedEmail) {
            return res.send({ success: false, message: "Email is required" });
        }

        if (!validator.validate(normalizedEmail)) {
            return res.send({success: false, message: "Invalid email address"});
        }

        const p1 = String(passwordOne || "");
        const p2 = String(passwordTwo || "");

        if (!p1) {
            return res.send({ success: false, message: "Password is required" });
        }

        if (!p2) {
            return res.send({ success: false, message: "Password confirmation is required" });
        }

        if (p1 !== p2) {
            return res.send({ success: false, message: "Passwords do not match" });
        }

        if (p1.length > 20) {
            return res.send({ success: false, message: "Password can't be longer than 20 characters" });
        }

        req.body.email = normalizedEmail;
        next();
    },
    validateLogin: (req, res, next) => {
        const { email, password } = req.body || {};

        const normalizedEmail = String(email || "").toLowerCase().trim();

        if (!normalizedEmail) {
            return res.send({ success: false, message: "Email is required" });
        }

        if (!validator.validate(normalizedEmail)) {
            return res.send({ success: false, message: "Invalid email address" });
        }

        // password checks
        const p = String(password || "");
        if (!p) {
            return res.send({ success: false, message: "Password is required" });
        }
        if (p.trim() !== p) {
            return res.send({ success: false, message: "Password cannot start or end with space" });
        }
        if (p.length > 20) {
            return res.send({ success: false, message: "Password can't be longer than 20 characters" });
        }

        req.body.email = normalizedEmail;
        next();
    }
}
