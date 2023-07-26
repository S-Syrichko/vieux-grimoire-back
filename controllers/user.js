require("dotenv").config();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const { AuthenticationError, RequestError, UserError } = require("../error/customError.js");

exports.signup = async (req, res, next) => {
  try {
    //Get body
    const { email, password } = req.body;
    if (!email || !password) {
      throw new RequestError(400, "Email ou mot de passe manquant");
    }

    //Hash password
    const hash = await bcrypt.hash(password, 10).catch(() => {
      throw new UserError(
        500,
        "Erreur lors de la création de l'utilisateur"
      );
    });

    //Create User
    const user = new User({
      email: email,
      password: hash,
    });

    //Save User
    const saveUser = await user.save();
    if (!saveUser) {
      throw new UserError(
        500,
        "Erreur lors de la création de l'utilisateur"
      );
    }

    //Send response
    res.status(201).json({ message: "Utilisateur créé !" });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    //Get body
    const { email, password } = req.body;
    if (!email || !password) {
      throw new RequestError(400, "Email ou mot de passe manquant");
    }

    //Find user
    let user = await User.findOne({ email: req.body.email });
    if (user === null) {
      throw new AuthenticationError(
        401,
        "Utilisateur / mot de passe incorrect"
      );
    }

    //Compare password
    let valid = await bcrypt.compare(req.body.password, user.password);
    if (!valid) {
      throw new AuthenticationError(
        401,
        "Utilisateur / mot de passe incorrect"
      );
    }

    //Create token
    const token = jwt.sign({ userId: user._id }, process.env.TOKEN_SECRET, {
      expiresIn: "24h",
    });

    //Send response
    res.status(200).json({
      userId: user._id,
      token: token,
    });
  } catch (err) {
    next(err);
  }
};
