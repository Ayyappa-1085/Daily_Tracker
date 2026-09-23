import { useEffect, useState } from "react";
import { Utensils } from "lucide-react";
import { getCache, setCache } from "../utils/cache";

export default function Habits({
  habits,
  recordHabit,
  HabitEntryRow,
  meals = [],
  user,
  api,
  localDate,
}) {
  const today = localDate ? localDate() : new Date().toISOString().slice(0, 10);
  const userId = user?.id || user?._id;
  const cachedMeals = userId
    ? getCache(`focusday_cache_${userId}_meals_${today}`)
    : null;
  const [fetchedMeals, setFetchedMeals] = useState([]);

  useEffect(() => {
    if (!cachedMeals && !meals.length && api) {
      api(`/meals?date=${today}`)
        .then((fresh) => {
          if (Array.isArray(fresh)) {
            setFetchedMeals(fresh);
            if (userId)
              setCache(`focusday_cache_${userId}_meals_${today}`, fresh);
          }
        })
        .catch(() => {});
    }
  }, [today, userId, api, cachedMeals, meals.length]);

  const activeMeals = cachedMeals || (meals.length ? meals : fetchedMeals);
  const completedMealsCount = Array.isArray(activeMeals)
    ? activeMeals.filter((m) => m.completed).length
    : 0;

  const mealsHabit = {
    _id: "habit-meals-row",
    key: "meals",
    name: "Meals",
    target: 5,
    color: "#e25545",
    value: completedMealsCount,
    display:
      completedMealsCount === 0
        ? "No data recorded"
        : `${completedMealsCount} / 5 completed`,
  };

  const stepsIndex = habits.findIndex(
    (h) => h.name === "Steps" || h.key === "steps",
  );
  const displayedHabits = habits.length ? [...habits] : [];
  if (habits.length) {
    if (stepsIndex !== -1) {
      displayedHabits.splice(stepsIndex + 1, 0, mealsHabit);
    } else {
      displayedHabits.push(mealsHabit);
    }
  }

  return (
    <div className="page habits-page">
      <div className="page-title">
        <span className="eyebrow">MEASURE WHAT MATTERS</span>
        <h1>Habits</h1>
        <p>Small records add up to a useful picture of your day.</p>
      </div>
      <section className="panel habits-list">
        {habits.length ? (
          displayedHabits.map((habit) =>
            habit.key === "meals" ? (
              <div className="habit-entry-row" key="meals-habit-row">
                <span className="habit-icon" style={{ color: habit.color }}>
                  <Utensils size={18} strokeWidth={2.1} />
                </span>
                <div className="habit-entry-name">
                  <strong>{habit.name}</strong>
                  <small>Target: {habit.target} meals</small>
                </div>
                <div className="habit-input-wrap">
                  <span style={{ color: "var(--muted)", fontSize: "11px" }}>
                    Tracked in Meals
                  </span>
                </div>
                <div className="habit-entry-result">
                  <strong>{habit.display}</strong>
                  {completedMealsCount === 5 && (
                    <small className="status-positive">Completed</small>
                  )}
                  <div className="progress">
                    <i
                      style={{
                        width: `${(completedMealsCount / 5) * 100}%`,
                        background: habit.color,
                      }}
                    />
                  </div>
                </div>
                <div style={{ minWidth: 50 }} />
              </div>
            ) : (
              <HabitEntryRow
                key={habit._id}
                habit={habit}
                onRecord={recordHabit}
              />
            ),
          )
        ) : (
          <p className="empty-state">No habits available.</p>
        )}
      </section>
    </div>
  );
}
