const express = require("express");
const {
  getAll,
  getToday,
  createEntry,
  updateEntry,
  deleteEntry,
} = require("../controllers/journalController");
const { protect } = require("../middleware/auth");

const router = express.Router();
router.use(protect);

router.get("/", getAll);
router.get("/today", getToday);
router.post("/", createEntry);
router.patch("/:id", updateEntry);
router.delete("/:id", deleteEntry);

module.exports = router;
