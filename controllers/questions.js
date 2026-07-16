const Listing = require("../models/listing");

const create = async (req, res) => {
  const listing = await Listing.findById(req.params.listingId);

  const questionData = {};
  questionData.text = req.body.text;
  questionData.author = req.session.user._id;

  listing.questions.push(questionData)
  await listing.save();

  res.redirect(`/listing/${req.params.listingId}`)
};

module.exports = {
  create,
};
