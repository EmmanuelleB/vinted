const express = require("express");
const router = express.Router();
const isAuthentificated = require("../middlewares/isAuthentificated");
require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_API_KEY);

router.post("/payment", isAuthentificated, async (req, res) => {
  console.log("Félicitation tu es authentifié(e)");

  try {
    const stripeToken = req.fields.stripeToken;
    // const price = req.fields.price;
    // const title = req.fields.title;

    // console.log(stripeToken);
    // console.log(price);
    // console.log(title);

    const response = await stripe.charges.create({
      //   amount: "1000",
      currency: "eur",
      description: "description produit",
      // On envoie ici le token
      source: stripeToken,
    });

    // mise à jour BDD
    res.json(response);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
