const express = require("express");
const { protect } = require("../middleware/auth");
const { getProgress } = require("../controllers/progressController");

const router = express.Router();

router.get("/", protect, getProgress);

module.exports = router;