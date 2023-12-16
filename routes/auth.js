const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const verifyJWT = require('../middleware/verifyJWT');


router.post('/login', authController.handleLogin);
router.use(verifyJWT)
router.get('/logout',authController.handleLogout)

router.post('/register',authController.handleNewUser)

module.exports = router;