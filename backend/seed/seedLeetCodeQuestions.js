const mongoose = require("mongoose");
const XLSX = require("xlsx");
const path = require("path");
const dotenv = require("dotenv");

const LeetCodeQuestion = require("../models/LeetCodeQuestion");

dotenv.config();

async function seedQuestions() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const workbook = XLSX.readFile(
      path.join(__dirname, "Structured_LeetCode_100_Plus_Roadmap.xlsx")
    );

    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet);

    await LeetCodeQuestion.deleteMany();

    const questions = rows.map((row) => {
      const lcKey = Object.keys(row).find(
        (k) =>
          k.trim().toLowerCase().includes("leetcode") ||
          k.trim().includes("#") ||
          k.trim().toLowerCase() === "lc"
      );

      const rawLcNumber = lcKey ? row[lcKey] : undefined;
      const parsedLcNumber = Number(rawLcNumber);

      return {
        phase: Number(row["Phase"] || row["phase"] || 1),
        topic: row["Topic"] || row["topic"] || "General",
        leetcodeNumber: Number.isNaN(parsedLcNumber) ? 0 : parsedLcNumber,
        problemName:
          row["Problem Name"] || row["problemName"] || "Untitled Problem",
        difficulty: row["Difficulty"] || row["difficulty"] || "Easy",
        pattern: row["Pattern/Skill"] || row["pattern"] || "Misc",
        approach: "",
        notes: row["Notes"] || row["notes"] || "",
        isActive: true,
      };
    });

    await LeetCodeQuestion.insertMany(questions);

    console.log(`Imported ${questions.length} questions.`);
  } catch (err) {
    console.error("Seeding failed:", err);
  } finally {
    await mongoose.connection.close();
  }
}

seedQuestions();