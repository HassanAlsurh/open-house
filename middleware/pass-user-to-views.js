const passUserToView = (req, res, next) => {
  console.log(req.session);

  if (req.session.user) {
    res.locals.user = req.session.user;
  } else {
    res.locals.user = null; //locals instead of session
  }
  next();
};

module.exports = passUserToView;
