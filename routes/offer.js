const express = require("express");
const router = express.Router();
const isAuthentificated = require("../middlewares/isAuthentificated");
const cloudinary = require("cloudinary").v2;

const User = require("../models/User");
const Offer = require("../models/Offer");

//route create -------------------
router.post("/offer/publish", isAuthentificated, async (req, res) => {
  console.log("Félicitation tu es authentifié(e)");

  try {
    const { title, description, price, condition, city, brand, size, color } = req.fields;

    if (title && price && req.files.picture.path) {
      const newOffer = new Offer({
        product_name: title,
        product_description: description,
        product_price: price,
        product_details: [
          {
            MARQUE: brand,
          },
          {
            TAILLE: size,
          },
          {
            ÉTAT: condition,
          },
          {
            COULEUR: color,
          },
          {
            EMPLACEMENT: city,
          },
        ],

        owner: req.user,
      });

      if (req.files >= 0 && req.files < 1) {
        // Uploader image vers cloudinary
        const pictureToUpdate = await cloudinary.uploader.upload(req.files.picture.path, {
          folder: `/vinted/offers/${newOffer._id}`,
        });

        // Ajouter la clé img
        newOffer.product_image = pictureToUpdate;

        // Enregistrement en BDD
        await newOffer.save();

        //Envoie de la réponse au client
        res.status(200).json(newOffer);
      }
      if (req.files >= 1 && req.files < 5) {
        const fileKeys = Object.keys(req.files);

        fileKeys.forEach(async (fileKey) => {
          try {
            const file = req.files[fileKey];
            const pictureToUpdate = await cloudinary.uploader.upload(file.path, {
              folder: `/vinted/offers/${newOffer._id}`,
            });
            newOffer.product_image[fileKey] = pictureToUpdate;

            if (Object.keys(newOffer.product_image).length === fileKeys.length) {
              await newOffer.save();
              res.status(200).json(newOffer);
            }
          } catch (error) {
            res.status(400).json({ message: error.message });
          }
        });
      }

      // //---- boucle cloudinary
      // if (req.files) {
      //   const fileKeys = Object.keys(req.files);

      //   fileKeys.forEach(async (fileKey) => {
      //     try {
      //       const file = req.files[fileKey];
      //       const pictureToUpdate = await cloudinary.uploader.upload(
      //         file.path,
      //         {
      //           folder: `/vinted/offers/${newOffer._id}`,
      //         }
      //       );
      //       newOffer.product_image[fileKey] = pictureToUpdate;

      //       if (
      //         Object.keys(newOffer.product_image).length === fileKeys.length
      //       ) {
      //         await newOffer.save();
      //         res.status(200).json(newOffer);
      //       }
      //     } catch (error) {
      //       res.status(400).json({ message: error.message });
      //     }
      //   });
      // } else {
      //   await newOffer.save();
      //   res.status(200).json(newOffer);
      // }
    } else {
      res.status(400).json({ message: "Title, Price and Picture are required" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// route update ---------------

router.put("/offer/update", isAuthentificated, async (req, res) => {
  try {
    const { title, description, price, condition, city, brand, size, color } = req.fields;

    const offerToModify = await Offer.findById(req.fields._id);
    const oldDownloadImages = Object.keys(offerToModify.product_image);

    if (title) {
      offerToModify.product_name = title;
    }
    if (description) {
      offerToModify.product_description = description;
    }
    if (price) {
      offerToModify.product_price = price;
    }
    // modification du tableau product_details

    const details = offerToModify.product_details;

    if (brand || size || condition || color || city) {
      for (let i = 0; i < details.length; i++) {
        if (brand) {
          if (details[i].MARQUE) {
            details[i].MARQUE = brand;
          }
        }
        if (size) {
          if (details[i].TAILLE) {
            details[i].TAILLE = size;
          }
        }

        if (condition) {
          if (details[i].ÉTAT) {
            details[i].ÉTAT = condition;
          }
        }
        if (color) {
          if (details[i].COULEUR) {
            details[i].COULEUR = couleur;
          }
        }
        if (city) {
          if (details[i].EMPLACEMENT) {
            details[i].EMPLACEMENT = city;
          }
        }
      }
    }
    offerToModify.markModified("product_details");

    if (req.files) {
      // Uploader une nouvelle image vers cloudinary
      const pictureToModify = await cloudinary.uploader.upload(req.files.picture.path, {
        folder: `/vinted/offers/${offerToModify._id}`,
      });
      // modification de l'image
      if (pictureToModify) {
        offerToModify.product_image = pictureToModify;
      }

      // //---Modifier et uploader plusieurs images

      // const fileKeys = Object.keys(req.files);
      // console.log(oldDownloadImages);
      // console.log(fileKeys);

      // let counter = 0;

      // for (let i = 0; i < oldDownloadImages.length; i++) {
      //   for (let j = 0; j < fileKeys.length; j++) {
      //     if (oldDownloadImages[i] === fileKeys[j]) {
      //       counter++;
      //       console.log(counter);

      //       let file = req.files[fileKeys[j]];
      //       console.log(file.name);

      //       let pictureToUpdate = await cloudinary.uploader.upload(file.path, {
      //         folder: `/vinted/offers/${offerToModify._id}`,
      //       });
      //       console.log(pictureToUpdate);
      //       offerToModify.markModified("product_image");

      //       offerToModify.product_image[fileKeys[j]] = pictureToUpdate;
      //     }
      //   }
      // }
      // //----------------------------
    }

    await offerToModify.save();
    res.status(200).json(offerToModify);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// route delete ---------------

router.delete("/offer/delete", isAuthentificated, async (req, res) => {
  try {
    if (req.fields._id) {
      await Offer.findByIdAndDelete(req.fields._id);
      res.status(200).json({ message: "Offer deleted" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// route get visualisation des offres ---------------

router.get("/offers", async (req, res) => {
  try {
    const filters = {};

    if (req.query.title) {
      filters.product_name = new RegExp(req.query.title, "i");
    }
    if (req.query.priceMin && req.query.priceMax) {
      filters.product_price = {
        $gte: Number(req.query.priceMin),
        $lte: Number(req.query.priceMax),
      };
    }
    if (req.query.priceMin && !req.query.priceMax) {
      filters.product_price = {
        $gte: Number(req.query.priceMin),
      };
    }
    if (req.query.priceMax && !req.query.priceMin) {
      filters.product_price = {
        $lte: Number(req.query.priceMax),
      };
    }

    const sort = {};

    if (req.query.sort) {
      if (req.query.sort === "price-asc") {
        sort.product_price = "asc";
      }
      if (req.query.sort === "price-desc") {
        sort.product_price = "desc";
      }
    }

    let offersByPage = Number(req.query.offersByPage) || 20;
    let page = Number(req.query.page);

    if (page === 1 || !page) {
      hiddenOffers = 0;
    } else if (page > 1) {
      hiddenOffers = (page - 1) * offersByPage;
    }

    const offers = await Offer.find(filters)
      .sort(sort)
      .limit(offersByPage)
      .skip(hiddenOffers)
      .populate("owner", "account");

    const count = await Offer.countDocuments(filters);

    res.status(200).json({
      count: count,
      offers: offers,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// route get visualisation d'une offre ---------------

router.get("/offer/:id", async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id).populate("owner", "account");
    await offer.save();
    res.status(200).json(offer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
