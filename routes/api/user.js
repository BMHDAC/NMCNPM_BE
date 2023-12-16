const express = require('express');
const router = express.Router();
const usersController = require('../../controllers/usersController');
const verifyJWT = require('../../middleware/verifyJWT');

router.use(verifyJWT)
router.route('/all').get(usersController.getAllUser)
router.route('/update').patch(usersController.updateUsers)
router.route('/delete').delete(usersController.deleteUsers)


module.exports = router;