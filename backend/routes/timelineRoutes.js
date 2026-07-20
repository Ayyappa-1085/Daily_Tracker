const express = require("express");
const {
  getToday,
  updateStatus,
  createEvent,
} = require("../controllers/timelineController");
const { protect } = require("../middleware/auth");

const router = express.Router();
router.use(protect);

router.get("/today", getToday);
router.post("/", createEvent);
router.patch("/:id/status", updateStatus);

module.exports = router;
