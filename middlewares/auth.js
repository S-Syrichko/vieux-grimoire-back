require("dotenv").config();
const jwt = require("jsonwebtoken");
const {
  AuthenticationError,
  RequestError,
} = require("../error/customError.js");

module.exports = (req, res, next) => {
  try {
    if (!req.headers.authorization) {
      throw new RequestError(400, "Bad header format");
    }
    const token = req.headers.authorization.split(" ")[1];
    if (!token) throw new RequestError(400, "Bad header format");

    jwt.verify(token, process.env.TOKEN_SECRET, (err, decodedToken) => {
      if (err) {
        throw new AuthenticationError(401, "Requête non authentifiée");
      }
      const userId = decodedToken.userId;
      req.auth = { userId: userId };
      next();
    });
  } catch (error) {
    next();
  }
};
