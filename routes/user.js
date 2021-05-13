const express = require("express");
const router = express.Router();
const uid2 = require("uid2");
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const cloudinary = require("cloudinary").v2;

const User = require("../models/User");
const Offer = require("../models/Offer");

//route Create account ----------------------------------

router.post("/user/signup", async (req, res) => {
  try {
    // Recuperartion des infos SANS enregistrement
    const { email, username, phone, password } = req.fields;
    // const newUser = {
    //   email: req.fields.email,
    //   username: req.fields.username,
    //   phone: req.fields.phone,
    //   password: req.fields.password,
    // };

    //  Recherche du mail
    const user = await User.findOne({ email: email });

    //  Si email n'existe pas => on peut faire l'inscription
    if (!user) {
      if (email && password && username) {
        // Traitement du Salt
        const salt = uid2(16);
        console.log("Salt : " + salt);

        //  Traitement du Hash
        const hash = SHA256(salt + password).toString(encBase64);
        console.log("Hash : " + hash);

        //  Traitement du Token
        const token = uid2(16);
        console.log("Token : " + token);

        // Declaraction d'un nouvel user
        const newUser = new User({
          email: email,
          account: {
            username: username,
            phone: phone,
          },
          token: token,
          hash: hash,
          salt: salt,
        });

        const avatarToUpdate = await cloudinary.uploader.upload(
          req.files.avatar.path,
          { folder: `/vinted/avatar/${newUser._id}` }
        );
        newUser.account.avatar = avatarToUpdate;
        // Envoie des infos à la BDD
        await newUser.save();

        //  Envoie au client
        res.status(200).json({
          _id: newUser._id,
          token: newUser.token,
          account: newUser.account,
        });
      } else {
        res.status(400).json({ message: "Missing parameter(s)" });
      }
    } else {
      res.status(409).json({ message: "Email is already used" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

//route Connexion ----------------------------------

router.post("/user/login", async (req, res) => {
  try {
    // Recuperartion des infos SANS enregistrement
    const { email, password } = req.fields;
    // const userLog = {
    //   email: req.fields.email,
    //   password: req.fields.password,
    // };

    //  Recherche du mail
    const user = await User.findOne({ email: email });

    if (user) {
      //  Reconstituton du hash
      const newHash = SHA256(user.salt + password).toString(encBase64);

      //  Condition de connexion
      if (user.hash === newHash) {
        res.status(200).json({
          _id: user._id,
          token: user.token,
          account: user.account,
        });
      } else {
        res.status(400).json({ message: "Password doesn't work" });
      }
    } else {
      res.status(400).json({ message: "user not found" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
