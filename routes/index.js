const express  = require('express');
const router = express.Router();

const homePage = require('../controllers/home_controller');
// console.log('router.loaded');

router.get('/',homePage.home);
router.use('/users',require('./users'));

module.exports  = router;