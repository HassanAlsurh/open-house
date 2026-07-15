const Listing = require("../models/listing");
// const Listings = require("../models/listing");

const showNeForm = (req, res) => {
  res.render("listings/new.ejs");
};

const submitListing = async (req, res) => {
  console.log(req.session.user._id);
//   res.send(req.body);

  let msg = await Listing.create({
    streetAddress: req.body.streetAddress,
    city: req.body.city,
    price: req.body.price,
    image: req.body.image,
    size: req.bosy.size,
    owner: req.session.user._id,
  });

  res.send(msg)
};

module.exports = {
  showNeForm,
  submitListing,
};
