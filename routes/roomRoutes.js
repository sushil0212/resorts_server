/* const express = require('express');
const { getRooms, checkAvailability } = require('../controller/roomController');
const router = express.Router();

router.get('/', getRooms);
router.post('/check-availability', checkAvailability);

module.exports = router;
 */

const express = require("express");
const router = express.Router();
const {
  getRooms,
  checkAvailability,
  getRoomById,
} = require("../controller/roomController"); // Fixed path to "controllers"

router.get("/", getRooms);
router.get("/:id", getRoomById);
router.post("/check-availability", checkAvailability);

module.exports = router;
