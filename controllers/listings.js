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
  const ListingsToShow = await Listing.find().populate("owner");

  // console.log(ListingsToShow);

  res.render("listings/index.ejs", {
    listings: ListingsToShow,
  });
};

const detailsPage = async (req, res) => {
  const currListing = await Listing.findById(req.params.propId).populate(
    "owner",
  );

  // console.log('current   >>>>>'+currListing);

  res.render("listings/listingDetails.ejs", { current: currListing });
};

const deleteListing = async (req, res) => {
  const foundlisting = await Listing.findById(req.params.listingId);
  if (foundlisting.owner.equals(req.session.user._id)) {
    await Listing.findByIdAndDelete(req.params.listingId);
  } else {
    res.render("error.ejs", {
      msg: "You dont have permission to do this action",
    });
  }

  res.redirect("/listing");
};

const editPage = async (req, res) => {
  console.log();

  const current = await Listing.findById(req.params.listingId);

  res.render("listings/edit.ejs", {
    current,
  });
};

const editListing = async (req, res) => {
  const foundlisting = await Listing.findById(req.params.listingId);
  if (foundlisting.owner.equals(req.session.user._id)) {
    const newData = {};
    newData.streetAddress = req.body.streetAddress;
    newData.city = req.body.city;
    newData.price = req.body.price;
    newData.size = req.body.size;
    newData.image = req.body.image;

    await Listing.findByIdAndUpdate(req.params.listingId, newData);
    
    res.redirect(`/listing/${req.params.listingId}`);
  } else {
    res.render("error.ejs", {
      msg: "You dont have permission to do this action",
    });
  }
};

module.exports = {
  showNeForm,
  indexPage,
  submitListing,
  detailsPage,
  deleteListing,
  editPage,
  editListing,
};
