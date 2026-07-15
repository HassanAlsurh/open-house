const { render } = require("ejs");
const Listing = require("../models/listing");
const User = require("../models/user");
// const Listings = require("../models/listing");

const showNeForm = (req, res) => {
  res.render("listings/new.ejs");
};

const submitListing = async (req, res) => {
  // console.log(req.session.user._id);

  const toUpload = {};

  if (
    req.body.streetAddress &&
    req.body.city &&
    req.body.price &&
    req.body.size &&
    req.session.user._id
  ) {
    toUpload.streetAddress = req.body.streetAddress;
    toUpload.city = req.body.city;
    toUpload.price = req.body.price;
    toUpload.size = req.body.size;
    toUpload.owner = req.session.user._id;
  } else {
    res.redirect("/listing/new");
  }

  if (req.body.image) {
    toUpload.image = req.body.image;
  }

  let msg = await Listing.create(toUpload);

  res.redirect("/listing");
};


const indexPage = async (req, res) => {
  const ListingsToShow = await Listing.find().populate('owner')

  // console.log(ListingsToShow);
  
  res.render("listings/index.ejs", {
    listings: ListingsToShow,
    
  });
};


const detailsPage = async (req,res) => {

  const currListing = await Listing.findById(req.params.propId).populate('owner')

// console.log('current   >>>>>'+currListing);

  res.render("listings/listingDetails.ejs",{current: currListing})

}


module.exports = {
  showNeForm,
  indexPage,
  submitListing,
  detailsPage
};
