import { useEffect, useState } from "react";
import {
  CalendarDays,
  Check,
  ChevronRight,
  MoreHorizontal,
  Scale,
} from "lucide-react";
import { getCache, setCache } from "../utils/cache";
import { mutationQueue } from "../utils/mutationQueue";
import oatsImage from "../assets/meal-oats.svg";
import tiffinImage from "../assets/meal-tiffin.svg";
import lunchImage from "../assets/meal-lunch.svg";
import proteinImage from "../assets/meal-protein.svg";
import dinnerImage from "../assets/meal-dinner.svg";

const mealImages = {
  oats: oatsImage,
  tiffin: tiffinImage,
  lunch: lunchImage,
  protein: proteinImage,
  dinner: dinnerImage,
};
const mealDate = (value) => {
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(date);
};
const shiftDate = (value, offset) => {
  const date = new Date(`${value}T12:00:00`);
  date.setDate(date.getDate() + offset);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};
const formatWeight = (value) =>
  value === null || value === undefined
    ? "No data"
    : `${Number(value).toFixed(1)} kg`;

export default function Meals({
  user,
  setError,
  api,
  localDate,
  onMealsUpdated,
}) {
  const today = localDate();
  const userId = user?.id || user?._id;
  const [selectedDate, setSelectedDate] = useState(today);
  const [meals, setMeals] = useState([]);
  const [mealAnalytics, setMealAnalytics] = useState(null);
  const [weights, setWeights] = useState([]);
  const [weightInput, setWeightInput] = useState("");
  const [weightPeriod, setWeightPeriod] = useState("28");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const loadMeals = async () => {
      setLoading(true);
      try {
        const cached = userId
          ? getCache(`focusday_cache_${userId}_meals_${selectedDate}`)
          : null;
        if (cached) setMeals(cached);
        const freshMeals = await api(`/meals?date=${selectedDate}`);
        if (!cancelled) {
          const reconciledMeals = freshMeals.map((m) => {
            const pending = mutationQueue.getPending(
              `meal:${m.key}:${selectedDate}`,
            );
            return pending ? { ...m, ...pending } : m;
          });
          setMeals(reconciledMeals);
          if (userId)
            setCache(
              `focusday_cache_${userId}_meals_${selectedDate}`,
              reconciledMeals,
            );
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    const loadNutrition = async () => {
      try {
        const weightStart = shiftDate(today, -27);
        const [analyticsData, weightData] = await Promise.all([
          api("/meals/analytics/summary"),
          api(`/weight?start=${weightStart}&end=${today}`),
        ]);
        if (!cancelled) {
          setMealAnalytics(analyticsData);
          const pendingWeight = mutationQueue.getPending(`weight:${today}`);
          let reconciledWeights = weightData;
          if (pendingWeight) {
            reconciledWeights = [
              ...weightData.filter((r) => r.date !== today),
              pendingWeight,
            ].sort((a, b) => a.date.localeCompare(b.date));
          }
          setWeights(reconciledWeights);
          const currentWeight = reconciledWeights.find(
            (record) => record.date === today,
          );
          setWeightInput(currentWeight ? String(currentWeight.weight) : "");
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      }
    };
    loadMeals();
    loadNutrition();
    return () => {
      cancelled = true;
    };
  }, [selectedDate, today, userId, setError, api]);

  const isPastDate = selectedDate < today;
  const isToday = selectedDate === today;
  const isFutureDate = selectedDate > today;

  const toggleMeal = (meal) => {
    if (!isToday) {
      if (isPastDate) {
        setError("Historical meals cannot be modified.");
      } else {
        setError("Cannot mark future meals as completed.");
      }
      return;
    }

    const nextCompleted = !meal.completed;
    const previousMeals = meals;
    const optimisticMeals = meals.map((item) =>
      item.key === meal.key
        ? {
            ...item,
            completed: nextCompleted,
            completedAt: nextCompleted ? new Date().toISOString() : null,
          }
        : item,
    );

    // 1. UPDATE UI IMMEDIATELY
    setMeals(optimisticMeals);
    if (isToday && onMealsUpdated) {
      onMealsUpdated(optimisticMeals);
    }
    setError("");

    // 2. UPDATE CACHE IMMEDIATELY
    if (userId) {
      setCache(
        `focusday_cache_${userId}_meals_${selectedDate}`,
        optimisticMeals,
      );
    }

    // 3. QUEUE BACKGROUND MUTATION
    mutationQueue.enqueue({
      userId,
      resourceKey: `meal:${meal.key}:${selectedDate}`,
      optimisticData: { completed: nextCompleted },
      execute: async () => {
        return await api(`/meals/${meal.key}`, {
          method: "PATCH",
          body: JSON.stringify({
            date: selectedDate,
            completed: nextCompleted,
          }),
        });
      },
      onSuccess: async (updated) => {
        setMeals((current) => {
          const next = current.map((item) =>
            item.key === updated.key ? updated : item,
          );
          if (userId)
            setCache(`focusday_cache_${userId}_meals_${selectedDate}`, next);
          if (isToday && onMealsUpdated) {
            onMealsUpdated(next);
          }
          return next;
        });
        api("/meals/analytics/summary")
          .then((fresh) => setMealAnalytics(fresh))
          .catch(() => {});
      },
      onRollback: (err) => {
        setMeals(previousMeals);
        if (userId) {
          setCache(
            `focusday_cache_${userId}_meals_${selectedDate}`,
            previousMeals,
          );
        }
        if (isToday && onMealsUpdated) {
          onMealsUpdated(previousMeals);
        }
        setError(err.message || "Failed to update meal.");
      },
    });
  };

  const saveWeight = (event) => {
    event.preventDefault();
    if (!isToday) {
      if (isPastDate) {
        setError("Historical weight records cannot be modified.");
      } else {
        setError("Future weight records cannot be created or modified.");
      }
      return;
    }
    const numericWeight = Number(weightInput);
    if (
      !Number.isFinite(numericWeight) ||
      numericWeight <= 0 ||
      numericWeight > 500
    ) {
      setError("Enter a valid weight.");
      return;
    }

    const previousWeights = weights;
    const optimisticRecord = {
      date: selectedDate,
      weight: numericWeight,
      userId,
    };
    const optimisticWeights = [
      ...weights.filter((record) => record.date !== selectedDate),
      optimisticRecord,
    ].sort((left, right) => left.date.localeCompare(right.date));

    // 1. UPDATE UI IMMEDIATELY
    setWeights(optimisticWeights);
    setError("");

    // 2. QUEUE BACKGROUND MUTATION
    mutationQueue.enqueue({
      userId,
      resourceKey: `weight:${selectedDate}`,
      optimisticData: optimisticRecord,
      execute: async () => {
        return await api("/weight", {
          method: "POST",
          body: JSON.stringify({
            date: selectedDate,
            weight: numericWeight,
          }),
        });
      },
      onSuccess: async (saved) => {
        setWeights((current) =>
          [
            ...current.filter((record) => record.date !== saved.date),
            saved,
          ].sort((left, right) => left.date.localeCompare(right.date)),
        );
      },
      onRollback: (err) => {
        setWeights(previousWeights);
        setError(err.message || "Failed to save weight.");
      },
    });
  };

  const completedMeals = meals.filter((meal) => meal.completed).length;
  const selectedWeight =
    weights.find((record) => record.date === selectedDate)?.weight ?? null;
  const yesterdayWeight =
    weights.find((record) => record.date === shiftDate(selectedDate, -1))
      ?.weight ?? null;
  const weekStart = shiftDate(
    selectedDate,
    -(new Date(`${selectedDate}T12:00:00`).getDay() === 0
      ? 6
      : new Date(`${selectedDate}T12:00:00`).getDay() - 1),
  );
  const weekWeights = weights.filter(
    (record) => record.date >= weekStart && record.date <= selectedDate,
  );
  const weekAverage = weekWeights.length
    ? weekWeights.reduce((sum, record) => sum + record.weight, 0) /
      weekWeights.length
    : null;
  const firstWeekWeight = weekWeights[0]?.weight ?? null;
  const latestWeekWeight = weekWeights[weekWeights.length - 1]?.weight ?? null;
  const weeklyWeightChange =
    firstWeekWeight !== null && latestWeekWeight !== null
      ? latestWeekWeight - firstWeekWeight
      : null;
  const chartRecords = weights.slice(-Number(weightPeriod));
  const chartValues = chartRecords.map((record) => record.weight);
  const chartMin = chartValues.length ? Math.min(...chartValues) - 1 : 0;
  const chartMax = chartValues.length ? Math.max(...chartValues) + 1 : 1;
  const chartRange = chartMax - chartMin || 1;
  const comparison = mealAnalytics
    ? mealAnalytics.today.completed - mealAnalytics.yesterday.completed
    : 0;
  const comparisonMessage = mealAnalytics
    ? comparison > 0
      ? `You completed ${comparison} more meal${comparison === 1 ? "" : "s"} than yesterday.`
      : comparison < 0
        ? `You completed ${Math.abs(comparison)} fewer meal${Math.abs(comparison) === 1 ? "" : "s"} than yesterday.`
        : "You completed the same number of meals as yesterday."
    : "Not enough data yet.";
  const metricCards = mealAnalytics
    ? [
        ["Today", mealAnalytics.today],
        ["Yesterday", mealAnalytics.yesterday],
        ["This Week", mealAnalytics.thisWeek],
        ["Last Week", mealAnalytics.lastWeek],
      ]
    : [];

  return (
    <section className="meals-page">
      <div className="meals-page-header">
        <div className="page-title">
          <span className="eyebrow">FUEL A BETTER YOU</span>
          <h1>Meals &amp; Nutrition</h1>
          <p>
            Track your meals, stay consistent, and see how your nutrition
            impacts your progress.
          </p>
        </div>
        <div className="meal-date-controls">
          <label className="meal-date-input">
            <CalendarDays size={15} />
            <input
              type="date"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
            />
          </label>
          <button
            className="icon-button meal-date-button"
            aria-label="Previous day"
            onClick={() => setSelectedDate(shiftDate(selectedDate, -1))}
          >
            <ChevronRight size={16} style={{ transform: "rotate(180deg)" }} />
          </button>
          <button
            className="icon-button meal-date-button"
            aria-label="Next day"
            onClick={() => setSelectedDate(shiftDate(selectedDate, 1))}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
      <div className="meals-section-heading">
        <div>
          <h2>
            {selectedDate === today
              ? "Today's Meals"
              : `${mealDate(selectedDate)} Meals`}
          </h2>
          <span>{completedMeals} / 5 meals completed</span>
        </div>
        <div className="meal-progress">
          <strong>{completedMeals}/5</strong>
          <span>meals completed</span>
          <i>
            <b style={{ width: `${completedMeals * 20}%` }} />
          </i>
        </div>
      </div>
      <div className="meal-card-grid">
        {meals.map((meal, index) => (
          <article
            className={`meal-card ${meal.completed ? "completed" : ""}`}
            key={meal.key}
          >
            <div className="meal-card-top">
              <span className="meal-number">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <strong>{meal.name}</strong>
                <small>{meal.scheduledTime}</small>
              </div>
              <MoreHorizontal size={16} color="#8290a7" />
            </div>
            <img
              src={mealImages[meal.imageKey]}
              alt={meal.name}
              className="meal-image"
            />
            <button
              className="meal-status"
              disabled={!isToday}
              title={
                isPastDate
                  ? "Historical meals cannot be modified"
                  : isFutureDate
                    ? "Cannot mark future meals as completed"
                    : undefined
              }
              style={
                !isToday ? { opacity: 0.65, cursor: "not-allowed" } : undefined
              }
              onClick={() => toggleMeal(meal)}
            >
              {meal.completed ? (
                <Check size={14} />
              ) : (
                <span className="meal-pending-dot" />
              )}
              {meal.completed
                ? "Completed"
                : isPastDate
                  ? "Missed"
                  : isFutureDate
                    ? "Future meal"
                    : "Mark completed"}
            </button>
          </article>
        ))}
        {loading && !meals.length && (
          <div className="meal-loading">Loading meals...</div>
        )}
      </div>
      <div className="meals-section-heading analytics-heading">
        <h2>Meal Analytics</h2>
        <span>Calculated from your meal records</span>
      </div>
      <div className="meal-metric-grid">
        {metricCards.map(([label, metric]) => (
          <article className="meal-metric-card" key={label}>
            <div
              className="meal-ring"
              style={{ "--ring-progress": `${metric.percentage * 3.6}deg` }}
            >
              <strong>
                {metric.completed}/{metric.expected}
              </strong>
            </div>
            <div>
              <strong>{label}</strong>
              <span>Meals Completed</span>
              <small>{metric.percentage}% consistency</small>
            </div>
          </article>
        ))}
      </div>
      <div className="meal-analytics-grid">
        <article className="ref-card meal-chart-card">
          <div className="ref-card-header">
            <h2 className="ref-card-title">Meal Consistency</h2>
            <span className="chart-period">This Week</span>
          </div>
          <div className="consistency-chart">
            {(mealAnalytics?.consistency || []).map((day) => (
              <div className="consistency-column" key={day.date}>
                <div className="consistency-bar">
                  <span style={{ height: `${day.completed * 20}%` }} />
                </div>
                <small>
                  {new Intl.DateTimeFormat("en-US", {
                    weekday: "short",
                  }).format(new Date(`${day.date}T12:00:00`))}
                </small>
                <strong>{day.completed}/5</strong>
              </div>
            ))}
          </div>
        </article>
        <article className="ref-card weight-card">
          <div className="ref-card-header">
            <h2 className="ref-card-title">Weight Tracking</h2>
            <select
              className="chart-period"
              value={weightPeriod}
              onChange={(event) => setWeightPeriod(event.target.value)}
            >
              <option value="7">Last 7 Days</option>
              <option value="28">Last 4 Weeks</option>
            </select>
          </div>
          <div className="weight-chart">
            {chartRecords.length ? (
              chartRecords.map((record, index) => (
                <div
                  className="weight-point"
                  key={record.date}
                  style={{
                    left: `${chartRecords.length === 1 ? 50 : (index / (chartRecords.length - 1)) * 100}%`,
                    bottom: `${((record.weight - chartMin) / chartRange) * 78 + 12}%`,
                  }}
                  title={`${record.date}: ${formatWeight(record.weight)}`}
                >
                  <span>
                    {index === chartRecords.length - 1
                      ? formatWeight(record.weight)
                      : ""}
                  </span>
                </div>
              ))
            ) : (
              <span className="empty-state">No weight data yet.</span>
            )}
          </div>
          <form className="weight-entry" onSubmit={saveWeight}>
            <Scale size={21} color="#2878ea" />
            <label>
              <span>
                {selectedDate === today
                  ? "Today's Weight"
                  : isFutureDate
                    ? `${mealDate(selectedDate)} Weight — Future weight cannot be recorded`
                    : `${mealDate(selectedDate)} Weight — Historical`}
              </span>
              <div>
                <input
                  required={isToday}
                  disabled={!isToday}
                  min="0.1"
                  max="500"
                  step="0.1"
                  type="number"
                  value={
                    isToday
                      ? weightInput
                      : selectedWeight !== null
                        ? String(selectedWeight)
                        : ""
                  }
                  onChange={(event) => setWeightInput(event.target.value)}
                  placeholder={
                    isPastDate
                      ? "No weight recorded"
                      : isFutureDate
                        ? "Future weight cannot be recorded"
                        : "74.2"
                  }
                  title={
                    isPastDate
                      ? "Historical weight records cannot be modified"
                      : isFutureDate
                        ? "Future weight cannot be recorded"
                        : undefined
                  }
                  style={
                    !isToday
                      ? { cursor: "not-allowed", opacity: 0.75 }
                      : undefined
                  }
                />
                <b>kg</b>
              </div>
            </label>
            <button
              className="primary-button"
              disabled={!isToday}
              title={
                isPastDate
                  ? "Historical weight records cannot be modified"
                  : isFutureDate
                    ? "Future weight cannot be recorded"
                    : undefined
              }
              style={
                !isToday ? { cursor: "not-allowed", opacity: 0.65 } : undefined
              }
              type="submit"
            >
              {isPastDate
                ? "Historical"
                : isFutureDate
                  ? "Future date"
                  : "Save"}
            </button>
          </form>
        </article>
        <article className="ref-card weight-summary-card">
          <div className="ref-card-header">
            <h2 className="ref-card-title">Weight Summary</h2>
          </div>
          <div className="weight-summary-row">
            <span>Today</span>
            <strong>{formatWeight(selectedWeight)}</strong>
          </div>
          <div className="weight-summary-row">
            <span>Yesterday</span>
            <strong>{formatWeight(yesterdayWeight)}</strong>
          </div>
          <div className="weight-summary-row">
            <span>Week Average</span>
            <strong>{formatWeight(weekAverage)}</strong>
          </div>
          <div className="weight-checkin">
            <strong>
              {weeklyWeightChange === null
                ? "No previous weight data"
                : `Weight change this week: ${weeklyWeightChange > 0 ? "+" : ""}${weeklyWeightChange.toFixed(1)} kg`}
            </strong>
            <span>Weekly check-in</span>
          </div>
        </article>
      </div>
      <article className="meal-checkin ref-card">
        <div>
          <span className="eyebrow">WEEKLY NUTRITION CHECK-IN</span>
          <h2>Meals and weight, clearly tracked.</h2>
        </div>
        <div className="checkin-stat">
          <strong>
            {mealAnalytics
              ? `${mealAnalytics.thisWeek.completed} / ${mealAnalytics.thisWeek.expected}`
              : "Not enough data yet."}
          </strong>
          <span>Meals completed</span>
        </div>
        <div className="checkin-stat">
          <strong>
            {mealAnalytics
              ? `${mealAnalytics.thisWeek.percentage}%`
              : "Not enough data yet."}
          </strong>
          <span>Meal consistency</span>
        </div>
        <div className="checkin-stat">
          <strong>{formatWeight(latestWeekWeight)}</strong>
          <span>Latest weight</span>
        </div>
      </article>
      <div className="meal-comparison">
        <strong>
          {mealAnalytics
            ? `${mealAnalytics.today.completed}/5 meals completed`
            : "Not enough data yet."}
        </strong>
        <span>
          {mealAnalytics
            ? comparisonMessage
            : "Record meals to see today versus yesterday."}
        </span>
      </div>
    </section>
  );
}
