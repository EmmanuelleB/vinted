const User = require("../models/User");

const isAuthentificated = async (req, res, next) => {
  console.log("je rentre dans le middleware");

  try {
    if (req.headers.authorization) {
      const token = req.headers.authorization.replace("Bearer ", "");

      const user = await User.findOne({ token: token }).select(
        "_id token account"
      );

      if (user) {
        req.user = user;
        next();
      } else {
        res.status(401).json({ message: "Unauthorized" });
      }
    } else {
      res.status(400).json({ message: "Unauthorized" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = isAuthentificated;
