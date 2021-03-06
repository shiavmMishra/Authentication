const User = require("../models/user");
const bcrypt = require("bcryptjs"); //To encrpyt the password
const request = require("request");
require("dotenv").config();

module.exports.profile = function (req, res) {
  return res.render("user_profile", {
    title: "User Profile",
  });
};

// render the sign up page
module.exports.signUp = function (req, res) {
  if (req.isAuthenticated()) {
    return res.redirect("/users/profile");
  }
  return res.render("user_sign_up", {
    title: "Sign Up",
  });
};
// get the sign up data
module.exports.create = function (req, res) {
  if (
    req.body["g-recaptcha-response"] === undefined ||
    req.body["g-recaptcha-response"] === "" ||
    req.body["g-recaptcha-response"] === null
  ) {
    req.flash("error", "Failed Captcha Verification");
    return res.redirect("back");
  }
  var secretKey = process.env.recaptcha_secret_key;
  var verificationUrl =
    "https://www.google.com/recaptcha/api/siteverify?secret=" +
    secretKey +
    "&response=" +
    req.body["g-recaptcha-response"] +
    "&remoteip=" +
    req.connection.remoteAddress;
  request(verificationUrl, function (error, response, body) {
    body = JSON.parse(body);
    if (body.success !== undefined && !body.success) {
      req.flash("error", "Failed Captcha Verification");
      return;
    } else if (error) {
      console.log(err);
      req.flash("error", err);
      return res.redirect("back");
    }
  });
  if (req.body.password != req.body.confirm_password) {
    req.flash("error", "Password must be same!");
    return res.redirect("back");
  }
  req.body.password = bcrypt.hashSync(req.body.password, 10);
  User.create(req.body, function (err, user) {
    if (err) {
      console.log("error creating user in db");
      console.log(err);
      req.flash("error", err);
      return res.redirect("back");
    }
    console.log(user);
    req.flash("success", "Your Profile is Successfully Created");
    return res.redirect("/users/sign-in");
  });
};

// render the sign in page
module.exports.signIn = function (req, res) {
  if (req.isAuthenticated()) {
    return res.redirect("/users/profile");
  }
  return res.render("user_sign_in", {
    title: "Sign In",
  });
};
// sign in and create a session for the user
module.exports.createSession = function (req, res) {
  req.flash("success", "Logged in Successfully");
  return res.redirect("/users/profile");
};

//render the reset password
module.exports.updatePassword = function (req, res) {
  return res.render("update_password", {
    title: "Update Password ",
  });
};
//Update the password
module.exports.updatePwd = function (req, res) {
  if (req.user.id == req.params.id) {
    User.findById(req.params.id, function (err, user) {
      if (err) {
        req.flash("error", "Can not find the user");
        console.log(err);
        return res.redirect("back");
      } else {
        if (
          user &&
          bcrypt.compareSync(req.body.current_password, user.password)
        ) {
          if (req.body.new_password != req.body.confirm_new_password) {
            req.flash("error", "Passwords do not match");
            return res.redirect("back");
          }
          user.password = bcrypt.hashSync(req.body.new_password, 10);
          req.flash("success", "Password changed Successfully");
          user.save();
          return res.redirect("/users/profile");
        } else {
          req.flash("error", "Wrong Current Password");
          return res.redirect("back");
        }
      }
    });
  }
};

//Logout
module.exports.destroySession = function (req, res) {
  req.logout();
  req.flash("success", "You have logged out!");
  return res.redirect("/");
};
