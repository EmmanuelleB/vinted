const express = require("express");
const router = express.Router();
const isAuthentificated = require("../middlewares/isAuthentificated");
require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_API_KEY);

router.post("/payment", isAuthentificated, async (req, res) => {
  console.log("Félicitation tu es authentifié(e)");

  try {
    const stripeToken = req.fields.stripeToken;

    console.log(stripeToken);

    // const response = await stripe.charges.create({
    //     amount: 2000,
    //     currency: "eur",
    //     description: "La description de l'objet",
    //     source: stripeToken
    // })
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
