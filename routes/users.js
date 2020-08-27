const express = require("express");
const router = express.Router();
const passport = require("passport");
const usersPage = require("../controllers/users_controller");

router.get("/profile", passport.checkAuthentication, usersPage.profile);

//sign-up router
router.get("/sign-up", usersPage.signUp);
router.post("/create", usersPage.create);

//sign-in router
router.get("/sign-in", usersPage.signIn);
router.post(
  "/create-session",
  passport.authenticate(
    // use passport as a middleware to authenticate
    "local",
    { failureRedirect: "/users/sign-in" }
  ),
  passport.setAuthenticatedUser,
  usersPage.createSession
);

//sign-out router
router.get("/sign-out", usersPage.destroySession);
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
router.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  passport.setAuthenticatedUser,
  usersPage.createSession
);

//Update password
router.get(
  "/update-password/:id",
  passport.checkAuthentication,
  usersPage.updatePassword
);
router.post(
  "/update-pwd/:id",
  passport.checkAuthentication,
  usersPage.updatePwd
);

module.exports = router;
