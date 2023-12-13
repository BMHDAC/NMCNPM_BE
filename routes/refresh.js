const express = require('express');
const router = express.Router();
const refreshTokenController = require('../controllers/refreshTokenController');
const verifyJWT = require('../middleware/verifyJWT');

router.use(verifyJWT)
router.get('/', refreshTokenController.handleRefreshToken);

module.exports = router;