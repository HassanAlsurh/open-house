const { render } = require("ejs");
const Listing = require("../models/listing");
const User = require("../models/user");
const cloudinary = require("../config/cloudinary.js");

const showNeForm = (req, res) => {
  res.render("listings/new.ejs");
};

const submitListing = async (req, res) => {
  // console.log(req.session.user._id);

  try {
    if (!req.file) {
      return res.render("error.ejs", {
        msg: "Please select an image.",
      });
    }

    //upload image is a cloudinary method is similar Listing.create()
    const uploadedImage = await uploadImage(req.file.buffer);

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

    //dont need the if req.body.image since we have  if (!req.file) above!
    toUpload.image = {
      url: uploadedImage.secure_url,
      publicId: uploadedImage.public_id,
    };

    await Listing.create(toUpload);
    res.redirect("/listing");
  } catch (error) {
    console.log(error);

    res.render("error.ejs", {
      msg: "The listing could not be created.",
    });
  }
};

const indexPage = async (req, res) => {
  const ListingsToShow = await Listing.find().populate("owner");

  // console.log(ListingsToShow);

  res.render("listings/index.ejs", {
    listings: ListingsToShow,
  });
};

const detailsPage = async (req, res) => {
  const currListing = await Listing.findById(req.params.propId)
    .populate("owner")
    .populate("questions.author");

  //returns true if it finds a record
  const userHasFavorited = currListing.favoritedByUsers.some((user) => {
    return user.equals(req.session.user._id);
  });

  // console.log('current   >>>>>'+currListing);

  res.render("listings/listingDetails.ejs", {
    current: currListing,
    userHasFavorited: userHasFavorited,
  });
};

const deleteListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.listingId);

    if (!listing) {
      return res.render("error.ejs", {
        msg: "Listing not found.",
      });
    }

    if (!listing.owner.equals(req.session.user._id)) {
      return res.render("error.ejs", {
        msg: "You don't have permission to do that.",
      });
    }

    if (listing.image?.publicId) {
      await cloudinary.uploader.destroy(listing.image.publicId, {
        invalidate: true,
      });
    }

    await listing.deleteOne();

    res.redirect("/listing");
    
  } catch (error) {
    console.log(error);

    res.render("error.ejs", {
      msg: "The listing could not be deleted.",
    });
  }

  // const foundlisting = await Listing.findById(req.params.listingId);
  // if (foundlisting.owner.equals(req.session.user._id)) {
  //   await Listing.findByIdAndDelete(req.params.listingId);
  // } else {
  //   res.render("error.ejs", {
  //     msg: "You dont have permission to do this action",
  //   });
  // }
  // res.redirect("/listing");

};

const editPage = async (req, res) => {
  console.log();

  const current = await Listing.findById(req.params.listingId);

  res.render("listings/edit.ejs", {
    current,
  });
};

const editListing = async (req, res) => {
  try {
    const foundlisting = await Listing.findById(req.params.listingId);

    if (!foundlisting) {
      return res.render("error.ejs", {
        msg: "Listing not found.",
      });
    }
    if (!foundlisting.owner.equals(req.session.user._id)) {
      return res.render("error.ejs", {
        msg: "You don't have permission to do that.",
      });
    }

    const oldPublicId = foundlisting.image?.publicId;

    foundlisting.streetAddress = req.body.streetAddress;
    foundlisting.city = req.body.city;
    foundlisting.price = req.body.price;
    foundlisting.size = req.body.size;

    if (req.file) {
      const uploadedImage = await uploadImage(req.file.buffer);

      foundlisting.image = {
        url: uploadedImage.secure_url,
        publicId: uploadedImage.public_id,
      };
    }
    await foundlisting.save();

    if (req.file && oldPublicId) {
      try {
        await cloudinary.uploader.destroy(oldPublicId, {
          invalidate: true,
        });
      } catch (cloudinaryError) {
        console.log("Could not delete the old image:", cloudinaryError);
      }
    }

    res.redirect(`/listing/${req.params.listingId}`);
  } catch (cloudinaryError) {
    console.log("Could not delete the old image:", cloudinaryError);
  }
};

const favorite = async (req, res) => {
  // res.send('favorited')

  await Listing.findByIdAndUpdate(req.params.listingId, {
    $push: { favoritedByUsers: req.params.userId },
  });

  res.redirect(`/listing/${req.params.listingId}`);
};
const unfavorite = async (req, res) => {
  await Listing.findByIdAndUpdate(req.params.listingId, {
    $pull: { favoritedByUsers: req.params.userId },
  });

  res.redirect(`/listing/${req.params.listingId}`);
};

const uploadImage = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "open-house/listings",
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      },
    );

    uploadStream.end(fileBuffer);
  });
};

module.exports = {
  showNeForm,
  indexPage,
  submitListing,
  detailsPage,
  deleteListing,
  editPage,
  editListing,
  favorite,
  unfavorite,
};
