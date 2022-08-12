const jwt = require("jsonwebtoken");
const User = require("../models/User");

const handleErrors = (err) => {
    console.log(err.message, err.code);
    let errors = { email: "", password: "" };

    //incorrect email while logging in
    if (err.message == "Incorrect Email") {
        errors.email = 'That email is not registered'
    }
    //incorrect passsword while logging in
    if (err.message == "Incorrect Password") {
        errors.password = 'The Password is incorrect'
    }

    //Duplicate error code
    if (err.code === 11000) {
        errors.email = "That email is Already registered";
        return errors;
    }

    //Validation Errors
    if (err.message.includes("user validation failed")) {
        Object.values(err.errors).forEach(({ properties }) => {
            errors[properties.path] = properties.message;
        });
    }
    return errors;
}




//Creating a Cookie
const maxAge = 3 * 24 * 60 * 60; // 3days expire
const createToken = (id) => {
    return jwt.sign({ id }, "nazimhere", {
        expiresIn: maxAge
    });
}


module.exports.signup_get = (req, res) => {
    res.render("signup", { style: "login.css" });
}

module.exports.login_get = (req, res) => {
    res.render("login", { style: "login.css" });
}

module.exports.signup_post = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.create({ email, password });

        const token = createToken(user._id);
        res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });

        res.status(201).json({ user: user._id });
    }
    catch (err) {
        const errors = handleErrors(err);
        res.status(400).json({ errors })
    }

}

module.exports.login_post = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.login(email, password);
        const token = createToken(user._id);
        res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
        res.status(200).json({ user: user._id })
    }
    catch (err) {
        const errors = handleErrors(err)
        res.status(400).json({ errors });
        // error to render at frontend is not done
    }
}

module.exports.logout_get = (req, res) => {
    res.cookie("jwt", " ", { maxAge: 1 });
    res.redirect("/");
} 