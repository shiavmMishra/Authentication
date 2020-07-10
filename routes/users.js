const express = require('express');
const router = express.Router();
const passport = require('passport');
const usersPage = require('../controllers/users_controller');

router.get('/profile', passport.checkAuthentication, usersPage.profile);

//sign-up router
router.get('/sign-up', usersPage.signUp);
router.post('/create', usersPage.create);

//sign-in router
router.get('/sign-in', usersPage.signIn);
router.post('/create-session', passport.authenticate(  // use passport as a middleware to authenticate
    'local',
    { failureRedirect: '/users/sign-in', },
), usersPage.createSession);

router.get('/sign-out', usersPage.destroySession);
router.get('/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);
router.get('/auth/google/callback',passport.authenticate('google',
     { failureRedirect: '/users/sign-in' }
     ),usersPage.createSession
);

//Reset password
router.get('/reset-password',passport.checkAuthentication,usersPage.resetPassword);
router.post('/reset-pwd',usersPage.resetPwd);

module.exports = router;