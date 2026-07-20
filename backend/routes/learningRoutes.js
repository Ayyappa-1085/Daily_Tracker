const express = require("express");

const router = express.Router();

const { protect } = require("../middleware/auth");

const {
  getAllQuestions,
  getQuestionById,
  setCurrentQuestion,
  updateProgress,
  getLearningProgress,
  saveQuestionNotes,
} = require("../controllers/learningController");
router.get("/questions", protect, getAllQuestions);

router.get("/question/:id", protect, getQuestionById);

router.patch("/current/:id", protect, setCurrentQuestion);

router.patch("/progress/:id", protect, updateProgress);

router.patch("/question-notes/:id", protect, saveQuestionNotes);

router.get("/progress", protect, getLearningProgress);

module.exports = router;
