const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Extract token from header
      token = req.headers.authorization.split(" ")[1];

      // Decodes token id
      const decoded = jwt.verify(token, process.env.JWT_TOKEN);

      // Attach user (without password) to the request object
      req.user = await User.findById(decoded.id).select("-password");

      next();
    } catch (error) {
      // Differentiate between invalid token and other errors
      if (error instanceof jwt.JsonWebTokenError) {
        return res
          .status(401)
          .json({ message: "Invalid token. Authorization denied." });
      } else {
        return res
          .status(500)
          .json({ message: "Server error during authentication." });
      }
    }
  }

  if (!token) {
    return res
      .status(401)
      .json({ message: "No token provided. Authorization denied." });
  }
});

module.exports = { protect };
