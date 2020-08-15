const User = require("../models/user");
const Bcrypt = require("bcryptjs");
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
      // console.log("Failed Captcha Verification");
      return;
    }
  });
  if (req.body.password != req.body.confirm_password) {
    req.flash("error", "Password must be same!");
    return res.redirect("back");
  }
  req.body.password = Bcrypt.hashSync(req.body.password, 10);
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
  // User.findOne({ email: req.body.email }, function (err, user) {
  //   if (err) {
  //     console.log("error in finding user in signing up");
  //     return;
  //   }

  // if (!user) {
  // req.body.password = Bcrypt.hashSync(req.body.password, 10);
  //     User.create(req.body, function (err, user) {
  //       if (err) {
  //         req.flash("error", err);
  //         return;
  //       }
  //       req.flash("success", "You have signed up, login to continue!");
  //       return res.redirect("/users/sign-in");
  //     });
  //   } else {
  //     req.flash("success", "Already Registered, login to continue!");
  //     return res.redirect("back");
  //   }
  // });
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
module.exports.resetPassword = function (req, res) {
  return res.render("reset_password", {
    title: "Reset Password ",
  });
};

module.exports.resetPwd = function (req, res) {
  User.findById(req.user._id, function (err, user) {
    if (err) {
      console.log("Error in finding user in db");
      return;
    }
    // if(Bcrypt.compareSync(req.body.current_password,req.body.password)){
    if (req.body.new_password != req.body.confirm_new_password) {
      console.log("Password does not match");
      req.flash("error", "New Passwords must be same!");
      return res.redirect("back");
    }
    if (req.body.password != req.body.new_passpowrd) {
      console.log("Wrong password");
      req.flash("error", "Wrong Password");
      return res.redirect("back");
    } else {
      user.password = Bcrypt.hashSync(req.body.new_password, 10);
      //   user.password = req.body.new_password;
      user.save();
      req.flash("success", "Passowrd Changed Successfully");
      return res.redirect("/users/profile");
    }
  });
};

//Logout
module.exports.destroySession = function (req, res) {
  req.logout();
  req.flash("success", "You have logged out!");
  return res.redirect("/");
};
