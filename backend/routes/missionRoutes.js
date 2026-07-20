const express = require("express");
const {
  getToday,
  toggleMission,
  updateProgress,
  createMission,
  deleteMission,
} = require("../controllers/missionController");
const { protect } = require("../middleware/auth");

const router = express.Router();
router.use(protect);

router.get("/today", getToday);
router.post("/", createMission);
router.patch("/:id/toggle", toggleMission);
router.patch("/:id/progress", updateProgress);
router.delete("/:id", deleteMission);

module.exports = router;
