const passUserToView = (req, res, next) => {

  if (req.session.user) {
    res.locals.user = req.session.user;
  } 
  else {
    req.session.user = null;
  }
  next();
};

module.exports = {
  passUserToView,
};
