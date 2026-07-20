const express = require("express");
const {
  getAll,
  getToday,
  createEntry,
  deleteEntry,
} = require("../controllers/journalController");
const { protect } = require("../middleware/auth");

const router = express.Router();
router.use(protect);

router.get("/", getAll);
router.get("/today", getToday);
router.post("/", createEntry);
router.delete("/:id", deleteEntry);

module.exports = router;
