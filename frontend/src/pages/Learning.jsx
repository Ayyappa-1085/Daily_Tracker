import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import LearningHeader from "../components/learning/LearningHeader";
import LearningTable from "../components/learning/LearningTable";

export default function Learning() {
  const [questions, setQuestions] = useState([]);
  const [progress, setProgress] = useState({
    progress: 0,
    completed: 0,
    total: 0,
  });

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("");

  useEffect(() => {
    async function loadQuestions() {
      try {
        const { data } = await api.get("/learning/questions");
        setQuestions(data);

        const { data: progressData } = await api.get("/learning/progress");
        setProgress(progressData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadQuestions();
  }, []);

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
      <div className="mx-auto flex min-h-[60vh] w-full max-w-7xl items-center justify-center px-6 py-8">
        <p className="text-sm font-medium tracking-wide text-ink-400">
          Loading Learning Roadmap...
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-6 transition-all duration-300 lg:px-8">
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