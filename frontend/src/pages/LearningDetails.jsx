import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, ExternalLink } from "lucide-react";
import api from "../api/axios";
import { API_BASE_URL } from "../api/axios";

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
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem("ascend_token");
        const response = await fetch(`${API_BASE_URL}/learning/question/${id}`, {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || "Failed to load question.");
        }

        const data = await response.json();
        setQuestion(data);
        setDraftApproach(data.approach || "");
        setDraftNotes(data.notes || "");
        setSaveStatus("Saved");
        setSaveError(null);
        setIsDirty(false);

        await api.patch(`/learning/current/${id}`);
      } catch (err) {
        setQuestion(null);
        setSaveError(err.message || "Failed to load question.");
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

      if (data.nextQuestion) {
        navigate(`/learning/${data.nextQuestion}`);
      }
    } finally {
      setUpdating(false);
    }
  }

  function handleOpenInLeetCode() {
    const source =
      question.leetcodeUrl ??
      question.leetcodeSlug ??
      question.url ??
      question.slug ??
      question.problemName ??
      "";

    const leetcodeTarget = source.startsWith("http")
      ? source
      : source
          .toString()
          .normalize("NFKD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "");

    if (!leetcodeTarget) return;

    const targetUrl = leetcodeTarget.startsWith("http")
      ? leetcodeTarget
      : `https://leetcode.com/problems/${leetcodeTarget}/`;

    window.open(targetUrl, "_blank", "noopener,noreferrer");
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
      <div className="px-4 py-6 text-sm text-ink-400 sm:px-6 sm:py-8">
        Loading question...
      </div>
    );

  if (!question)
    return (
      <div className="px-4 py-6 text-sm text-ink-400 sm:px-6 sm:py-8">
        Question not found.
      </div>
    );

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
      <button
        onClick={() => navigate("/learning")}
        className="mb-6 flex items-center gap-2 text-sm font-medium text-ink-400 transition hover:text-ink-50"
      >
        <ArrowLeft size={16} />
        Back to Learning
      </button>

      <section>
        <div className="mt-1 flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-ink-500">
              LeetCode #{question.leetcodeNumber}
            </p>

            <h1 className="mt-1 max-w-4xl break-words text-2xl font-bold leading-tight tracking-tight text-ink-50 sm:text-3xl md:text-4xl">
              {question.problemName}
            </h1>
          </div>

          <button
            type="button"
            onClick={handleOpenInLeetCode}
            aria-label="Open in LeetCode"
            className="mt-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-[#ffa116] transition hover:opacity-80 dark:border-base-700/60 dark:bg-base-900/80"
          >
            <ExternalLink size={16} />
          </button>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-ink-400">
          <span>{question.topic}</span>

          <span className="opacity-40">•</span>

          <span>{question.difficulty}</span>

          <span className="opacity-40">•</span>

          <span>{question.pattern}</span>
        </div>

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
              className="w-full rounded-full bg-ink-50 px-6 py-3 text-sm font-semibold text-base-950 transition hover:opacity-90 disabled:opacity-50 sm:w-auto"
            >
              {updating ? "Updating..." : "Mark as Completed"}
            </button>
          )}
        </div>
      </section>

      <div className="my-6 border-t border-base-800" />

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
px-4 py-4
text-sm leading-7
text-slate-800
placeholder:text-slate-400
outline-none transition
focus:border-slate-400
focus:ring-2 focus:ring-slate-200
sm:px-5
dark:border-base-700/60
dark:bg-base-900
dark:text-ink-200
dark:placeholder:text-ink-500
dark:focus:border-base-600
dark:focus:ring-base-600"
        />
      </section>

      <div className="my-3 border-t border-base-800" />

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
px-4 py-4
text-sm leading-7
text-slate-800
placeholder:text-slate-400
outline-none transition
focus:border-slate-400
focus:ring-2 focus:ring-slate-200
sm:px-5
dark:border-base-700/60
dark:bg-base-900
dark:text-ink-200
dark:placeholder:text-ink-500
dark:focus:border-base-600
dark:focus:ring-base-600"
        />

        <p className="flex flex-wrap items-center gap-2 text-xs text-ink-500">
          {!saveError && <CheckCircle2 size={13} />}
          {saveError || "Saved automatically"}
        </p>
      </section>
    </div>
  );
}