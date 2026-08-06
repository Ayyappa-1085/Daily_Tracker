const LeetCodeQuestion = require("../models/LeetCodeQuestion");
const UserLearningProgress = require("../models/UserLearningProgress");
const { awardXp } = require("../utils/gamification");
const { updateProgressHistory } = require("../utils/progressService");
const { getCache, setCache, clearUserCache } = require("../utils/cache");

// GET /api/learning/questions
async function getAllQuestions(req, res, next) {
  try {
    const userId = req.user._id;
    const cacheKey = `learning:${userId}:questions`;
    const cached = getCache(cacheKey);

    if (cached) {
      return res.json(cached);
    }

    const questions = await LeetCodeQuestion.find({ isActive: true })
      .select("leetcodeNumber problemName topic difficulty pattern estimatedTime xp")
      .sort({ phase: 1, leetcodeNumber: 1 })
      .lean();

    const progress = await UserLearningProgress.findOne({
      user: userId,
    })
      .select("completedQuestions currentQuestion")
      .lean();

    const completedIds = new Set(
      (progress?.completedQuestions || []).map((id) => id.toString()),
    );

    const currentId = progress?.currentQuestion?.toString();

    const result = questions.map((question) => ({
      ...question,
      completed: completedIds.has(question._id.toString()),
      current: currentId === question._id.toString(),
    }));

    setCache(cacheKey, result, 30 * 1000);

    res.json(result);
  } catch (err) {
    next(err);
  }
}

// GET /api/learning/question/:id
async function getQuestionById(req, res, next) {
  try {
    const userId = req.user._id;

    const question = await LeetCodeQuestion.findById(req.params.id)
      .select("leetcodeNumber problemName topic difficulty pattern estimatedTime xp approach notes")
      .lean();

    if (!question) {
      return res.status(404).json({
        message: "Question not found",
      });
    }

    const progress = await UserLearningProgress.findOne({
      user: userId,
    });

    const completed = progress?.completedQuestions.some(
      (id) => id.toString() === question._id.toString(),
    );

    const current =
      progress?.currentQuestion?.toString() === question._id.toString();

    const noteEntry = progress?.questionNotes?.find(
      (entry) => entry.question.toString() === question._id.toString(),
    );

    const displayNumber =
      question.leetcodeNumber ?? question.questionNumber ?? question.problemNumber ?? question.id ?? null;

    const displayTitle =
      question.problemName ?? question.title ?? question.name ?? question.questionTitle ?? "Unknown Problem";

    res.json({
      ...question,
      leetcodeNumber: displayNumber,
      problemName: displayTitle,
      questionNumber: displayNumber,
      questionTitle: displayTitle,
      completed,
      current,
      approach: noteEntry?.approach || "",
      notes: noteEntry?.notes || "",
    });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/learning/question-notes/:id
async function saveQuestionNotes(req, res, next) {
  try {
    const userId = req.user._id;
    const questionId = req.params.id;
    const { approach = "", notes = "" } = req.body;

    let progress = await UserLearningProgress.findOne({ user: userId });
    if (!progress) {
      progress = await UserLearningProgress.create({ user: userId });
    }

    progress.questionNotes = progress.questionNotes || [];

    const noteEntry = progress.questionNotes.find(
      (entry) => entry.question.toString() === questionId,
    );

    if (noteEntry) {
      noteEntry.approach = approach;
      noteEntry.notes = notes;
    } else {
      progress.questionNotes.push({
        question: questionId,
        approach,
        notes,
      });
    }

    await progress.save();
    clearUserCache(userId);

    res.json({
      approach,
      notes,
    });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/learning/current/:id
async function setCurrentQuestion(req, res, next) {
  try {
    const userId = req.user._id;
    const questionId = req.params.id;

    let progress = await UserLearningProgress.findOne({ user: userId });
    if (!progress) {
      progress = await UserLearningProgress.create({ user: userId });
    }

    progress.currentQuestion = questionId;
    await progress.save();
    clearUserCache(userId);

    res.json(progress);
  } catch (err) {
    next(err);
  }
}

// PATCH /api/learning/progress/:id
async function updateProgress(req, res, next) {
  try {
    const userId = req.user._id;
    const questionId = req.params.id;

    let progress = await UserLearningProgress.findOne({
      user: userId,
    });

    if (!progress) {
      progress = await UserLearningProgress.create({
        user: userId,
      });
    }

    // Prevent duplicate completion
    const alreadyCompleted = progress.completedQuestions.some(
      (id) => id.toString() === questionId
    );

    if (!alreadyCompleted) {
      progress.completedQuestions.push(questionId);

      // Award XP only once
      awardXp(req.user, 50);
      await req.user.save();
    }

    // Find next incomplete question
    const completedIds = progress.completedQuestions.map((id) => id.toString());

    const nextQuestion = await LeetCodeQuestion.findOne({
      isActive: true,
      _id: { $nin: completedIds },
    }).sort({
      phase: 1,
      leetcodeNumber: 1,
    });

    progress.currentQuestion = nextQuestion ? nextQuestion._id : null;

    const totalQuestions = await LeetCodeQuestion.countDocuments({
      isActive: true,
    });

    progress.progress = Math.round(
      (progress.completedQuestions.length / totalQuestions) * 100
    );

    await progress.save();
    clearUserCache(userId);

    await updateProgressHistory(req.user);

    res.json({
      success: true,
      nextQuestion: nextQuestion?._id || null,
      progress,
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/learning/progress
async function getLearningProgress(req, res, next) {
  try {
    const userId = req.user._id;

    const total = await LeetCodeQuestion.countDocuments({
      isActive: true,
    });

    const progress = await UserLearningProgress.findOne({
      user: userId,
    });

    // Cross-verify items inside array against your active question set to eliminate zombie ids
    let completed = 0;
    if (progress && progress.completedQuestions.length > 0) {
      completed = await LeetCodeQuestion.countDocuments({
        _id: { $in: progress.completedQuestions },
        isActive: true,
      });
    }

    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    res.json({
      progress: percentage,
      completed,
      total,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAllQuestions,
  getQuestionById,
  setCurrentQuestion,
  updateProgress,
  getLearningProgress,
  saveQuestionNotes,
};
