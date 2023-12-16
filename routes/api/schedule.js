const express =require('express')
const router = express.Router()
const scheduleController = require('../../controllers/scheduleController')

const verifyJWT = require('../../middleware/verifyJWT')

router.use(verifyJWT)
router.route('/own').get(scheduleController.getOwnSchedule)
router.route('/pending').get(scheduleController.getPendingChangeSchedule)
router.route('/create').post(scheduleController.createSchedule)
router.route('/delete').delete(scheduleController.deleteSchedule)
router.route('/update').patch(scheduleController.updateSchedule)

module.exports = router