import { useEffect, useMemo, useState } from "react";
import { useLearningStore } from "../store/useLearningStore";
import LearningHeader from "../components/learning/LearningHeader";
import LearningTable from "../components/learning/LearningTable";

export default function Learning() {
  const {
    questions,
    progress,
    status,
    error,
    fetchLearning,
  } = useLearningStore();

  const [search, setSearch] = useState("");
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("");

  useEffect(() => {
    fetchLearning();
  }, [fetchLearning]);

  const loading = status === "loading" && questions.length === 0;

  const topics = useMemo(() => {
    return [...new Set(questions.map((q) => q.topic))].filter(Boolean);
  }, [questions]);

  const filteredQuestions = useMemo(() => {
    return questions.filter((question) => {
      const matchesSearch = (question.problemName || "")
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesTopic = !topic || question.topic === topic;

      const matchesDifficulty =
        !difficulty || question.difficulty === difficulty;

      return (
        matchesSearch &&
        matchesTopic &&
        matchesDifficulty
      );
    });
  }, [questions, search, topic, difficulty]);

  if (loading) {
    return (
      <div className="mx-auto flex min-h-[60vh] w-full max-w-7xl items-center justify-center px-4 py-8 sm:px-6">
        <p className="text-center text-sm font-medium tracking-wide text-ink-400">
          Loading Learning Roadmap...
        </p>
      </div>
    );
  }

  if (!Array.isArray(questions) || (!questions.length && error)) {
    return (
      <div className="mx-auto flex min-h-[60vh] w-full max-w-7xl items-center justify-center px-4 py-8 sm:px-6">
        <p className="text-center text-sm font-medium tracking-wide text-ink-400">
          Unable to load the learning roadmap right now.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4 transition-all duration-300 sm:gap-6 sm:px-6 sm:py-6 lg:px-8">
      <LearningHeader
        progress={progress}
        search={search}
        setSearch={setSearch}
        topic={topic}
        setTopic={setTopic}
        difficulty={difficulty}
        setDifficulty={setDifficulty}
        topics={topics}
      />

      <LearningTable
        questions={filteredQuestions}
      />
    </div>
  );
}