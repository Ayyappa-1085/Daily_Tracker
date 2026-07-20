import { useNavigate } from "react-router-dom";

export default function ContinueLearningCard({ question }) {
  const navigate = useNavigate();

  if (!question) {
    return (
      <section className="card flex flex-col p-6 h-full min-h-[220px]">
        <h3 className="text-sm font-medium text-ink-400">Continue Learning</h3>

        <div className="mt-4 flex-1">
          <h2 className="text-xl font-semibold text-ink-50">
            No Active Problem
          </h2>
          <p className="mt-2 text-sm text-ink-400">Start Learning</p>
        </div>

        <hr className="my-5 border-base-800" />

        <button
          onClick={() => navigate("/learning")}
          className="focus-ring w-full rounded-lg bg-ink-50 py-2.5 text-sm font-semibold text-base-950 transition-opacity hover:opacity-90"
        >
          Start Learning
        </button>
      </section>
    );
  }

  return (
    <section className="card flex flex-col p-6 h-full min-h-[220px]">
      <h3 className="text-sm font-medium text-ink-400">Continue Learning</h3>

      <div className="mt-4 flex-1">
        <h2 className="text-xl font-semibold text-ink-50">
          {question.problemName}
        </h2>

        <div className="mt-3 flex items-center justify-between">
          <span className="rounded bg-base-800 px-2 py-1 text-xs font-medium text-ink-200">
            {question.difficulty}
          </span>
          <span className="text-sm font-medium text-ink-400">
            LC #{question.leetcodeNumber}
          </span>
        </div>

        <p className="mt-2 text-sm text-ink-400">{question.topic}</p>
      </div>

      <hr className="my-5 border-base-800" />

      <button
        onClick={() => navigate(`/learning/${question._id}`)}
        className="focus-ring w-full rounded-lg bg-ink-50 py-2.5 text-sm font-semibold text-base-950 transition-opacity hover:opacity-90"
      >
        Continue Solving
      </button>
    </section>
  );
}
