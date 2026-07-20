import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import api from "../api/axios";

export default function LearningDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [draftApproach, setDraftApproach] = useState("");
  const [draftNotes, setDraftNotes] = useState("");
  const [saveStatus, setSaveStatus] = useState("Saved");
  const [saveError, setSaveError] = useState(null);
  const [isDirty, setIsDirty] = useState(false);
  const saveTimer = useRef(null);

  useEffect(() => {
    async function fetchQuestion() {
      try {
        const { data } = await api.get(`/learning/question/${id}`);
        setQuestion(data);
        setDraftApproach(data.approach || "");
        setDraftNotes(data.notes || "");
        setSaveStatus("Saved");
        setSaveError(null);
        setIsDirty(false);
        await api.patch(`/learning/current/${id}`);
      } finally {
        setLoading(false);
      }
    }
    fetchQuestion();
  }, [id]);

  async function handleMarkCompleted() {
    try {
      setUpdating(true);
      const { data } = await api.patch(`/learning/progress/${id}`);

      setQuestion((p) => ({
        ...p,
        completed: true,
        current: false,
      }));

      // Optional: automatically open the next question
      if (data.nextQuestion) {
        navigate(`/learning/${data.nextQuestion}`);
      }
    } finally {
      setUpdating(false);
    }
  }

  useEffect(() => {
    if (!question || !isDirty) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        await api.patch(`/learning/question-notes/${id}`, {
          approach: draftApproach,
          notes: draftNotes,
        });
        setSaveStatus("Saved");
        setSaveError(null);
        setIsDirty(false);
      } catch (err) {
        setSaveStatus("Error saving");
        setSaveError(err.response?.data?.message || err.message);
      }
    }, 1000);
    return () => clearTimeout(saveTimer.current);
  }, [draftApproach, draftNotes, id, isDirty, question]);

  if (loading)
    return (
      <div className="px-6 py-8 text-sm text-ink-400">Loading question...</div>
    );

  if (!question)
    return (
      <div className="px-6 py-8 text-sm text-ink-400">Question not found.</div>
    );

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      {/* Back */}
      <button
        onClick={() => navigate("/learning")}
        className="mb-6 flex items-center gap-2 text-sm font-medium text-ink-400 transition hover:text-ink-50"
      >
        <ArrowLeft size={16} />
        Back to Learning
      </button>

      {/* Header */}
      <section>
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-ink-500">
          LeetCode #{question.leetcodeNumber}
        </p>

        <h1 className="mt-1 max-w-4xl text-3xl font-bold leading-tight tracking-tight text-ink-50 md:text-4xl">
          {question.problemName}
        </h1>

        {/* Meta */}
        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-ink-400">
          <span>{question.topic}</span>

          <span className="opacity-40">•</span>

          <span>{question.difficulty}</span>

          <span className="opacity-40">•</span>

          <span>{question.pattern}</span>
        </div>

        {/* Button */}
        <div className="mt-4">
          {question.completed ? (
            <span
              className="inline-flex items-center gap-2 rounded-full
  border border-emerald-200
  bg-emerald-50
  px-4 py-2
  text-xs font-semibold
  text-emerald-700
  dark:border-emerald-800/40
  dark:bg-emerald-950/30
  dark:text-emerald-400"
            >
              <CheckCircle2
                size={14}
                className="text-emerald-600 dark:text-emerald-400"
              />
              Completed
            </span>
          ) : (
            <button
              onClick={handleMarkCompleted}
              disabled={updating}
              className="rounded-full bg-ink-50 px-6 py-3 text-sm font-semibold text-base-950 transition hover:opacity-90 disabled:opacity-50"
            >
              {updating ? "Updating..." : "Mark as Completed"}
            </button>
          )}
        </div>
      </section>

      <div className="my-6 border-t border-base-800" />

      {/* Approach */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-ink-50">Approach</h2>

          <p className="mt-1 text-sm text-ink-500">
            Short explanation of your algorithm.
          </p>
        </div>

        <textarea
          value={draftApproach}
          onChange={(e) => {
            setDraftApproach(e.target.value);
            setIsDirty(true);
            setSaveStatus("Saving...");
            setSaveError(null);
          }}
          rows={4}
          placeholder="Write your approach..."
          className="w-full resize-none rounded-2xl
border border-slate-200
bg-white
px-5 py-4
text-sm leading-7
text-slate-800
placeholder:text-slate-400
outline-none transition
focus:border-slate-400
focus:ring-2 focus:ring-slate-200
dark:border-base-700/60
dark:bg-base-900
dark:text-ink-200
dark:placeholder:text-ink-500
dark:focus:border-base-600
dark:focus:ring-base-600"
        />
      </section>

      <div className="my-3 border-t border-base-800" />

      {/* Notes */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-ink-50">Notes</h2>

          <p className="mt-1 text-sm text-ink-500">
            Write everything you learned from solving this problem.
          </p>
        </div>

        <textarea
          value={draftNotes}
          onChange={(e) => {
            setDraftNotes(e.target.value);
            setIsDirty(true);
            setSaveStatus("Saving...");
            setSaveError(null);
          }}
          rows={11}
          placeholder="Write your notes..."
          className="w-full resize-none rounded-2xl
border border-slate-200
bg-white
px-5 py-4
text-sm leading-7
text-slate-800
placeholder:text-slate-400
outline-none transition
focus:border-slate-400
focus:ring-2 focus:ring-slate-200
dark:border-base-700/60
dark:bg-base-900
dark:text-ink-200
dark:placeholder:text-ink-500
dark:focus:border-base-600
dark:focus:ring-base-600"
        />

        <p className="flex items-center gap-2 text-xs text-ink-500">
          {!saveError && <CheckCircle2 size={13} />}
          {saveError || "Saved automatically"}
        </p>
      </section>
    </div>
  );
}
