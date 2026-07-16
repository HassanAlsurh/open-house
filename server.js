const dns = require("node:dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const app = express();

const mongoose = require("mongoose");
const methodOverride = require("method-override");
const morgan = require("morgan");
const session = require("express-session");
const { MongoStore } = require("connect-mongo");

const authCtrl = require("./controllers/auth");
const listingCtrl = require("./controllers/listings");

const isSignedIn = require("./middleware/is-signed-in");
const passUserToView = require("./middleware/pass-user-to-views");

// Set the port from environment variable or default to 3000
const port = process.env.PORT ? process.env.PORT : "3000";

mongoose.connect(process.env.MONGODB_URI);

mongoose.connection.on("connected", () => {
  console.log(`Connected to MongoDB ${mongoose.connection.name}.`);
});

// Middleware to parse URL-encoded data from forms
app.use(express.urlencoded({ extended: false }));
// Middleware for using HTTP verbs such as PUT or DELETE
app.use(methodOverride("_method"));
// Morgan for logging HTTP requests
app.use(morgan("dev"));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
    }),
  }),
);

app.use(passUserToView);

app.get("/", (req, res) => {
  res.render("home.ejs", {
    user: req.session.user,
  });
});

// app.get('/auth/home', authCtrl.home)
app.get("/auth/sign-up", authCtrl.showSignUpForm);
app.post("/auth/sign-up", authCtrl.signUp);
app.get("/auth/sign-in", authCtrl.showSignInForm);
app.post("/auth/sign-in", authCtrl.signIn);
app.delete("/auth/sign-out", authCtrl.signOut);

app.get("/dashboard", isSignedIn, async (req, res) => {
  res.render("dashboard.ejs");
});

app.get("/listing/new", isSignedIn, listingCtrl.showNeForm);

app.post("/listing", isSignedIn, listingCtrl.submitListing);

app.get("/listing", listingCtrl.indexPage);

app.get("/listing/:propId", isSignedIn, listingCtrl.detailsPage);

app.delete("/listing/:listingId", isSignedIn, listingCtrl.deleteListing);

app.get("/listing/:listingId/edit", isSignedIn, listingCtrl.editPage);

app.put("/listing/:listingId", isSignedIn, listingCtrl.editListing);

app.get("/*splat", (req, res) => {
  res.render("error.ejs", {
    msg: 404,
  });
});
app.listen(port, () => {
  console.log(`The express app is ready on port ${port}!`);
});
